import os
import json
import requests
from typing import List, Optional
from sqlalchemy.orm import Session
from database import crud
from schemas.chat_schema import ChatResponse, CitationSource
from embeddings.embedding_generator import EmbeddingGenerator

class RAGService:

    def __init__(self):
        # We need the embedding generator to convert the user's question into math
        self.embedding_generator = EmbeddingGenerator()
        
        # Support multiple keys for load balancing (Key Rotation)
        keys_env = [
            os.getenv("GEMINI_API_KEY", "").strip(),
            os.getenv("GEMINI_API_KEY_2", "").strip(),
            os.getenv("GEMINI_API_KEY_3", "").strip()
        ]
        self.api_keys = [k for k in keys_env if k]
        self.current_key_idx = 0

    # ===================== ANSWER QUESTION =====================
    def answer_question(self, question: str, db: Session, document_ids: Optional[List[int]] = None, session_id: str = "anonymous", thread_id: Optional[int] = None) -> ChatResponse:
        # Check for simple greetings or general conversational intent to bypass vector lookup
        conversational_greetings = {"hi", "hello", "hey", "hola", "greetings", "yo", "sup", "good morning", "good afternoon", "good evening", "help", "who are you", "what can you do", "what is this"}
        cleaned_question = question.strip().lower().replace("?", "").replace("!", "")
        
        if cleaned_question in conversational_greetings:
            welcome_msg = (
                "Hello! I am your AI Electronics Engineering Assistant. "
                "You can select one or more datasheets from the library sidebar, and ask me questions about:\n\n"
                "*   **Electrical Specs:** Max voltage, current limit, power dissipation, operating temperatures.\n"
                "*   **Pinout Configurations:** Pin mappings, bus lines, interface registers.\n"
                "*   **Visual Diagrams:** Multi-modal analysis of schematics, pin maps, and footprint drawings."
            )
            return self._finalize_and_save(db, session_id, thread_id, question, welcome_msg, [])

        # 0. Enforce session isolation for documents
        from database.models import Document
        session_docs = db.query(Document.id).filter(Document.session_id == session_id).all()
        session_doc_ids = [d.id for d in session_docs]
        
        if document_ids:
            # Intersection: only allow searching requested documents if the user actually owns them
            safe_doc_ids = list(set(document_ids).intersection(set(session_doc_ids)))
        else:
            # Search all documents owned by the user
            safe_doc_ids = session_doc_ids

        # If user has no documents (or requested documents they don't own), bypass search
        if not safe_doc_ids:
            return self._finalize_and_save(
                db, session_id, thread_id, question, 
                "You haven't uploaded any datasheets yet, or you don't have access to the selected ones. Please upload a PDF first!", 
                []
            )

        # 1. Convert the user's question into a 384-dimensional vector
        print(f"Embedding question: '{question}'")
        question_vector = self.embedding_generator.generate_embedding(question)

        # 2. Search PostgreSQL (pgvector) for the top 40 most relevant chunks
        print("Searching database for relevant information...")
        # Since search_vectors returns distance as a tuple, we must fetch chunks explicitly
        from database.models import DocumentChunk
        search_results_tuples = crud.search_vectors(db=db, query_embedding=question_vector, document_ids=safe_doc_ids, k=40)
        
        search_results = []
        for chunk_id, distance in search_results_tuples:
            chunk = db.query(DocumentChunk).filter(DocumentChunk.id == chunk_id).first()
            if chunk:
                search_results.append((chunk, distance))

        from services.supabase_client import supabase

        # 3. Build citations directly from the DB results
        citations = []
        for chunk, distance in search_results:
            if distance is None:
                continue
            if len(citations) >= 25:
                break
                
            image_url = None
            if chunk.image:
                if supabase:
                    image_url = supabase.storage.from_("images").get_public_url(chunk.image.image_filename)
                else:
                    image_url = f"/images/{chunk.image.image_filename}"
                
            citations.append(CitationSource(
                document_id=chunk.document_id,
                document_name=chunk.document.filename if chunk.document else "Unknown",
                page_number=chunk.page_number,
                chunk_text=chunk.chunk_text,
                relevance_score=distance,
                image_url=image_url
            ))

        # 4. Check if the user query warrants visual image context
        visual_keywords = ["diagram", "drawing", "image", "schematic", "footprint", "package", "dimension", "size", "layout", "pinout", "circuit", "figure", "fig", "picture", "pin", "symbol"]
        question_lower = question.lower()
        needs_visual = any(keyword in question_lower for keyword in visual_keywords)

        # 5. Filter citations by a relevance threshold
        if citations:
            print(f"[RAG] Best match L2 distance: {citations[0].relevance_score:.4f}")
            
        valid_citations = []
        for c in citations:
            # If the user specifically asked for an image, allow a much looser semantic match (1.85) for image chunks
            if needs_visual and c.image_url:
                if c.relevance_score <= 1.85:
                    valid_citations.append(c)
            # Use strict text threshold (1.45) for regular text chunks
            elif c.relevance_score <= 1.45:
                valid_citations.append(c)

        if not valid_citations:
            return self._finalize_and_save(
                db, session_id, thread_id, question,
                "I couldn't find any relevant details in the uploaded datasheets for that query. Please ask a specific engineering question (e.g. about pin configuration, voltage ratings, or footprints).",
                []
            )

        # 6. Semantic Reranking: Re-score and sort the candidates using OpenRouter's Reranker
        reranked_citations = self._rerank_citations(question, valid_citations, top_n=5)
        
        # If query doesn't need images, strip them out so frontend and API ignore them
        if not needs_visual:
            for cite in reranked_citations:
                cite.image_url = None

        # 7. Combine the text from the top 5 reranked citations into one big string to show the AI
        context_text = "\n\n".join([
            f"From {cite.document_name} (Page {cite.page_number}):\n{cite.chunk_text}"
            for cite in reranked_citations
        ])

        # 8. Ask Gemini to read the context (and images) to answer the question
        answer = self._ask_gemini(question, context_text, reranked_citations)

        return self._finalize_and_save(db, session_id, thread_id, question, answer, reranked_citations)

    def _finalize_and_save(self, db, session_id, thread_id, question, answer, citations):
        # Create a new thread if one doesn't exist
        if not thread_id:
            title = question[:50] + ("..." if len(question) > 50 else "")
            new_thread = crud.create_chat_thread(db, session_id=session_id, title=title)
            thread_id = new_thread.id

        # Save the conversation into the PostgreSQL database for history
        crud.create_chat_entry(
            db=db,
            thread_id=thread_id,
            question=question,
            answer=answer,
            sources=json.dumps([cite.model_dump() for cite in citations]) if citations else None
        )

        # Return the final formatted response to the frontend
        return ChatResponse(
            question=question,
            answer=answer,
            sources=citations,
            thread_id=thread_id
        )

    def _rerank_citations(self, query: str, citations: List, top_n: int = 5) -> List:
        # NVIDIA OpenRouter Reranker has been removed as per user request.
        # Defaulting directly to the initial FAISS semantic similarity order.
        return citations[:top_n]

    # ===================== COMMUNICATE WITH GEMINI API =====================
    def _make_request_with_retry(self, model_name: str, payload: dict, max_retries=3) -> dict:
        import time
        for attempt in range(max_retries):
            try:
                current_key = self.api_keys[self.current_key_idx] if self.api_keys else ""
                url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={current_key}"
                
                response = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload)
                
                if response.status_code == 200:
                    return response.json()
                
                if response.status_code == 429:
                    if len(self.api_keys) > 1:
                        self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
                        print(f"Chat API Rate Limit hit (429) on {model_name}. Rotating to API Key {self.current_key_idx + 1}...")
                        time.sleep(1)
                        continue
                    else:
                        # Raise exception so that caller can try another model in the pool immediately
                        raise Exception("API Key Rate Limit Exceeded (429)")
                        
                if response.status_code >= 500:
                    print(f"Google Server Error ({response.status_code}) on {model_name}. Retrying in 1s...")
                    time.sleep(1)
                    continue
                    
                raise Exception(f"API Error {response.status_code}: {response.text}")

            except requests.exceptions.RequestException as e:
                print(f"Network error in Chat API for {model_name}: {str(e)}. Retrying in 1s...")
                time.sleep(1)
                
        raise Exception(f"Max retries exceeded for model {model_name}.")

    def _ask_gemini(self, question: str, context: str, citations: List) -> str:
        if not self.api_keys:
            return "ERROR: Gemini API Key is missing. Please set the GEMINI_API_KEY environment variable."

        prompt = f"""You are an expert Electronics Engineer AI assistant. You must answer user questions based strictly on the provided datasheet text.
Do NOT output internal thoughts, chain-of-thought, reasoning paragraphs, or scanning notes.
Do NOT start your answer with introductory phrases like 'Based on the drawings...' or 'Looking at the context...'.
Output the direct answer immediately.

DATASHEET CONTEXT:
<context>
{context}
</context>

USER QUESTION:
<question>
{question}
</question>

CRITICAL DIRECTIVE: You must output ONLY the final direct answer to the question using the provided context. 
Absolutely do NOT output your internal thoughts, chain of thought, scanning notes, or explanations of how you arrived at the answer. 
Do NOT use introductory filler like "Based on the provided context..." or "According to the datasheet...". Output the answer immediately.
If the context does not contain enough details, output exactly: "I don't have enough information to answer that based on the provided documents."
"""
        import base64
        multimodal_parts = [{"text": prompt}]
        
        # Attach image context if citations include diagrams
        attached_images = 0
        for cite in citations:
            if cite.image_url and attached_images < 2:
                try:
                    encoded_string = None
                    mime_type = "image/png"
                    
                    if cite.image_url.startswith("http"):
                        # Production: Fetch image from Supabase Storage URL
                        img_response = requests.get(cite.image_url, timeout=10)
                        if img_response.status_code == 200:
                            encoded_string = base64.b64encode(img_response.content).decode("utf-8")
                            # Detect MIME from URL
                            if ".jpg" in cite.image_url.lower() or ".jpeg" in cite.image_url.lower():
                                mime_type = "image/jpeg"
                    else:
                        # Development: Read from local disk
                        image_path = "storage" + cite.image_url
                        if os.path.exists(image_path):
                            with open(image_path, "rb") as image_file:
                                encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
                            if image_path.lower().endswith((".jpg", ".jpeg")):
                                mime_type = "image/jpeg"
                    
                    if encoded_string:
                        multimodal_parts.append({
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": encoded_string
                            }
                        })
                        attached_images += 1
                        print(f"[RAG] Attaching image citation: {cite.image_url}")
                except Exception as e:
                    print(f"Error loading image for multimodal chat: {e}")

        payload = {
            "contents": [{
                "role": "user",
                "parts": multimodal_parts
            }]
        }
        
        # Load balance API limits by using model rotation.
        # Enforcing single model as requested by user
        models_pool = [
            "models/gemini-3.1-flash-lite"
        ]

        for model in models_pool:
            try:
                print(f"[RAG] Attempting query generation using: {model}")
                data = self._make_request_with_retry(model, payload)
                answer = data['candidates'][0]['content']['parts'][0]['text']
                if answer:
                    return answer
            except Exception as e:
                print(f"[RAG WARNING] Model {model} failed or rate-limited: {str(e)}. Falling back...")
                continue
                
        return "Error: All available models in the rotation pool have exceeded rate limits. Please try again in a few minutes."

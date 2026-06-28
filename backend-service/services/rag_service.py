import os
import json
import requests
from typing import List, Optional
from sqlalchemy.orm import Session
from database import crud
from schemas.chat_schema import ChatResponse
from embeddings.embedding_generator import EmbeddingGenerator
from vector_db.faiss_manager import FAISSManager
from services.citation_service import CitationService

class RAGService:

    def __init__(self):
        # We need the embedding generator to convert the user's question into math
        self.embedding_generator = EmbeddingGenerator()
        # We need FAISS to search for the closest matching chunks
        self.faiss_manager = FAISSManager()
        
        # Support multiple keys for load balancing (Key Rotation)
        keys_env = [
            os.getenv("GEMINI_API_KEY", "").strip(),
            os.getenv("GEMINI_API_KEY_2", "").strip(),
            os.getenv("GEMINI_API_KEY_3", "").strip()
        ]
        self.api_keys = [k for k in keys_env if k]
        self.current_key_idx = 0

    # ===================== ANSWER QUESTION =====================
    def answer_question(self, question: str, db: Session, document_ids: Optional[List[int]] = None) -> ChatResponse:
        # 1. Convert the user's question into a 384-dimensional vector
        print(f"Embedding question: '{question}'")
        question_vector = self.embedding_generator.generate_embedding(question)

        # 2. Search FAISS for the top 40 most relevant chunks (Double the context window!)
        print("Searching database for relevant information...")
        search_results = self.faiss_manager.search(query_embedding=question_vector, k=40)

        # 3. Use the CitationService to convert those raw IDs into readable citations
        #    and filter them down to just the 5 best that match the document_ids
        citations = CitationService.build_citations(db=db, faiss_results=search_results, document_ids=document_ids)

        # 4. If FAISS found nothing, tell the user gracefully
        if not citations:
            return ChatResponse(
                question=question,
                answer="I'm sorry, I couldn't find any relevant information in the uploaded datasheets to answer your question.",
                sources=[]
            )

        # 5. Combine the text from the top citations into one big string to show the AI
        context_text = "\n\n".join([
            f"From {cite.document_name} (Page {cite.page_number}):\n{cite.chunk_text}"
            for cite in citations
        ])

        # 6. Ask Gemini to read the context (and images) to answer the question
        answer = self._ask_gemini(question, context_text, citations)

        # 7. Save the conversation into the SQLite database for history
        # We save the citations as a JSON string so SQLite can store it safely
        crud.create_chat_entry(
            db=db,
            question=question,
            answer=answer,
            sources=json.dumps([cite.model_dump() for cite in citations])
        )

        # 8. Return the final formatted response to the frontend
        return ChatResponse(
            question=question,
            answer=answer,
            sources=citations
        )

    # ===================== COMMUNICATE WITH GEMINI API =====================
    def _make_request_with_retry(self, payload: dict, max_retries=10) -> dict:
        import time
        for attempt in range(max_retries):
            try:
                current_key = self.api_keys[self.current_key_idx] if self.api_keys else ""
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key={current_key}"
                
                response = requests.post(url, headers={'Content-Type': 'application/json'}, json=payload)
                
                if response.status_code == 200:
                    return response.json()
                
                if response.status_code == 429:
                    # If we have multiple keys, switch to the next one instantly!
                    if len(self.api_keys) > 1:
                        self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
                        print(f"Chat API Rate Limit hit (429). Rotating to API Key {self.current_key_idx + 1}...")
                        time.sleep(1)
                        continue
                    else:
                        wait_time = 10 * (attempt + 1)
                        print(f"Chat API Rate Limit hit (429). Waiting {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                        
                if response.status_code >= 500:
                    print(f"Google Server Error ({response.status_code}). Retrying in 5s...")
                    time.sleep(5)
                    continue
                    
                raise Exception(f"API Error {response.status_code}: {response.text}")

            except requests.exceptions.RequestException as e:
                print(f"Network error in Chat API: {str(e)}. Retrying in 10s...")
                time.sleep(10)
                
        raise Exception("Max retries exceeded for Chat API.")

    def _ask_gemini(self, question: str, context: str, citations: List) -> str:
        if not self.api_keys:
            return "ERROR: Gemini API Key is missing. Please set the GEMINI_API_KEY environment variable."

        # We construct a strict prompt telling the AI to ONLY use our provided context
        prompt = f"""
You are an expert Electronics Engineer AI assistant.
Read the following extracted information from datasheets carefully.
If diagrams or images are provided, examine them closely.
Then, answer the user's question based strictly on this information.
If the information does not contain the answer, say "I don't have enough information to answer that based on the provided documents."

IMPORTANT INSTRUCTION: DO NOT output your internal reasoning, chain of thought, or scanning process. Output ONLY the final answer to the user's question directly, clearly, and concisely.

DATASHEET INFORMATION:
{context}

USER QUESTION:
{question}
"""
        import base64
        multimodal_parts = [{"text": prompt}]
        
        # If any of the retrieved citations are images, we attach them physically to the request!
        for cite in citations:
            if cite.image_url:
                # Map the web URL back to the physical hard drive path
                image_path = "storage" + cite.image_url
                try:
                    with open(image_path, "rb") as image_file:
                        encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
                        mime_type = "image/png"
                        if image_path.lower().endswith(".jpg") or image_path.lower().endswith(".jpeg"):
                            mime_type = "image/jpeg"
                        
                        multimodal_parts.append({
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": encoded_string
                            }
                        })
                except Exception as e:
                    print(f"Error loading image for multimodal chat: {e}")

        # This is the exact JSON format Google's servers require
        payload = {
            "contents": [{
                "parts": multimodal_parts
            }]
        }
        
        headers = {'Content-Type': 'application/json'}

        try:
            print("Sending context to Gemini API...")
            data = self._make_request_with_retry(payload)
            
            # Extract the text from the complex JSON response
            answer = data['candidates'][0]['content']['parts'][0]['text']
            return answer
            
        except Exception as e:
            return f"Error communicating with Gemini API: {str(e)}"

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
        # The Gemini API Key must be set in your environment variables for this to work
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        # The exact web address for the free Gemini 2.5 Flash model
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"

    # ===================== ANSWER QUESTION =====================
    def answer_question(self, question: str, db: Session, document_ids: Optional[List[int]] = None) -> ChatResponse:
        # 1. Convert the user's question into a 384-dimensional vector
        print(f"Embedding question: '{question}'")
        question_vector = self.embedding_generator.generate_embedding(question)

        # 2. Search FAISS for the top 20 most relevant chunks (so we have enough to filter)
        print("Searching database for relevant information...")
        search_results = self.faiss_manager.search(query_embedding=question_vector, k=20)

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

        # 6. Ask Gemini to read the context and answer the question
        answer = self._ask_gemini(question, context_text)

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
    # Uses standard Python requests, meaning ZERO external SDK installations are required!
    def _ask_gemini(self, question: str, context: str) -> str:
        if not self.api_key:
            return "ERROR: Gemini API Key is missing. Please set the GEMINI_API_KEY environment variable."

        # We construct a strict prompt telling the AI to ONLY use our provided context
        prompt = f"""
You are an expert Electronics Engineer AI assistant.
Read the following extracted information from datasheets carefully.
Then, answer the user's question based strictly on this information.
If the information does not contain the answer, say "I don't have enough information to answer that based on the provided documents."

DATASHEET INFORMATION:
{context}

USER QUESTION:
{question}
"""
        # This is the exact JSON format Google's servers require
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        headers = {'Content-Type': 'application/json'}

        try:
            print("Sending context to Gemini API...")
            response = requests.post(self.api_url, headers=headers, json=payload)
            
            # If the request was successful
            if response.status_code == 200:
                data = response.json()
                # Extract the text from the complex JSON response
                answer = data['candidates'][0]['content']['parts'][0]['text']
                return answer
            else:
                return f"API Error: {response.status_code} - {response.text}"
                
        except Exception as e:
            return f"Error communicating with Gemini API: {str(e)}"

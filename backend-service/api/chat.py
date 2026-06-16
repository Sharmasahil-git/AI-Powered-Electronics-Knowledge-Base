from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.connection import get_db
from database import crud
from schemas.chat_schema import ChatRequest, ChatResponse, ChatHistoryResponse
from services.rag_service import RAGService

# Create a FastAPI router for chat-related endpoints
router = APIRouter()

# ===================== ASK A QUESTION =====================
# The web address will be: POST /api/chat
# This is what gets called when the user types a question and hits 'Send'
@router.post("/", response_model=ChatResponse)
def ask_question(request: ChatRequest, db: Session = Depends(get_db)):
    # Instantiate the AI service fresh on every request so it reads the latest database
    rag_service = RAGService()
    
    # Make sure the user actually typed something
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
        
    # Pass the question to our RAG service, which handles the searching and AI generation
    # It returns a fully formatted ChatResponse containing the answer and citations
    # Pass the question AND the requested document IDs to the RAG service
    response = rag_service.answer_question(
        question=request.question, 
        db=db,
        document_ids=request.document_ids
    )
    
    return response


# ===================== GET CHAT HISTORY =====================
# The web address will be: GET /api/chat/history
# Used when the user opens the page and wants to see their past conversations
@router.get("/history", response_model=ChatHistoryResponse)
def get_chat_history(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    # Fetch all past conversations from the SQLite database
    history = crud.get_chat_history(db, skip=skip, limit=limit)
    
    # We count how many history items were returned
    total = len(history)
    
    return ChatHistoryResponse(
        total=total,
        history=history
    )

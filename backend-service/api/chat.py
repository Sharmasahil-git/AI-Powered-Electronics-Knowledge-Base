from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from typing import List

from database.connection import get_db
from database import crud
from schemas.chat_schema import (
    ChatRequest, ChatResponse, ChatThreadResponse, 
    ThreadListResponse, ChatHistoryResponse, RenameThreadRequest
)
from services.rag_service import RAGService
from services.rate_limiter import limiter

router = APIRouter()

# ===================== LIST CHAT THREADS =====================
@router.get("/threads", response_model=ThreadListResponse)
def get_threads(skip: int = 0, limit: int = 50, x_session_id: str = Header(default="anonymous"), db: Session = Depends(get_db)):
    threads = crud.get_chat_threads(db, session_id=x_session_id, skip=skip, limit=limit)
    return ThreadListResponse(
        total=len(threads),
        threads=threads
    )

# ===================== GET SINGLE THREAD =====================
@router.get("/threads/{thread_id}", response_model=ChatHistoryResponse)
def get_thread(thread_id: int, x_session_id: str = Header(default="anonymous"), db: Session = Depends(get_db)):
    thread = crud.get_chat_thread_by_id(db, thread_id, session_id=x_session_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found")
        
    messages = crud.get_thread_messages(db, thread_id)
    
    import json
    parsed_messages = []
    for msg in messages:
        msg_dict = {
            "id": msg.id,
            "question": msg.question,
            "answer": msg.answer,
            "timestamp": msg.timestamp,
            "sources": []
        }
        if msg.sources:
            try:
                msg_dict["sources"] = json.loads(msg.sources)
            except Exception:
                pass
        parsed_messages.append(msg_dict)
        
    return ChatHistoryResponse(
        thread=thread,
        messages=parsed_messages
    )

# ===================== RENAME THREAD =====================
@router.put("/threads/{thread_id}/rename", response_model=ChatThreadResponse)
def rename_thread(thread_id: int, request: RenameThreadRequest, x_session_id: str = Header(default="anonymous"), db: Session = Depends(get_db)):
    thread = crud.rename_chat_thread(db, thread_id, session_id=x_session_id, new_title=request.title)
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    return thread

# ===================== DELETE THREAD =====================
@router.delete("/threads/{thread_id}")
def delete_thread(thread_id: int, x_session_id: str = Header(default="anonymous"), db: Session = Depends(get_db)):
    success = crud.delete_chat_thread(db, thread_id, session_id=x_session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    return {"message": "Thread deleted"}

# ===================== PIN THREAD =====================
@router.put("/threads/{thread_id}/pin", response_model=ChatThreadResponse)
def pin_thread(thread_id: int, is_pinned: bool, x_session_id: str = Header(default="anonymous"), db: Session = Depends(get_db)):
    thread = crud.pin_chat_thread(db, thread_id, session_id=x_session_id, is_pinned=is_pinned)
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    return thread

# ===================== ASK A QUESTION =====================
@router.post("/", response_model=ChatResponse)
@limiter.limit("15/minute")
def ask_question(request: Request, body: ChatRequest, x_session_id: str = Header(default="anonymous"), db: Session = Depends(get_db)):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    rag_service = RAGService()
    
    # We pass the session_id so RAGService can ensure we only query this user's documents
    # and so it can save the ChatHistory to the correct session/thread.
    response = rag_service.answer_question(
        question=body.question, 
        db=db,
        document_ids=body.document_ids,
        session_id=x_session_id,
        thread_id=body.thread_id
    )
    
    return response

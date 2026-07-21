from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


# ===================== CHAT REQUEST =====================
class ChatRequest(BaseModel):
    question: str
    document_ids: Optional[List[int]] = None
    thread_id: Optional[int] = None


# ===================== CITATION SOURCE =====================
class CitationSource(BaseModel):
    document_id: int
    document_name: str
    page_number: int
    chunk_text: str
    relevance_score: float
    image_url: Optional[str] = None


# ===================== CHAT RESPONSE =====================
class ChatResponse(BaseModel):
    question: str
    answer: str
    sources: List[CitationSource]
    thread_id: int


# ===================== CHAT HISTORY ITEM =====================
class ChatHistoryItem(BaseModel):
    id: int
    question: str
    answer: str
    sources: Optional[List[CitationSource]] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# ===================== CHAT THREAD =====================
class ChatThreadResponse(BaseModel):
    id: int
    session_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    is_pinned: bool

    class Config:
        from_attributes = True


# ===================== THREAD LIST =====================
class ThreadListResponse(BaseModel):
    total: int
    threads: List[ChatThreadResponse]


# ===================== THREAD HISTORY RESPONSE =====================
class ChatHistoryResponse(BaseModel):
    thread: ChatThreadResponse
    messages: List[ChatHistoryItem]


# ===================== RENAME REQUEST =====================
class RenameThreadRequest(BaseModel):
    title: str

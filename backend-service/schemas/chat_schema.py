from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


# ===================== CHAT REQUEST =====================
# The shape of data the frontend sends when a user asks a question.
# 'question' is required — the user's actual question.
# 'document_ids' is optional — limits the search to specific documents.
# If not provided, the system searches across ALL uploaded documents.
class ChatRequest(BaseModel):
    question: str
    document_ids: Optional[List[int]] = None


# ===================== CITATION SOURCE =====================
# Represents one source that was used to build the AI's answer.
# Each citation points to a specific chunk from a specific document and page.
# This is what makes the answer "traceable" — users can verify the AI's claims.
class CitationSource(BaseModel):
    document_id: int
    document_name: str
    page_number: int
    chunk_text: str
    relevance_score: float


# ===================== CHAT RESPONSE =====================
# The complete response sent back to the frontend after a question is answered.
# Contains the AI-generated answer plus a list of citations showing where
# the information came from. This is the core output of the RAG pipeline.
class ChatResponse(BaseModel):
    question: str
    answer: str
    sources: List[CitationSource]


# ===================== CHAT HISTORY ITEM =====================
# Represents a single past Q&A entry from the database.
# Used when the frontend loads previous conversations.
class ChatHistoryItem(BaseModel):
    id: int
    question: str
    answer: str
    sources: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# ===================== CHAT HISTORY RESPONSE =====================
# Wraps a list of past Q&A entries with a total count.
# Sent when the frontend requests chat history.
class ChatHistoryResponse(BaseModel):
    total: int
    history: List[ChatHistoryItem]

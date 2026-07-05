from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


# ===================== DOCUMENT UPLOAD RESPONSE =====================
# Sent back to the frontend immediately after a PDF is uploaded.
# Only includes basic info — the full processing hasn't happened yet.
class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    status: str
    message: str

    class Config:
        from_attributes = True


# ===================== DOCUMENT CHUNK RESPONSE =====================
# Represents a single chunk of text extracted from a PDF.
# Used when the frontend wants to see the parsed content of a document.
class DocumentChunkResponse(BaseModel):
    id: int
    chunk_text: str
    chunk_index: int
    page_number: int
    chunk_type: str

    class Config:
        from_attributes = True


# ===================== DOCUMENT RESPONSE =====================
# Full details about a single document.
# Used when the frontend opens/views a specific document.
# Includes all metadata + optionally all its chunks.
class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    file_size: int
    total_pages: int
    upload_date: datetime
    status: str
    chunks: Optional[List[DocumentChunkResponse]] = []

    class Config:
        from_attributes = True


# ===================== DOCUMENT LIST RESPONSE =====================
# Sent when the frontend requests a list of all uploaded documents.
# Includes a total count so the frontend can build pagination.
class DocumentListResponse(BaseModel):
    total: int
    documents: List[DocumentResponse]


# ===================== DOCUMENT STATUS UPDATE =====================
# Used when the backend updates the processing status of a document.
# Frontend can poll this to show progress (e.g., "Processing... 60%").
class DocumentStatusUpdate(BaseModel):
    id: int
    status: str
    total_pages: Optional[int] = None

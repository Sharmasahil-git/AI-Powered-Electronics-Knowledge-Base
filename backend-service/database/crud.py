from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database.models import Document, DocumentChunk, ChatHistory, ChatThread

# ===================== DOCUMENT CRUD =====================

# Creates a new document record in the database.
# Called when a user uploads a PDF — saves its metadata (name, path, size).
def create_document(db: Session, filename: str, file_path: str, file_size: int, session_id: str = "anonymous") -> Document:
    document = Document(
        session_id=session_id,
        filename=filename,
        file_path=file_path,
        file_size=file_size
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


# Fetches a single document by its ID.
# Returns the document if found, or None if the ID doesn't exist.
def get_document(db: Session, document_id: int, session_id: str) -> Optional[Document]:
    return db.query(Document).filter(Document.id == document_id, Document.session_id == session_id).first()


# Fetches all documents from the database.
# 'skip' and 'limit' allow pagination (e.g., skip=0, limit=10 = first 10 results).
def get_all_documents(db: Session, session_id: str, skip: int = 0, limit: int = 100) -> List[Document]:
    return db.query(Document).filter(Document.session_id == session_id).offset(skip).limit(limit).all()


# Updates the processing status of a document.
# Flow: "pending" → "processing" → "completed" (or "failed" if something breaks).
# Also sets total_pages once the PDF has been parsed.
def update_document_status(db: Session, document_id: int, status: str, total_pages: int = None) -> Optional[Document]:
    document = db.query(Document).filter(Document.id == document_id).first() # Unscoped intentionally for background worker
    if document:
        document.status = status
        if total_pages is not None:
            document.total_pages = total_pages
        db.commit()
        db.refresh(document)
    return document


# Deletes a document and all its associated chunks (cascade delete).
# Returns True if the document was found and deleted, False otherwise.
def delete_document(db: Session, document_id: int, session_id: str) -> bool:
    document = get_document(db, document_id, session_id)
    if document:
        db.delete(document)
        db.commit()
        return True
    return False


# ===================== DOCUMENT CHUNK CRUD =====================

# Saves multiple chunks to the database in one batch operation.
# Each chunk dict should have: chunk_text, chunk_index, page_number, chunk_type.
# 'bulk' insert is more efficient than saving one chunk at a time.
def create_chunks(db: Session, document_id: int, chunks_data: List[dict]) -> List[DocumentChunk]:
    chunks = []
    for chunk in chunks_data:
        db_chunk = DocumentChunk(
            document_id=document_id,
            chunk_text=chunk["chunk_text"],
            chunk_index=chunk["chunk_index"],
            page_number=chunk["page_number"],
            chunk_type=chunk.get("chunk_type", "text"),
            image_id=chunk.get("image_id")
        )
        chunks.append(db_chunk)
    db.add_all(chunks)
    db.commit()
    for chunk in chunks:
        db.refresh(chunk)
    return chunks

# ===================== DOCUMENT IMAGE CRUD =====================

def create_image(db: Session, document_id: int, page_number: int, image_path: str, image_filename: str, width: int = None, height: int = None, format: str = None):
    from database.models import DocumentImage
    image = DocumentImage(
        document_id=document_id,
        page_number=page_number,
        image_path=image_path,
        image_filename=image_filename,
        width=width,
        height=height,
        format=format
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image

def get_image(db: Session, image_id: int):
    from database.models import DocumentImage
    return db.query(DocumentImage).filter(DocumentImage.id == image_id).first()


# Fetches all chunks that belong to a specific document.
# Returns them ordered by chunk_index so they stay in reading order.
def get_chunks_by_document(db: Session, document_id: int) -> List[DocumentChunk]:
    return db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id
    ).order_by(DocumentChunk.chunk_index).all()


# Fetches a single chunk by its primary key ID.
def get_chunk_by_id(db: Session, chunk_id: int) -> DocumentChunk:
    return db.query(DocumentChunk).filter(DocumentChunk.id == chunk_id).first()


# ===================== CHAT HISTORY CRUD =====================

def create_chat_thread(db: Session, session_id: str, title: str) -> ChatThread:
    thread = ChatThread(session_id=session_id, title=title)
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread

def get_chat_threads(db: Session, session_id: str, skip: int = 0, limit: int = 50) -> List[ChatThread]:
    return db.query(ChatThread)\
             .filter(ChatThread.session_id == session_id)\
             .order_by(ChatThread.is_pinned.desc(), ChatThread.updated_at.desc())\
             .offset(skip).limit(limit).all()

def get_chat_thread_by_id(db: Session, thread_id: int, session_id: str) -> ChatThread:
    return db.query(ChatThread).filter(ChatThread.id == thread_id, ChatThread.session_id == session_id).first()

def rename_chat_thread(db: Session, thread_id: int, session_id: str, new_title: str) -> ChatThread:
    thread = get_chat_thread_by_id(db, thread_id, session_id)
    if thread:
        thread.title = new_title
        db.commit()
        db.refresh(thread)
    return thread

def delete_chat_thread(db: Session, thread_id: int, session_id: str) -> bool:
    thread = get_chat_thread_by_id(db, thread_id, session_id)
    if thread:
        db.delete(thread)
        db.commit()
        return True
    return False

def pin_chat_thread(db: Session, thread_id: int, session_id: str, is_pinned: bool) -> ChatThread:
    thread = get_chat_thread_by_id(db, thread_id, session_id)
    if thread:
        thread.is_pinned = 1 if is_pinned else 0
        db.commit()
        db.refresh(thread)
    return thread

# Saves a Q&A entry within a specific thread.
def create_chat_entry(db: Session, thread_id: int, question: str, answer: str, sources: str = None) -> ChatHistory:
    chat = ChatHistory(
        thread_id=thread_id,
        question=question,
        answer=answer,
        sources=sources
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    # Touch the thread's updated_at timestamp
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if thread:
        thread.updated_at = datetime.utcnow()
        db.commit()
        
    return chat

# Retrieves all messages for a specific thread, oldest first (chronological order for chat UI).
def get_thread_messages(db: Session, thread_id: int) -> List[ChatHistory]:
    return db.query(ChatHistory)\
             .filter(ChatHistory.thread_id == thread_id)\
             .order_by(ChatHistory.timestamp.asc()).all()

# ===================== PGVECTOR SEARCH =====================
def search_vectors(db: Session, query_embedding: List[float], document_ids: Optional[List[int]] = None, k: int = 40):
    query = db.query(
        DocumentChunk,
        DocumentChunk.embedding.l2_distance(query_embedding).label('distance')
    )
    if document_ids:
        query = query.filter(DocumentChunk.document_id.in_(document_ids))
        
    results = query.order_by('distance').limit(k).all()
    
    # Format exactly like FAISS used to: [(chunk_id, distance), ...]
    return [(chunk.id, float(distance)) for chunk, distance in results]

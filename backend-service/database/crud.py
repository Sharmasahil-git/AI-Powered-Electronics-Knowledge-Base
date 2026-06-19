from sqlalchemy.orm import Session
from typing import List, Optional
from database.models import Document, DocumentChunk, ChatHistory


# ===================== DOCUMENT CRUD =====================

# Creates a new document record in the database.
# Called when a user uploads a PDF — saves its metadata (name, path, size).
def create_document(db: Session, filename: str, file_path: str, file_size: int) -> Document:
    document = Document(
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
def get_document(db: Session, document_id: int) -> Optional[Document]:
    return db.query(Document).filter(Document.id == document_id).first()


# Fetches all documents from the database.
# 'skip' and 'limit' allow pagination (e.g., skip=0, limit=10 = first 10 results).
def get_all_documents(db: Session, skip: int = 0, limit: int = 100) -> List[Document]:
    return db.query(Document).offset(skip).limit(limit).all()


# Updates the processing status of a document.
# Flow: "pending" → "processing" → "completed" (or "failed" if something breaks).
# Also sets total_pages once the PDF has been parsed.
def update_document_status(db: Session, document_id: int, status: str, total_pages: int = None) -> Optional[Document]:
    document = get_document(db, document_id)
    if document:
        document.status = status
        if total_pages is not None:
            document.total_pages = total_pages
        db.commit()
        db.refresh(document)
    return document


# Deletes a document and all its associated chunks (cascade delete).
# Returns True if the document was found and deleted, False otherwise.
def delete_document(db: Session, document_id: int) -> bool:
    document = get_document(db, document_id)
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
            embedding_id=chunk.get("embedding_id"),
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


# ===================== CHAT HISTORY CRUD =====================

# Saves a Q&A entry — the user's question, the AI's answer, and which sources were cited.
# 'sources' is stored as a plain string (JSON-formatted) so it stays flexible.
def create_chat_entry(db: Session, question: str, answer: str, sources: str = None) -> ChatHistory:
    chat = ChatHistory(
        question=question,
        answer=answer,
        sources=sources
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


# Fetches past Q&A conversations, newest first.
# 'skip' and 'limit' control pagination (default: last 50).
def get_chat_history(db: Session, skip: int = 0, limit: int = 50) -> List[ChatHistory]:
    return db.query(ChatHistory).order_by(
        ChatHistory.timestamp.desc()
    ).offset(skip).limit(limit).all()

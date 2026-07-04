from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from datetime import datetime

from database.connection import Base


# ===================== DOCUMENT TABLE =====================
# Stores metadata about every PDF uploaded to the system.
# Each row = one uploaded datasheet/document.
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    total_pages = Column(Integer, default=0)
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="pending")

    # ---- Relationship ----
    # Links this document to all its chunks.
    # If a document is deleted, all its chunks and images are automatically deleted too (cascade).
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    images = relationship("DocumentImage", back_populates="document", cascade="all, delete-orphan")


# ===================== DOCUMENT CHUNK TABLE =====================
# Stores individual text pieces extracted from a PDF.
# Each row = one chunk of text from a specific page of a specific document.
class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=False)
    chunk_type = Column(String(50), default="text")
    embedding = Column(Vector(768), nullable=True) # Direct vector storage via pgvector
    image_id = Column(Integer, ForeignKey("document_images.id"), nullable=True)

    # ---- Relationship ----
    # Links this chunk back to its parent document.
    document = relationship("Document", back_populates="chunks")
    image = relationship("DocumentImage")


# ===================== DOCUMENT IMAGE TABLE =====================
# Stores metadata about extracted images for multimodal RAG.
class DocumentImage(Base):
    __tablename__ = "document_images"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    image_path = Column(String(500), nullable=False)
    image_filename = Column(String(255), nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    format = Column(String(50), nullable=True)

    # ---- Relationship ----
    document = relationship("Document", back_populates="images")


# ===================== CHAT HISTORY TABLE =====================
# Stores every question asked by the user and the AI-generated answer.
# 'sources' holds citation info as a JSON string (e.g., which pages were referenced).
class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

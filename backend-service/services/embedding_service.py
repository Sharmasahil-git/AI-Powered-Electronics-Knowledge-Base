from sqlalchemy.orm import Session
from database import crud
from embeddings.embedding_generator import EmbeddingGenerator
# Removed local FAISSManager import since we are using pgvector now

class EmbeddingService:

    def __init__(self):
        # Initialize the AI model
        self.embedding_generator = EmbeddingGenerator()

    # ===================== EMBED ALL CHUNKS FOR A DOCUMENT =====================
    # Used in Phase 1: Takes all text chunks for a document, generates vectors
    # for all of them in batch, and saves them directly into PostgreSQL.
    def generate_embeddings_for_document(self, document_id: int, db: Session) -> bool:
        try:
            crud.update_document_status(db, document_id=document_id, status="embedding")

            chunks = crud.get_chunks_by_document(db, document_id=document_id)
            
            if not chunks:
                print(f"No chunks found for document {document_id}")
                crud.update_document_status(db, document_id=document_id, status="failed")
                return False

            print(f"Generating embeddings for {len(chunks)} chunks...")

            texts_to_embed = [chunk.chunk_text for chunk in chunks]

            embeddings = self.embedding_generator.generate_embeddings(texts_to_embed)

            print("Saving embeddings directly to PostgreSQL via pgvector...")
            for chunk, emb in zip(chunks, embeddings):
                chunk.embedding = emb
            db.commit()

            crud.update_document_status(db, document_id=document_id, status="completed")
            print(f"Document {document_id} is completely processed and ready!")
            
            return True

        except Exception as e:
            print(f"Error generating embeddings for document {document_id}: {str(e)}")
            crud.update_document_status(db, document_id=document_id, status="failed")
            return False

    # ===================== EMBED A SINGLE CHUNK =====================
    def embed_single_chunk(self, chunk_id: int, chunk_text: str, db: Session) -> bool:
        try:
            print(f"[Phase 2] Embedding single image chunk (ID: {chunk_id})...")

            embedding = self.embedding_generator.generate_embedding(chunk_text)
            
            chunk = crud.get_chunk_by_id(db, chunk_id=chunk_id)
            if chunk:
                chunk.embedding = embedding
                db.commit()
                print(f"[Phase 2] Successfully saved embedding for image chunk {chunk_id} to PostgreSQL.")
                return True
            return False

        except Exception as e:
            print(f"Error embedding single chunk {chunk_id}: {str(e)}")
            return False

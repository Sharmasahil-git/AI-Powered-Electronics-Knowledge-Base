from sqlalchemy.orm import Session
from database import crud
from embeddings.embedding_generator import EmbeddingGenerator
from vector_db.faiss_manager import FAISSManager

class EmbeddingService:

    def __init__(self):
        # Initialize the AI model and the FAISS vector database once
        self.embedding_generator = EmbeddingGenerator()
        self.faiss_manager = FAISSManager()

    # ===================== EMBED ALL CHUNKS FOR A DOCUMENT =====================
    # Used in Phase 1: Takes all text chunks for a document, generates vectors
    # for all of them in batch, and saves them into the FAISS database.
    def generate_embeddings_for_document(self, document_id: int, db: Session) -> bool:
        try:
            # 1. Update status so the frontend shows we are in the embedding phase
            crud.update_document_status(db, document_id=document_id, status="embedding")

            # 2. Fetch all the raw text chunks for this document from our SQLite database
            chunks = crud.get_chunks_by_document(db, document_id=document_id)
            
            if not chunks:
                print(f"No chunks found for document {document_id}")
                crud.update_document_status(db, document_id=document_id, status="failed")
                return False

            print(f"Generating embeddings for {len(chunks)} chunks...")

            # 3. Extract just the text strings and their database IDs into separate lists
            texts_to_embed = [chunk.chunk_text for chunk in chunks]
            chunk_ids = [chunk.id for chunk in chunks]

            # 4. Use our local AI model to convert the text into mathematical vectors (batches them for speed)
            embeddings = self.embedding_generator.generate_embeddings(texts_to_embed)

            # 5. Save those vectors into the FAISS database so they can be searched instantly later
            print("Saving embeddings to FAISS database...")
            self.faiss_manager.add_embeddings(embeddings=embeddings, chunk_ids=chunk_ids)

            # 6. Mark as fully "completed"! The RAG system can now search this PDF.
            crud.update_document_status(db, document_id=document_id, status="completed")
            print(f"Document {document_id} is completely processed and ready!")
            
            return True

        except Exception as e:
            # Catch errors to prevent the API from crashing and mark the doc as failed
            print(f"Error generating embeddings for document {document_id}: {str(e)}")
            crud.update_document_status(db, document_id=document_id, status="failed")
            return False

    # ===================== EMBED A SINGLE CHUNK =====================
    # Used in Phase 2: When a new image chunk is created one-by-one in the 
    # background, we embed it individually and add it to the existing FAISS 
    # index. This way, the image becomes searchable the moment it's processed,
    # without waiting for all other images to finish.
    def embed_single_chunk(self, chunk_id: int, chunk_text: str) -> bool:
        try:
            print(f"[Phase 2] Embedding single image chunk (ID: {chunk_id})...")

            # Generate embedding for this one chunk
            embedding = self.embedding_generator.generate_embedding(chunk_text)

            if not embedding:
                print(f"[Phase 2] Failed to generate embedding for chunk {chunk_id}")
                return False

            # Add it to the FAISS index immediately
            self.faiss_manager.add_embeddings(
                embeddings=[embedding],
                chunk_ids=[chunk_id]
            )

            print(f"[Phase 2] Chunk {chunk_id} embedded and searchable!")
            return True

        except Exception as e:
            print(f"[Phase 2] Error embedding chunk {chunk_id}: {str(e)}")
            return False

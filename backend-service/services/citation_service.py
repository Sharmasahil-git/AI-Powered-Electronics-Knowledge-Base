from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from database.models import DocumentChunk, Document
from schemas.chat_schema import CitationSource

class CitationService:

    @staticmethod
    def build_citations(db: Session, faiss_results: List[Tuple[int, float]], document_ids: Optional[List[int]] = None) -> List[CitationSource]:
        # ===================== BUILD CITATIONS =====================
        # Takes the raw results from FAISS (a list of chunk IDs and their distance scores)
        # and turns them into human-readable citations for the frontend.
        
        citations = []
        
        # If FAISS didn't find anything, return an empty list
        if not faiss_results:
            return citations
            
        # faiss_results looks like this: [(chunk_id=42, distance=0.15), (chunk_id=105, distance=0.88)]
        for chunk_id, distance in faiss_results:
            # We only want the top 5 most relevant citations
            if len(citations) >= 5:
                break

            # 1. Look up the actual text chunk in our SQLite database using its ID
            chunk = db.query(DocumentChunk).filter(DocumentChunk.id == chunk_id).first()
            
            if chunk:
                # 2. We also need the document's filename, so we fetch the parent document
                document = db.query(Document).filter(Document.id == chunk.document_id).first()
                
                if document:
                    # 3. If the user provided a list of document IDs to filter by, skip if it doesn't match
                    if document_ids is not None and document.id not in document_ids:
                        continue

                    # 4. Package it perfectly into the Pydantic schema we designed on Day 1
                    citation = CitationSource(
                        document_id=document.id,
                        document_name=document.filename,
                        page_number=chunk.page_number,
                        chunk_text=chunk.chunk_text,
                        # Note: In FAISS (L2 distance), a LOWER score means it is MORE relevant
                        relevance_score=distance 
                    )
                    citations.append(citation)
                    
        return citations

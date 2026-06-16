import os
from sqlalchemy.orm import Session
from database import crud
from parsers.pdf_parser import PDFParser
from parsers.table_parser import TableParser
from chunking.text_chunker import TextChunker


class PDFService:

    def __init__(self):
        # Initialize our parsers and chunker once when the service starts
        self.pdf_parser = PDFParser()
        self.table_parser = TableParser()
        self.text_chunker = TextChunker()

    # ===================== END-TO-END PDF PROCESSING =====================
    # This is the main orchestrator function. It takes an uploaded PDF file,
    # extracts everything, chunks it, and saves those chunks to the database.
    def process_document(self, document_id: int, file_path: str, db: Session) -> bool:
        try:
            # 1. Update status so the frontend knows we started
            crud.update_document_status(db, document_id=document_id, status="processing")

            # 2. Extract standard text and images using PyMuPDF
            print(f"Extracting text from: {file_path}")
            pages_data = self.pdf_parser.extract_text_from_pdf(file_path)
            
            # Update the total pages in the database now that we know it
            total_pages = len(pages_data)
            crud.update_document_status(db, document_id=document_id, status="processing", total_pages=total_pages)

            # 3. Extract structured tables using Camelot/Tabula
            print(f"Extracting tables from: {file_path}")
            tables_data = self.table_parser.extract_tables(file_path)

            # 4. Merge table text into the corresponding page's text
            # This ensures the AI reads the tables in the correct context of the page
            for table in tables_data:
                page_idx = table["page_number"] - 1
                if 0 <= page_idx < len(pages_data):
                    pages_data[page_idx]["text"] += f"\n\n--- TABLE EXTRACTED ---\n{table['table_text']}\n-----------------------"

            # 5. Chunk the massive text into bite-sized pieces for the AI
            print("Chunking document text...")
            chunks_data = self.text_chunker.chunk_document(pages_data)

            # 6. Save all the chunks into the SQLite database
            print(f"Saving {len(chunks_data)} chunks to database...")
            crud.create_chunks(db, document_id=document_id, chunks_data=chunks_data)

            # 7. Mark as "parsed" (Next step will be generating embeddings)
            crud.update_document_status(db, document_id=document_id, status="parsed")
            print("PDF Processing complete!")
            
            return True

        except Exception as e:
            # If anything crashes, mark it as failed so the frontend doesn't hang
            print(f"Error processing document {document_id}: {str(e)}")
            crud.update_document_status(db, document_id=document_id, status="failed")
            return False

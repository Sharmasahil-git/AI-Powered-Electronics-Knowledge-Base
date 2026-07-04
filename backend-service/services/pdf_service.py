import os
from typing import List, Dict, Generator
from sqlalchemy.orm import Session
from database import crud
from parsers.pdf_parser import PDFParser
from parsers.table_parser import TableParser
from chunking.text_chunker import TextChunker
from services.vision_service import VisionService


class PDFService:

    def __init__(self):
        # Initialize our parsers and chunker once when the service starts
        self.pdf_parser = PDFParser()
        self.table_parser = TableParser()
        self.text_chunker = TextChunker()
        self.vision_service = VisionService()

    # ===================== PHASE 1: TEXT & TABLES (INSTANT) =====================
    # This phase extracts all text and tables, chunks them, and saves them to the
    # database. It completes in ~10 seconds and does NOT touch images at all.
    # After this phase, the user can immediately start asking text-based questions.
    def process_text_and_tables(self, document_id: int, file_path: str, db: Session) -> List[dict]:
        try:
            # 1. Update status so the frontend knows we started
            crud.update_document_status(db, document_id=document_id, status="processing")

            # 2. Extract standard text using PyMuPDF
            print(f"[Phase 1] Extracting text from: {file_path}")
            pages_data = self.pdf_parser.extract_text_from_pdf(file_path)

            # Update the total pages in the database now that we know it
            total_pages = len(pages_data)
            crud.update_document_status(db, document_id=document_id, status="processing", total_pages=total_pages)

            # 3. Extract structured tables using Camelot/Tabula
            print(f"[Phase 1] Extracting tables from: {file_path}")
            tables_data = self.table_parser.extract_tables(file_path)

            # 4. Merge table text into the corresponding page's text
            for table in tables_data:
                page_idx = table["page_number"] - 1
                if 0 <= page_idx < len(pages_data):
                    pages_data[page_idx]["text"] += f"\n\n--- TABLE EXTRACTED ---\n{table['text']}\n-----------------------"

            # 5. Chunk the massive text into bite-sized pieces for the AI
            print("[Phase 1] Chunking document text...")
            chunks_data = self.text_chunker.chunk_document(pages_data)

            # 6. Save all the TEXT chunks into the SQLite database
            print(f"[Phase 1] Saving {len(chunks_data)} text chunks to database...")
            crud.create_chunks(db, document_id=document_id, chunks_data=chunks_data)

            print(f"[Phase 1] Text processing complete! {len(chunks_data)} chunks ready.")
            return chunks_data

        except Exception as e:
            print(f"[Phase 1] Error processing text for document {document_id}: {str(e)}")
            crud.update_document_status(db, document_id=document_id, status="failed")
            raise

    # ===================== PHASE 2: IMAGES (BACKGROUND, INCREMENTAL) =====================
    # This is a Python generator. It extracts images one-by-one, asks Gemini to 
    # describe each one (with a rate-limit pause), saves it as a chunk, and YIELDS 
    # progress back to the caller so we can stream it via WebSocket.
    #
    # Usage:
    #   for progress in pdf_service.process_images_incrementally(...):
    #       send_websocket_message(progress)
    def process_images_incrementally(self, document_id: int, file_path: str, db: Session) -> Generator[Dict, None, None]:
        import concurrent.futures
        
        # 1. Extract all images from the PDF to disk
        images_dir = f"storage/images/doc_{document_id}"
        print(f"[Phase 2] Extracting images to: {images_dir}")
        images_data = self.pdf_parser.extract_images(file_path, images_dir)

        total_images = len(images_data)
        if total_images == 0:
            print("[Phase 2] No images found in this document.")
            yield {"current": 0, "total": 0, "status": "no_images"}
            return

        print(f"[Phase 2] Found {total_images} images. Processing in parallel...")

        # 2. Process images in parallel! 
        # Max workers = 5 means it analyzes 5 images at the exact same time.
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            # We map a future to its img_info so we know which one finished
            future_to_img = {}
            for idx, img_info in enumerate(images_data):
                # We submit ONLY the slow network API call to the background thread pool
                future = executor.submit(self.vision_service.describe_image, img_info["image_path"])
                future_to_img[future] = (idx, img_info)

            processed_count = 0
            
            # as_completed yields the futures as soon as they finish, out of order
            for future in concurrent.futures.as_completed(future_to_img):
                idx, img_info = future_to_img[future]
                processed_count += 1

                # Yield progress BEFORE saving so the frontend updates instantly
                yield {
                    "current": processed_count,
                    "total": total_images,
                    "status": "processing_images",
                    "message": f"Learning diagram {processed_count} of {total_images}... (Page {img_info['page_number']})"
                }

                # Upload to Supabase Storage if configured
                from services.supabase_client import supabase
                if supabase:
                    try:
                        with open(img_info["image_path"], "rb") as f:
                            supabase.storage.from_("images").upload(
                                path=img_info["image_filename"],
                                file=f.read(),
                                file_options={"content-type": f"image/{img_info['format']}"}
                            )
                    except Exception as e:
                        print(f"Supabase image upload error: {e}")

                # Save image record to DB (Safe because this runs in the Main Thread!)
                db_image = crud.create_image(
                    db=db,
                    document_id=document_id,
                    page_number=img_info["page_number"],
                    image_path=img_info["image_path"],
                    image_filename=img_info["image_filename"],
                    width=img_info["width"],
                    height=img_info["height"],
                    format=img_info["format"]
                )

                # Retrieve the description result from the background thread
                try:
                    description = future.result()
                except Exception as exc:
                    print(f"[Phase 2] Image {idx} generated an exception: {exc}")
                    description = "Image description unavailable: Exception during parallel processing."

                # Create the image chunk text
                image_chunk_text = f"[IMAGE DESCRIPTION] The following describes a diagram on Page {img_info['page_number']}:\n{description}"

                # Save this single image chunk to the database
                image_chunk_data = [{
                    "chunk_text": image_chunk_text,
                    "chunk_index": 9000 + idx,  # High index so it doesn't collide with text chunks
                    "page_number": img_info["page_number"],
                    "chunk_type": "image",
                    "image_id": db_image.id
                }]
                saved_chunks = crud.create_chunks(db, document_id=document_id, chunks_data=image_chunk_data)

                # Yield the saved chunk ID so the upload controller can embed it immediately
                yield {
                    "current": processed_count,
                    "total": total_images,
                    "status": "image_saved",
                    "message": f"Diagram {processed_count} of {total_images} learned!",
                    "chunk_id": saved_chunks[0].id,
                    "chunk_text": saved_chunks[0].chunk_text
                }

        print(f"[Phase 2] All {total_images} images processed successfully in parallel!")

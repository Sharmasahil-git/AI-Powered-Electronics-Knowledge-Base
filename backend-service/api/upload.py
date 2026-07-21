import os
import shutil
import asyncio
import threading
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect, Header, Request
from sqlalchemy.orm import Session

from database.connection import get_db
from database import crud
from schemas.document_schema import DocumentUploadResponse
from services.pdf_service import PDFService
from services.embedding_service import EmbeddingService
from services.websocket_manager import ws_manager
from services.rate_limiter import limiter

# Create a FastAPI router for upload-related endpoints
router = APIRouter()

# Instantiate our heavy-lifting services once
pdf_service = PDFService()
embedding_service = EmbeddingService()


# ===================== TWO-PHASE BACKGROUND PROCESSING =====================
# This function runs invisibly in the background AFTER we reply to the user.
# PHASE 1: Extract text → embed text → mark "text_ready" (user can chat!)
# PHASE 2: Extract images one-by-one → describe → embed → stream progress via WebSocket
def process_document_background(document_id: int, file_path: str, db: Session):

    # ==================== PHASE 0: CLOUD UPLOAD (BACKGROUND) ====================
    try:
        from services.supabase_client import supabase
        if supabase:
            unique_filename = os.path.basename(file_path)
            with open(file_path, "rb") as f:
                file_bytes = f.read()
            supabase.storage.from_("uploads").upload(
                path=unique_filename,
                file=file_bytes,
                file_options={"content-type": "application/pdf"}
            )
            public_url = supabase.storage.from_("uploads").get_public_url(unique_filename)
            from database.models import Document
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                doc.file_path = public_url
                db.commit()
    except Exception as e:
        print(f"Background cloud upload failed: {e}")

    # ==================== PHASE 1: TEXT (INSTANT) ====================
    try:
        # 1. Extract text and tables, chunk them, save to SQLite
        text_chunks = pdf_service.process_text_and_tables(document_id, file_path, db)

        # 2. Generate embeddings for ALL text chunks in batch and save to FAISS
        success = embedding_service.generate_embeddings_for_document(document_id, db)
        if not success:
            raise Exception("Failed to generate embeddings. API limits or timeout.")

        # 3. Update status to "text_ready" so the frontend knows the user can start chatting
        crud.update_document_status(db, document_id=document_id, status="text_ready")

        # 4. Notify any connected WebSocket clients that text is ready
        _broadcast_sync(document_id, {
            "status": "text_ready",
            "message": "Text data is ready! You can now start asking questions.",
            "current": 0,
            "total": 0
        })

        print(f"[Phase 1] Document {document_id} text is ready for chat!")

    except Exception as e:
        print(f"[Phase 1] FATAL: Text processing failed for document {document_id}: {str(e)}")
        crud.update_document_status(db, document_id=document_id, status="failed")
        _broadcast_sync(document_id, {
            "status": "failed",
            "message": f"Processing failed: {str(e)}"
        })
        # Clean up local file on failure
        import os
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as delete_err:
                pass
        return

    # ==================== PHASE 2: IMAGES (SLOW, BACKGROUND) ====================
    try:
        # 5. Process images one at a time using the generator
        for progress in pdf_service.process_images_incrementally(document_id, file_path, db):

            # If this yield contains a saved chunk, embed it immediately
            if progress.get("status") == "image_saved":
                chunk_id = progress["chunk_id"]
                chunk_text = progress["chunk_text"]
                embedding_service.embed_single_chunk(chunk_id, chunk_text, db)

            # Stream the progress to the frontend via WebSocket
            _broadcast_sync(document_id, progress)

        # 6. All images done! Update final status
        crud.update_document_status(db, document_id=document_id, status="completed")
        _broadcast_sync(document_id, {
            "status": "completed",
            "message": "All diagrams have been analyzed! Full multimodal search is now available."
        })
        print(f"[Phase 2] Document {document_id} is FULLY processed (text + images)!")

    except Exception as e:
        # If images fail, the text is still usable. We don't mark as "failed".
        print(f"[Phase 2] WARNING: Image processing failed for document {document_id}: {str(e)}")
        crud.update_document_status(db, document_id=document_id, status="completed")
        _broadcast_sync(document_id, {
            "status": "completed",
            "message": "Text is ready. Some images could not be processed."
        })
        
    finally:
        # Clean up the local temporary PDF file to save disk space
        import os
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Failed to delete local file {file_path}: {e}")


# ===================== HELPER: SYNC-TO-ASYNC BRIDGE =====================
# The background task runs in a synchronous thread, but WebSocket broadcasting
# is an async operation. This helper bridges the two worlds safely.
def _broadcast_sync(document_id: int, message: dict):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # We're inside an async context (e.g., FastAPI's event loop from another thread)
            # Use asyncio.run_coroutine_threadsafe to schedule the broadcast
            asyncio.run_coroutine_threadsafe(
                ws_manager.broadcast_to_document(document_id, message),
                loop
            )
        else:
            loop.run_until_complete(ws_manager.broadcast_to_document(document_id, message))
    except RuntimeError:
        # No event loop available (e.g., running in a pure background thread)
        # Create a new loop just for this broadcast
        new_loop = asyncio.new_event_loop()
        new_loop.run_until_complete(ws_manager.broadcast_to_document(document_id, message))
        new_loop.close()


# ===================== UPLOAD ENDPOINT =====================
# The web address will be: POST /api/upload
@router.post("/upload", response_model=DocumentUploadResponse)
@limiter.limit("5/minute")
async def upload_pdf(
    request: Request,
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    x_session_id: str = Header(default="anonymous"),
    db: Session = Depends(get_db)
):
    # 1. Check if the uploaded file is actually a PDF (MIME type check instead of just extension)
    if file.content_type != "application/pdf" or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF documents are allowed.")

    # 2. Prevent DoS attacks by enforcing a strict 20MB file size limit BEFORE loading fully into RAM
    MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
    file_bytes = bytearray()
    
    # Read in 1MB chunks so we don't blow up server RAM on malicious 5GB uploads
    while chunk := await file.read(1024 * 1024):
        file_bytes.extend(chunk)
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 20MB.")
    
    file_bytes = bytes(file_bytes)
    file_size = len(file_bytes)

    # 3. Prevent Path Traversal (Zip Slip) by sanitizing the filename
    # We generate a unique UUID to completely eliminate collision and traversal risks
    safe_base_name = os.path.basename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{safe_base_name}"

    # Always save a local copy for PyMuPDF to parse
    upload_dir = "storage/uploads"
    os.makedirs(upload_dir, exist_ok=True) 
    local_file_path = os.path.join(upload_dir, unique_filename)
    
    try:
        with open(local_file_path, "wb") as buffer:
            buffer.write(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file locally: {str(e)}")

    db_file_path = f"/uploads/{unique_filename}"

    # 5. Create a record in our database so we can track its status
    # We store the Supabase URL in the DB so the frontend can display it,
    # but we pass the local file path to the background worker so it can parse it!
    document = crud.create_document(
        db=db,
        filename=file.filename,
        file_path=db_file_path,
        file_size=file_size,
        session_id=x_session_id
    )

    # 6. Kick off the heavy processing in the background using the LOCAL path!
    background_tasks.add_task(process_document_background, document.id, local_file_path, db)

    # 7. Immediately return a success message to the frontend so the user knows it worked
    return DocumentUploadResponse(
        id=document.id,
        filename=document.filename,
        status=document.status,
        message="Upload successful! Text will be ready in ~10 seconds. Connect to WebSocket for live progress."
    )


# ===================== WEBSOCKET ENDPOINT =====================
# The frontend connects to: ws://localhost:8000/api/ws/{document_id}
# It will receive live JSON messages as the document is processed:
#   {"status": "text_ready", "message": "You can now start asking questions!"}
#   {"status": "processing_images", "message": "Learning diagram 3 of 53..."}
#   {"status": "completed", "message": "All diagrams analyzed!"}
@router.websocket("/ws/{document_id}")
async def websocket_progress(websocket: WebSocket, document_id: int):
    await ws_manager.connect(websocket, document_id)
    try:
        # Keep the connection alive until the client disconnects
        while True:
            # We don't expect messages FROM the client, but we need to listen
            # to detect disconnections. This will block until the client sends
            # something or disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, document_id)

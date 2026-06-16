import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from database.connection import get_db
from database import crud
from schemas.document_schema import DocumentUploadResponse
from services.pdf_service import PDFService
from services.embedding_service import EmbeddingService

# Create a FastAPI router for upload-related endpoints
router = APIRouter()

# Instantiate our heavy-lifting services once
pdf_service = PDFService()
embedding_service = EmbeddingService()

# ===================== BACKGROUND PROCESSING =====================
# Processing a 30-page PDF takes time. If we make the frontend wait, the browser might time out.
# This function runs invisibly in the background AFTER we reply to the user.
def process_document_background(document_id: int, file_path: str, db: Session):
    # 1. Extract text, extract tables, chunk it, and save chunks to SQLite
    success = pdf_service.process_document(document_id, file_path, db)
    
    if success:
        # 2. If parsing worked perfectly, convert those chunks to math vectors in FAISS
        embedding_service.generate_embeddings_for_document(document_id, db)


# ===================== UPLOAD ENDPOINT =====================
# The web address will be: POST /api/upload
@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_pdf(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # 1. Check if the uploaded file is actually a PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # 2. Define exactly where we will save this file on the hard drive
    upload_dir = "storage/uploads"
    # Ensure the folder exists
    os.makedirs(upload_dir, exist_ok=True) 
    file_path = os.path.join(upload_dir, file.filename)

    # 3. Save the physical file from the web request to the hard drive
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    # 4. Get the file size for our metadata
    file_size = os.path.getsize(file_path)

    # 5. Create a record in our SQLite database so we can track its status
    document = crud.create_document(
        db=db,
        filename=file.filename,
        file_path=file_path,
        file_size=file_size
    )

    # 6. Kick off the heavy processing in the background!
    background_tasks.add_task(process_document_background, document.id, file_path, db)

    # 7. Immediately return a success message to the frontend so the user knows it worked
    return DocumentUploadResponse(
        id=document.id,
        filename=document.filename,
        status=document.status,
        message="Upload successful! Processing started in the background."
    )

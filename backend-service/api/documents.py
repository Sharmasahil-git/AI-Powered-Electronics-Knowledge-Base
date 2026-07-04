import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.connection import get_db
from database import crud
from schemas.document_schema import DocumentResponse, DocumentListResponse

# Create a FastAPI router for document-related endpoints
router = APIRouter()

# ===================== GET ALL DOCUMENTS =====================
# The web address will be: GET /api/documents
# Used by the frontend dashboard to show the user a list of all files they uploaded
@router.get("/", response_model=DocumentListResponse)
def get_documents(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    # Fetch from PostgreSQL database
    documents = crud.get_all_documents(db, skip=skip, limit=limit)
    
    # The frontend needs to know the total count for pagination (e.g., showing Page 1 of 5)
    # We count how many documents were returned
    total = len(documents)
    
    return DocumentListResponse(
        total=total,
        documents=documents
    )

# ===================== GET SINGLE DOCUMENT =====================
# The web address will be: GET /api/documents/{id}
# Used when the user clicks on a specific PDF to see its exact details
@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    document = crud.get_document(db, document_id=document_id)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return document

# ===================== DELETE DOCUMENT =====================
# The web address will be: DELETE /api/documents/{id}
# Used when the user wants to remove a PDF from the system entirely
@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    # 1. Look up the document to make sure it exists
    document = crud.get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 2. Clean up files from Supabase Storage (cloud) and local disk
    from services.supabase_client import supabase
    
    # Delete the PDF from Supabase uploads bucket
    if supabase:
        try:
            supabase.storage.from_("uploads").remove([document.filename])
            print(f"Deleted PDF from Supabase: {document.filename}")
        except Exception as e:
            print(f"Warning: Could not delete PDF from Supabase: {e}")
        
        # Delete associated images from Supabase images bucket
        try:
            from database.models import DocumentImage
            images = db.query(DocumentImage).filter(DocumentImage.document_id == document_id).all()
            if images:
                image_filenames = [img.image_filename for img in images]
                supabase.storage.from_("images").remove(image_filenames)
                print(f"Deleted {len(image_filenames)} images from Supabase")
        except Exception as e:
            print(f"Warning: Could not delete images from Supabase: {e}")

    # Delete local files if they exist (development only, ephemeral on Render)
    if os.path.exists(document.file_path):
        try:
            os.remove(document.file_path)
        except Exception:
            pass
    
    # Clean up local image directory
    import shutil
    local_images_dir = f"storage/images/doc_{document_id}"
    if os.path.exists(local_images_dir):
        try:
            shutil.rmtree(local_images_dir)
        except Exception:
            pass

    # 3. Delete from PostgreSQL database
    # Cascading deletes automatically remove all chunks and image records
    success = crud.delete_document(db, document_id=document_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete document from database")
        
    return {"message": f"Document '{document.filename}' successfully deleted"}

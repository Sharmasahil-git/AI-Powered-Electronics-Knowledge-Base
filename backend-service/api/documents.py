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
    # Fetch from SQLite database
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
        
    # 2. Try to physically delete the PDF file from the hard drive (storage/uploads/)
    if os.path.exists(document.file_path):
        try:
            os.remove(document.file_path)
            print(f"Deleted physical file: {document.file_path}")
        except Exception as e:
            # If the file is locked by Windows or OneDrive, we print a warning but keep going
            print(f"Warning: Could not delete physical file {document.file_path}: {e}")

    # 3. Delete from the SQLite database
    # (Thanks to our database setup in models.py, deleting the document automatically
    # deletes all the text chunks linked to it, keeping the database perfectly clean!)
    success = crud.delete_document(db, document_id=document_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete document from database")
        
    return {"message": f"Document '{document.filename}' successfully deleted"}

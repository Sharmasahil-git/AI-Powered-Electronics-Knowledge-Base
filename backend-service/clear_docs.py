import os
import shutil
from dotenv import load_dotenv

load_dotenv()

from database.connection import SessionLocal
from database.models import Document, DocumentChunk, DocumentImage

db = SessionLocal()
try:
    print("Deleting all documents, chunks, and images from the database...")
    db.query(Document).delete()
    db.commit()
    print("Database cleared.")

    storage_path = os.path.join(os.path.dirname(__file__), 'storage')
    if os.path.exists(storage_path):
        shutil.rmtree(storage_path)
        print("Local storage folder removed.")

finally:
    db.close()

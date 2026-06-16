from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import uvicorn
from database.connection import init_db
from database import models
from api import upload, documents, chat

# ===================== APP INITIALIZATION =====================
# Creates the FastAPI application instance with project metadata.
# This 'app' object is the core of your entire backend server.
app = FastAPI(
    title="AI-Powered Electronics Knowledge Base",
    description="Smart Datasheet Parsing, Table Extraction, and Citation-Based Question Answering",
    version="1.0.0"
)

# ===================== CORS MIDDLEWARE =====================
# CORS (Cross-Origin Resource Sharing) allows your frontend
# (running on a different port/domain) to communicate with this backend.
# Without this, browsers will block requests from your frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== DIRECTORY PATHS =====================
# Defines absolute paths for file storage using pathlib.
# BASE_DIR = the folder where main.py lives (backend-service/)
# UPLOADS_DIR = where uploaded PDFs are saved
# PROCESSED_DIR = where parsed/processed output is saved
BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
PROCESSED_DIR = STORAGE_DIR / "processed"


# ===================== STARTUP EVENT =====================
# This function runs ONCE automatically when the server starts.
# It ensures the storage directories exist, creating them if they don't.
@app.on_event("startup")
async def startup_event():
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    init_db()


# ===================== API ROUTERS =====================
# This plugs in the API routes we built in Phase 5 so the server can hear them.
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

# ===================== HEALTH CHECK ENDPOINT =====================
# A simple GET route at /health to verify the server is running.
# Hit http://localhost:8000/health in your browser to test.
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "project": "AI-Powered Electronics Knowledge Base",
        "version": "1.0.0"
    }


# ===================== SERVER RUNNER =====================
# This block runs only when you execute: python main.py
# It starts the Uvicorn server on port 8000 with auto-reload enabled,
# so the server restarts automatically whenever you save a code change.
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import uvicorn
import os
from dotenv import load_dotenv
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from services.rate_limiter import limiter

# Load environment variables from the .env file immediately
load_dotenv()

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

# Attach the rate limiter to the FastAPI app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from fastapi.staticfiles import StaticFiles

# ===================== CORS MIDDLEWARE =====================
# CORS allows the frontend to communicate with this backend.
# We pull allowed domains from the .env file. We default to allowing
# localhost for your friend to test, or allowing everything if needed.
cors_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = cors_env.split(",") if cors_env else []
# Force-allow standard localhosts (including Vite's 5173) and wildcard to prevent blocks
allowed_origins.extend(["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "*"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== STATIC FILES =====================
# Serve images directly so the frontend can display them using URL paths
import os
os.makedirs("storage/images", exist_ok=True)
os.makedirs("storage/uploads", exist_ok=True)
app.mount("/images", StaticFiles(directory="storage/images"), name="images")
app.mount("/uploads", StaticFiles(directory="storage/uploads"), name="uploads")

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
    (STORAGE_DIR / "images").mkdir(parents=True, exist_ok=True)
    # Note: init_db() was removed from here because connecting to Supabase
    # can take 15+ seconds on a cold start, which causes cloud platforms 
    # like Render to kill the deployment for timing out. 
    # Run database migrations manually instead.


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
# It starts the server using the dynamic PORT assigned by the cloud platform,
# or defaults to 8000 for local development.
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

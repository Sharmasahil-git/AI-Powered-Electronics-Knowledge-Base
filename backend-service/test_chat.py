import os
from dotenv import load_dotenv

# Load the env variables FIRST
load_dotenv()

from database.connection import SessionLocal
from services.rag_service import RAGService

db = SessionLocal()
rag = RAGService()

try:
    print("Testing Chat with API Key...")
    print("API Key loaded:", bool(os.getenv("GEMINI_API_KEY")))
    response = rag.answer_question("What company made the LM340?", db)
    print("Answer:", response.answer)
    print("Sources:", len(response.sources))
except Exception as e:
    import traceback
    traceback.print_exc()

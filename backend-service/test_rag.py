from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Ensure the app context is available
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from services.rag_service import RAGService

# Create session manually
engine = create_engine("sqlite:///storage/electronics_kb.db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

rag = RAGService()
question = "describe image 1 from page 10"

print("--- TESTING WITHOUT DOCUMENT FILTER ---")
res1 = rag.answer_question(question, db)
print(f"Answer: {res1.answer}")
print(f"Citations: {[c.document_id for c in res1.sources]}")

print("\n--- TESTING WITH DOCUMENT ID 1 FILTER ---")
res2 = rag.answer_question(question, db, document_ids=[1])
print(f"Answer: {res2.answer}")
print(f"Citations: {[c.document_id for c in res2.sources]}")

print("\n--- TESTING WITH DOCUMENT ID 2 FILTER ---")
res3 = rag.answer_question(question, db, document_ids=[2])
print(f"Answer: {res3.answer}")
print(f"Citations: {[c.document_id for c in res3.sources]}")

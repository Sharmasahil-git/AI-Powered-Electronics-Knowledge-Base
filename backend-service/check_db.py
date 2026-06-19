import sqlite3
import os

db_path = 'storage/electronics_kb.db'
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Check total documents
    c.execute("SELECT id, filename FROM documents")
    docs = c.fetchall()
    print("Documents in DB:", docs)
    
    # Check total image chunks
    c.execute("SELECT COUNT(*) FROM document_chunks WHERE chunk_type='image'")
    count = c.fetchone()[0]
    print(f"Total image chunks: {count}")
    
    # Get first image chunk
    c.execute("SELECT id, document_id, page_number, substr(chunk_text, 1, 100) FROM document_chunks WHERE chunk_type='image' LIMIT 1")
    first = c.fetchone()
    if first:
        print(f"First image chunk snippet: ID={first[0]}, DocID={first[1]}, Page={first[2]}, Text='{first[3]}...'")
    else:
        print("No image chunks found in the database.")
except Exception as e:
    print("Error:", e)

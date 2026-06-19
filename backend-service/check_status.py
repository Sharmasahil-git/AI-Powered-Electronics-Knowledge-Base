import sqlite3

db_path = 'storage/electronics_kb.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT id, status FROM documents")
print("Document Statuses:", c.fetchall())

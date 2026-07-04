import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path

# ===================== DATABASE PATH =====================
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    # Fallback to local SQLite if no SUPABASE Postgres URL is provided
    BASE_DIR = Path(__file__).resolve().parent.parent
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'storage' / 'electronics_kb.db'}"

# ===================== ENGINE =====================
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # PostgreSQL requires pool_pre_ping to handle idle connection drops
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# ===================== SESSION FACTORY =====================
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ===================== BASE CLASS =====================
Base = declarative_base()

# ===================== GET DB SESSION =====================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===================== INITIALIZE DATABASE =====================
def init_db():
    if not DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
    Base.metadata.create_all(bind=engine)

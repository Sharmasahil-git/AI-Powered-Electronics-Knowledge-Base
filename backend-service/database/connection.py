from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path

# ===================== DATABASE PATH =====================
# Points to a SQLite file inside your storage/ folder.
# SQLite needs no server — it stores everything in this single .db file.
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'storage' / 'electronics_kb.db'}"

# ===================== ENGINE =====================
# The engine is the low-level connection to the database.
# connect_args={"check_same_thread": False} is required for SQLite
# because SQLite only allows one thread by default, but FastAPI is multi-threaded.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# ===================== SESSION FACTORY =====================
# A session is one "conversation" with the database.
# SessionLocal creates a new session each time it's called.
# autocommit=False: you control when data is saved (explicit commits).
# autoflush=False: changes aren't sent to DB until you explicitly flush/commit.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ===================== BASE CLASS =====================
# Every database table (model) you create in models.py will inherit from this Base.
# It gives SQLAlchemy the ability to track and create all your tables automatically.
Base = declarative_base()


# ===================== GET DB SESSION =====================
# FastAPI calls this function for every API request that needs database access.
# It opens a session, hands it to your route, and closes it when the request is done.
# The 'yield' keyword makes this a generator — it pauses, lets the route use the session,
# then resumes to run the 'finally' block (which closes the session).
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===================== INITIALIZE DATABASE =====================
# Creates all tables defined in models.py inside the actual database file.
# Called once from main.py's startup event when the server boots.
def init_db():
    Base.metadata.create_all(bind=engine)

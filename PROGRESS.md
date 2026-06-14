# AI-Powered Electronics Knowledge Base - Progress Tracker

## Build Order & Status

### Phase 1: Backend Foundation
- [x] `main.py` — FastAPI app, CORS, startup event, health check, uvicorn runner
- [x] `database/connection.py` — SQLite engine, session factory, Base class, get_db(), init_db()
- [x] `database/models.py` — Document, DocumentChunk, ChatHistory tables
- [x] `database/crud.py` — CRUD operations for all three tables

### Phase 2: Schemas
- [ ] `schemas/document_schema.py` — Pydantic schemas for document request/response
- [ ] `schemas/chat_schema.py` — Pydantic schemas for chat request/response

### Phase 3: Core Processing Pipeline
- [ ] `parsers/pdf_parser.py` — PDF text extraction (PyMuPDF)
- [ ] `parsers/table_parser.py` — Table extraction (Camelot/Tabula)
- [ ] `chunking/text_chunker.py` — Text splitting into retrieval chunks (LangChain)
- [ ] `embeddings/embedding_generator.py` — Vector embedding generation (Sentence Transformers)
- [ ] `vector_db/faiss_manager.py` — FAISS index management

### Phase 4: Services & Intelligence
- [ ] `services/pdf_service.py` — End-to-end PDF processing orchestration
- [ ] `services/embedding_service.py` — Embedding service layer
- [ ] `services/citation_service.py` — Citation mapping logic
- [ ] `services/rag_service.py` — RAG pipeline (retrieval + generation)

### Phase 5: API Routes
- [ ] `api/upload.py` — Upload endpoint
- [ ] `api/documents.py` — Document management endpoints
- [ ] `api/chat.py` — Chat/QA endpoint

## Installed Packages
- fastapi 0.136.3
- uvicorn 0.49.0
- sqlalchemy 2.0.50

## Rules
- Add comments explaining each code block
- Explain what each file does before building it
- Keep logic modular and tightly scoped to each file

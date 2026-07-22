# DatasheetAI ⚡

DatasheetAI is an advanced, AI-powered Electronics Knowledge Base and RAG (Retrieval-Augmented Generation) engine. It is explicitly designed for hardware engineers, allowing you to ingest complex component datasheets (PDFs) and interact with them in a highly dynamic engineering workspace.

## 🚀 Key Features

- **AI RAG Pipeline:** Upload hardware datasheets directly from the UI. The FastAPI backend instantly chunks and vectorizes the engineering data using OpenAI embeddings and Supabase (`pgvector`).
- **Intelligent Chat Interface:** Ask complex electronics questions (e.g. *"What is the absolute maximum voltage for the LM340?"*). The AI will scan your library, extract precise data, and cite its sources directly with contextual images.
- **DatasheetAI Pro (Infinite Whiteboard):** A premium workspace powered by a custom `tldraw` engine. Send AI schematics directly to an infinite engineering dot-grid whiteboard, natively extract PDF pages as interactive images using `pdf.js`, and sketch your circuit designs right next to the documentation!
- **Glassmorphic UI:** A stunning, premium frontend built with Next.js, Tailwind CSS, and fluid micro-animations.

## 🏗️ Tech Stack Architecture

**Frontend (`/frontend`)**
- Next.js 15 (React)
- Tailwind CSS (Styling)
- `tldraw` (Whiteboard Canvas Engine)
- `pdfjs-dist` (Native PDF Processing)
- `lucide-react` (Icons)

**Backend (`/backend-service`)**
- Python 3.10+
- FastAPI (API Routing)
- LangChain (RAG Framework)
- Supabase / PostgreSQL (Vector Database)
- PyMuPDF (`fitz`) (PDF Text/Image Extraction)
- OpenAI (`gpt-4o-mini`, `text-embedding-3-small`)

---

## 💻 Local Development Setup

To run DatasheetAI locally, you will need to start both the Python backend and the Next.js frontend.

### 1. Backend Setup
Navigate to the `backend-service` folder and set up your Python environment:

```bash
cd backend-service
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend-service` directory with your API keys:
```env
OPENAI_API_KEY="sk-..."
SUPABASE_URL="https://..."
SUPABASE_KEY="..."
```

Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
Open a new terminal, navigate to the `frontend` folder, and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment

- **Frontend:** Designed to be deployed seamlessly on **Vercel**. Set `NEXT_PUBLIC_API_URL` to your live backend URL in the Vercel dashboard.
- **Backend:** Designed to be deployed on **Render** or **Railway**. The app uses FastAPI `BackgroundTasks` for PDF uploading, so it should be hosted on a dedicated server environment, not serverless functions.

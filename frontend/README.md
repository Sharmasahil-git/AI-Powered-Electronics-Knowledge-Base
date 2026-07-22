# DatasheetAI - Frontend Web Application

This is the Next.js frontend application for **DatasheetAI**, featuring a stunning glassmorphic interface and a highly advanced interactive Whiteboard engine.

## 🌟 Features
- **AI Chat Interface:** Chat seamlessly with your engineering datasheets via the FastAPI RAG backend.
- **Infinite Whiteboard:** Powered by `tldraw`, allowing you to sketch circuits on an engineering dot-grid.
- **Native PDF Extraction:** Uses `pdfjs-dist` to silently parse uploaded PDFs in the browser and extract pages as draggable images onto the whiteboard.


## 🛠 Getting Started

### Installation
First, install the required NPM packages:

```bash
npm install
```

### Environment Variables
Create a `.env.local` file in the root of the `frontend` directory. If this is left empty, the app will securely default to connecting to your Render URL in production, and `localhost:8000` in development.

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running the Server
Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🚀 Deployment
This frontend is optimized for deployment on **Vercel**. When deploying, ensure you configure the `NEXT_PUBLIC_API_URL` environment variable in your Vercel project settings to point to your live backend server (e.g., `https://datasheetai.onrender.com`).

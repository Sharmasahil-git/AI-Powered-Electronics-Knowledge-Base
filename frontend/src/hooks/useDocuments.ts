import { useState, useCallback, useEffect } from "react";
import { getSessionId } from "@/utils/session";

export interface Document {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  status: string; // "pending", "processing", "text_ready", "completed", "failed"
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? "https://datasheetai.onrender.com" : "http://localhost:8000");
const WS_BASE = API_BASE.replace(/^http/, "ws");

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [wsConnections, setWsConnections] = useState<Record<number, WebSocket>>({});

  const sessionId = getSessionId();
  const headers = {
    "X-Session-ID": sessionId
  };

  const connectWebSocket = useCallback((docId: number) => {
    if (wsConnections[docId]) return; // already connected

    const ws = new WebSocket(`${WS_BASE}/api/ws/${docId}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setDocuments(prev => prev.map(doc => {
          if (doc.id === docId) {
            return { ...doc, status: data.status };
          }
          return doc;
        }));

        if (data.status === "completed" || data.status === "failed") {
          ws.close();
          setWsConnections(prev => {
            const next = { ...prev };
            delete next[docId];
            return next;
          });
        }
      } catch (err) {}
    };

    ws.onclose = () => {
      setWsConnections(prev => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
    };

    setWsConnections(prev => ({ ...prev, [docId]: ws }));
  }, [wsConnections]);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/documents/`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
        
        data.documents.forEach((doc: Document) => {
          if (doc.status === "processing" || doc.status === "text_ready") {
            connectWebSocket(doc.id);
          }
        });
      }
    } catch (err) {}
  }, [sessionId, connectWebSocket]);

  useEffect(() => {
    fetchDocuments();
    return () => {
      Object.values(wsConnections).forEach(ws => ws.close());
    };
  }, []);

  const uploadFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers, // Do NOT set Content-Type for FormData
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newDoc: Document = {
          id: data.id,
          filename: data.filename,
          file_path: data.file_path || "",
          file_size: file.size,
          status: data.status,
          created_at: new Date().toISOString()
        };
        
        setDocuments(prev => [newDoc, ...prev]);
        setSelectedDocs(prev => prev.includes(data.id) ? prev : [...prev, data.id]);
        setIsUploading(false);
        connectWebSocket(data.id);
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.detail || "Unknown error"}`);
      }
    } catch (err) {
      alert("Failed to connect to backend server.");
    }
  };

  const deleteDocument = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/documents/${docId}`, {
        method: "DELETE",
        headers
      });

      if (res.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        setSelectedDocs(prev => prev.filter(id => id !== docId));
      }
    } catch (err) {}
  };

  const toggleSelectDoc = (docId: number) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId) 
        : [...prev, docId]
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return {
    documents,
    selectedDocs,
    setSelectedDocs,
    isUploading,
    setIsUploading,
    uploadFile,
    deleteDocument,
    toggleSelectDoc,
    formatBytes
  };
}

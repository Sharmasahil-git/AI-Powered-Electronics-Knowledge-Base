import { useState, useCallback, useEffect } from "react";
import { getSessionId } from "@/utils/session";

export interface CitationSource {
  document_id: number;
  document_name: string;
  page_number: number;
  chunk_text: string;
  relevance_score: number;
  image_url?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  sources?: CitationSource[];
}

export interface ChatThread {
  id: number;
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? "https://datasheetai.onrender.com" : "http://localhost:8000");

export function useChatSessions() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const sessionId = getSessionId();
  const headers = {
    "Content-Type": "application/json",
    "X-Session-ID": sessionId
  };

  // Fetch all threads for sidebar
  const fetchThreads = useCallback(async () => {
    setIsLoadingThreads(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/threads`, { headers });
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    } finally {
      setIsLoadingThreads(false);
    }
  }, [sessionId]);

  // Load a specific thread's messages
  const loadThread = useCallback(async (threadId: number) => {
    setActiveThreadId(threadId);
    setIsChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/threads/${threadId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const loadedMessages: ChatMessage[] = [];
        data.messages.forEach((item: any) => {
          loadedMessages.push({ id: `q-${item.id}`, sender: "user", text: item.question });
          
          let parsedSources = item.sources;
          if (typeof item.sources === 'string') {
            try { parsedSources = JSON.parse(item.sources); } 
            catch (e) {}
          }
          loadedMessages.push({ id: `a-${item.id}`, sender: "ai", text: item.answer, sources: parsedSources });
        });
        setMessages(loadedMessages);
      }
    } catch (err) {
      console.error("Failed to load thread:", err);
    } finally {
      setIsChatLoading(false);
    }
  }, [sessionId]);

  // Send a new message
  const sendMessage = async (text: string, documentIds?: number[]) => {
    if (!text.trim()) return;

    const tempId = Math.random().toString();
    setMessages(prev => [...prev, { id: tempId, sender: "user", text }]);
    setIsChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          question: text,
          document_ids: documentIds && documentIds.length > 0 ? documentIds : null,
          thread_id: activeThreadId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: `new-a-${Math.random()}`,
          sender: "ai",
          text: data.answer,
          sources: data.sources
        }]);
        
        // If this was a new thread (we didn't have an activeThreadId), set it and refresh sidebar
        if (!activeThreadId && data.thread_id) {
          setActiveThreadId(data.thread_id);
          fetchThreads(); // Refresh sidebar to show new thread
        }
      } else {
        setMessages(prev => [...prev, { id: `err-${tempId}`, sender: "ai", text: "Sorry, an error occurred." }]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages(prev => [...prev, { id: `err-${tempId}`, sender: "ai", text: "Connection error." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Rename a thread (optimistic)
  const renameThread = async (threadId: number, newTitle: string) => {
    const prevThreads = [...threads];
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, title: newTitle } : t));
    try {
      const res = await fetch(`${API_BASE}/api/chat/threads/${threadId}/rename`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ title: newTitle })
      });
      if (!res.ok) throw new Error("Rename failed");
    } catch (err) {
      setThreads(prevThreads); // Rollback
    }
  };

  // Delete a thread (optimistic)
  const deleteThread = async (threadId: number) => {
    const prevThreads = [...threads];
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
      setMessages([]);
    }
    try {
      const res = await fetch(`${API_BASE}/api/chat/threads/${threadId}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      setThreads(prevThreads); // Rollback
    }
  };

  // Pin a thread
  const pinThread = async (threadId: number, isPinned: boolean) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_pinned: isPinned } : t));
    try {
      await fetch(`${API_BASE}/api/chat/threads/${threadId}/pin?is_pinned=${isPinned}`, {
        method: "PUT",
        headers
      });
      fetchThreads(); // Re-sort
    } catch (err) {}
  };
  
  const startNewChat = () => {
    setActiveThreadId(null);
    setMessages([{
      id: "welcome",
      sender: "ai",
      text: "Welcome to the workspace! Select datasheets to start auditing."
    }]);
  };

  // Fetch threads when the dashboard first loads
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    activeThreadId,
    messages,
    isLoadingThreads,
    isChatLoading,
    fetchThreads,
    loadThread,
    sendMessage,
    renameThread,
    deleteThread,
    pinThread,
    startNewChat
  };
}

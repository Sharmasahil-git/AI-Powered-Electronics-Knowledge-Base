"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

// Custom Hooks
import { useChatSessions } from "@/hooks/useChatSessions";
import { useDocuments } from "@/hooks/useDocuments";

// Components
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import DocumentLibrary from "@/components/chat/DocumentLibrary";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const {
    threads,
    activeThreadId,
    messages,
    isLoadingThreads,
    isChatLoading,
    loadThread,
    sendMessage,
    renameThread,
    deleteThread,
    pinThread,
    startNewChat
  } = useChatSessions();

  const {
    documents,
    selectedDocs,
    setSelectedDocs,
    isUploading,
    setIsUploading,
    uploadFile,
    deleteDocument,
    toggleSelectDoc,
    formatBytes
  } = useDocuments();

  return (
    <main className="h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans">

      {/* LEFT: Sidebar */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="w-[260px] flex-shrink-0 flex flex-col h-full bg-[var(--sidebar-bg)]"
      >
        {/* Sidebar top — logo row */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[14px] font-bold tracking-tight text-[var(--text-primary)]">
              Datasheet<span className="text-[var(--text-secondary)]">AI</span>
            </span>
          </div>
          {mounted && (
            <button 
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          )}
        </div>

        {/* Documents */}
        <DocumentLibrary 
          documents={documents}
          selectedDocs={selectedDocs}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          onUpload={uploadFile}
          onDelete={deleteDocument}
          onToggleSelect={toggleSelectDoc}
          formatBytes={formatBytes}
        />

        {/* Chat History */}
        <Sidebar 
          threads={threads}
          activeThreadId={activeThreadId}
          isLoading={isLoadingThreads}
          onSelectThread={loadThread}
          onNewChat={startNewChat}
          onRename={renameThread}
          onDelete={deleteThread}
          onPin={pinThread}
        />
      </motion.div>

      {/* RIGHT: Chat */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex-1 flex flex-col h-full"
      >
        <ChatWindow 
          messages={messages}
          isLoading={isChatLoading}
          onSendMessage={(text) => sendMessage(text, selectedDocs)}
          selectedDocsCount={selectedDocs.length}
          onClearFilters={() => setSelectedDocs([])}
          onOpenUpload={() => setIsUploading(true)}
        />
      </motion.div>

    </main>
  );
}

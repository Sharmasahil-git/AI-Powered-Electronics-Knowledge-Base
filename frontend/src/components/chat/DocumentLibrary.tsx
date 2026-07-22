import { useRef } from "react";
import { Search, UploadCloud, FileText, Trash2, X, FolderOpen, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Document } from "@/hooks/useDocuments";

interface DocumentLibraryProps {
  documents: Document[];
  selectedDocs: number[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
  onUpload: (file: File) => void;
  onDelete: (id: number) => void;
  onToggleSelect: (id: number) => void;
  formatBytes: (bytes: number) => string;
}

export default function DocumentLibrary({
  documents,
  selectedDocs,
  searchQuery,
  setSearchQuery,
  isUploading,
  setIsUploading,
  onUpload,
  onDelete,
  onToggleSelect,
  formatBytes
}: DocumentLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = documents.filter(doc => 
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <>
      {/* Documents section — compact, at bottom of sidebar */}
      <div className="border-t border-[var(--border-color)] px-2 pt-2 pb-2 flex flex-col gap-1" style={{ maxHeight: '35%' }}>
        {/* Header row */}
        <div className="flex items-center justify-between px-1">
          <button 
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-2 px-1 py-1.5 rounded-lg text-[13px] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] transition-colors"
          >
            <FolderOpen size={16} />
            Documents
          </button>
          <button 
            onClick={() => setIsUploading(true)}
            className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors"
            title="Upload"
          >
            <UploadCloud size={14} />
          </button>
        </div>

        {/* Search — only show if there are documents */}
        {documents.length > 3 && (
          <div className="relative px-1">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[12px] bg-[var(--input-bg)] focus:outline-none transition-all placeholder:text-[var(--text-secondary)] text-[var(--text-primary)]"
            />
          </div>
        )}

        {/* Document list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredDocs.length === 0 ? (
            <p className="text-[11px] text-[var(--text-secondary)] px-2 py-3 text-center">No documents</p>
          ) : (
            filteredDocs.map(doc => {
              const isSelected = selectedDocs.includes(doc.id);
              return (
                <div 
                  key={doc.id}
                  onClick={() => onToggleSelect(doc.id)}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] cursor-pointer transition-colors duration-100 ${
                    isSelected 
                      ? "bg-[var(--active-bg)] text-[var(--text-primary)]" 
                      : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <FileText size={14} className={`flex-shrink-0 ${isSelected ? "text-blue-500" : ""}`} />
                  <span className="truncate flex-1">{doc.filename}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                    doc.status === "completed" 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : doc.status === "text_ready"
                      ? "bg-blue-500/10 text-blue-500"
                      : doc.status === "failed"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-amber-500/10 text-amber-500 animate-pulse"
                  }`}>
                    {doc.status === "completed" ? "Ready" : 
                     doc.status === "text_ready" ? "Text Ready" : 
                     doc.status === "failed" ? "Failed" : 
                     "Processing..."}
                  </span>
                  
                  <div className="opacity-0 group-hover:opacity-100 flex items-center flex-shrink-0 ml-1 transition-opacity duration-100">
                    <a 
                      href={doc.file_path && !doc.file_path.startsWith('http') 
                        ? `${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? "https://datasheetai.onrender.com" : "http://localhost:8000")}${doc.file_path.replace('storage/uploads', '/uploads')}`
                        : doc.file_path || '#'}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => { 
                        if (!doc.file_path) {
                          e.preventDefault();
                          alert("PDF path is missing. Please refresh the page and try again.");
                        }
                      }}
                      className="p-1 text-[var(--text-secondary)] hover:text-blue-400 rounded transition-colors"
                      title="Open PDF"
                    >
                      <ExternalLink size={13} />
                    </a>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                      className="p-1 text-[var(--text-secondary)] hover:text-red-400 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Upload Modal */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploading(false)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-md bg-[var(--chat-bg)] border border-[var(--border-color)] rounded-2xl p-5 shadow-2xl z-10 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Upload Datasheet</h3>
                <button 
                  onClick={() => setIsUploading(false)}
                  className="p-1 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-[var(--border-color)] hover:border-blue-500/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[var(--hover-bg)] transition-all duration-200"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden" 
                />
                
                <div className="p-4 rounded-xl bg-[var(--input-bg)] group-hover:bg-blue-500/10 transition-all duration-200">
                  <UploadCloud size={28} className="text-[var(--text-secondary)] group-hover:text-blue-500 transition-colors duration-200" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">Click to select PDF</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Upload manufacturer schematics and pin maps</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

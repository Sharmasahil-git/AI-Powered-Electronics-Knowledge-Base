import { FormEvent, useRef, useEffect, useState } from "react";
import { Sparkles, Send, FileText, Plus, ChevronDown, Share, MoreHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/hooks/useChatSessions";
import { useRouter } from "next/navigation";
import { MoveRight, LayoutDashboard } from "lucide-react";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  selectedDocsCount: number;
  onClearFilters: () => void;
  onOpenUpload?: () => void;
}

// Secure API routing: Uses env var first, defaults to Render in production, localhost in development
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? "https://datasheetai.onrender.com" : "http://localhost:8000");

export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  selectedDocsCount,
  onClearFilters,
  onOpenUpload
}: ChatWindowProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Secret Admin Mode for Canvas
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    // Check if the secret '?admin=true' is in the URL
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('admin=true')) {
        localStorage.setItem('canvasAdmin', 'true');
      }
      if (localStorage.getItem('canvasAdmin') === 'true') {
        setIsAdmin(true);
      }
    }
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get("message") as string;
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      e.currentTarget.reset();
    }
  };

  return (
    <div className="relative flex-grow flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>


      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 text-[var(--text-primary)]">
        {/* Left: Model Selector */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[15px] font-semibold hover:bg-[var(--hover-bg)] transition-colors">
          DatasheetAI <ChevronDown size={16} className="text-[var(--text-secondary)]" />
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => isAdmin ? router.push('/canvas') : setShowPremiumModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border border-[var(--border-color)] bg-white dark:bg-[#0A0A0B] hover:bg-[var(--hover-bg)] hover:border-emerald-500/50 transition-colors shadow-sm mr-2"
          >
            <LayoutDashboard size={14} className="text-emerald-500" />
            Open Canvas
          </button>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-blue-400 hover:bg-[var(--hover-bg)] transition-colors">
            <Sparkles size={14} className="fill-current" />
            Upgrade
          </button>
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <Share size={14} />
            Share
          </button>
          <button className="p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Filter Info (if active) */}
      {selectedDocsCount > 0 && (
        <div className="px-6 pb-2 flex items-center justify-center gap-2 text-[12px] text-[var(--text-secondary)]">
          <span>Querying {selectedDocsCount} document{selectedDocsCount > 1 ? 's' : ''}</span>
          <button 
            onClick={onClearFilters}
            className="text-blue-500 hover:underline font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {/* Chat feed */}
      <div className="flex-grow overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
        {messages.length === 0 && !isLoading && (
          <div className="flex-grow flex flex-col items-center justify-center px-4 max-w-[700px] mx-auto text-center pt-12 pb-24">
            <div className="w-16 h-16 bg-white dark:bg-[#0A0A0B] border border-[var(--border-color)] shadow-sm rounded-2xl flex items-center justify-center mb-6">
              <Sparkles size={28} className="text-[var(--text-primary)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-[var(--text-primary)] mb-4">
              How can I help you design?
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] max-w-md leading-relaxed mb-10">
              Upload a datasheet from the sidebar or select an existing one to instantly extract pinouts, ratings, and footprints.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              <button onClick={() => onSendMessage("Extract the Absolute Maximum Ratings table.")} className="text-left px-5 py-4 rounded-xl border border-[var(--border-color)] bg-white/50 dark:bg-black/50 backdrop-blur-sm hover:bg-[var(--hover-bg)] transition-colors group">
                <div className="text-[14px] font-medium text-[var(--text-primary)] mb-1 group-hover:text-blue-500 transition-colors">Extract Ratings</div>
                <div className="text-[12px] text-[var(--text-secondary)]">Pull the absolute maximum ratings table.</div>
              </button>
              <button onClick={() => onSendMessage("Show me the typical application circuit.")} className="text-left px-5 py-4 rounded-xl border border-[var(--border-color)] bg-white/50 dark:bg-black/50 backdrop-blur-sm hover:bg-[var(--hover-bg)] transition-colors group">
                <div className="text-[14px] font-medium text-[var(--text-primary)] mb-1 group-hover:text-emerald-500 transition-colors">Find Schematics</div>
                <div className="text-[12px] text-[var(--text-secondary)]">Locate typical application circuits.</div>
              </button>
              <button onClick={() => onSendMessage("What is the operating voltage range?")} className="text-left px-5 py-4 rounded-xl border border-[var(--border-color)] bg-white/50 dark:bg-black/50 backdrop-blur-sm hover:bg-[var(--hover-bg)] transition-colors group">
                <div className="text-[14px] font-medium text-[var(--text-primary)] mb-1 group-hover:text-purple-500 transition-colors">Check Voltage</div>
                <div className="text-[12px] text-[var(--text-secondary)]">Find the operating voltage range.</div>
              </button>
              <button onClick={() => onSendMessage("What is the physical footprint/package size?")} className="text-left px-5 py-4 rounded-xl border border-[var(--border-color)] bg-white/50 dark:bg-black/50 backdrop-blur-sm hover:bg-[var(--hover-bg)] transition-colors group">
                <div className="text-[14px] font-medium text-[var(--text-primary)] mb-1 group-hover:text-orange-500 transition-colors">Get Footprint</div>
                <div className="text-[12px] text-[var(--text-secondary)]">Identify the physical package dimensions.</div>
              </button>
            </div>
          </div>
        )}

        <div className="max-w-[700px] w-full mx-auto px-4 py-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id}>
              {/* User message */}
              {msg.sender === "user" ? (
                <div className="flex justify-end mb-6">
                  <div className="max-w-[70%] px-4 py-2.5 rounded-3xl bg-[var(--msg-user-bg)] text-[var(--text-primary)] text-[15px]">
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                /* AI message */
                <div className="mb-6 relative group">
                  <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => {
                        if (!isAdmin) {
                          setShowPremiumModal(true);
                          return;
                        }
                        const payload: any = { text: msg.text, images: [] };
                        const hasImages = msg.sources && msg.sources.some(src => src.image_url);
                        if (hasImages && msg.sources) {
                          const imgUrls = Array.from(new Set(msg.sources.filter(s => s.image_url).map(s => s.image_url)));
                          imgUrls.forEach(url => {
                            const src = url?.startsWith('http') ? url : `${API_BASE}${url}`;
                            payload.images.push(src);
                          });
                        }
                        
                        localStorage.setItem("pendingCanvasData", JSON.stringify(payload));
                        router.push('/canvas');
                      }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-white dark:bg-[#0A0A0B] shadow-sm text-[12px] font-medium text-[var(--text-secondary)] hover:text-blue-500 hover:border-blue-500/50 transition-colors"
                      >
                        <MoveRight size={14} />
                        Send to Canvas
                      </button>
                    </div>
                  {/* Visual context images */}
                  {msg.sources && msg.sources.some(src => src.image_url) && (
                    <div className="flex flex-col gap-3 mb-4">
                      {Array.from(new Set(msg.sources.filter(s => s.image_url).map(s => s.image_url))).map((imgUrl, idx) => {
                        const isAbsoluteUrl = imgUrl?.startsWith('http');
                        const src = isAbsoluteUrl ? imgUrl : `${API_BASE}${imgUrl}`;
                        return (
                          <div key={idx} className="relative rounded-xl overflow-hidden border border-[var(--border-color)] bg-white w-full max-w-md">
                            <img 
                              src={src} 
                              alt="Context diagram" 
                              className="w-full h-auto object-contain bg-white"
                              style={{ maxHeight: '500px' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* AI text response — no bubble, plain text like ChatGPT */}
                  <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-[1.7] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_p]:mb-3 [&_p:last-child]:mb-0 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-[var(--border-color)] [&_th]:p-2.5 [&_th]:bg-[var(--hover-bg)] [&_th]:text-left [&_td]:border [&_td]:border-[var(--border-color)] [&_td]:p-2.5 break-words text-[var(--text-primary)]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  {/* Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {msg.sources.map((src, i) => (
                        <div
                          key={i} 
                          title={src.chunk_text}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-colors cursor-default"
                        >
                          <FileText size={11} className="opacity-50" />
                          <span className="truncate max-w-[120px]">{src.document_name}</span>
                          <span className="opacity-40">p.{src.page_number}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[14px]">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-current thinking-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current thinking-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current thinking-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input area — ChatGPT style */}
      <div className="pb-4 pt-2 relative z-10">
        <div className="max-w-[700px] mx-auto px-4">
          <form onSubmit={handleSubmit} className="relative flex items-end bg-white/70 dark:bg-[#050505]/70 backdrop-blur-md border border-[var(--border-color)] shadow-sm rounded-3xl px-4 py-2 gap-2">
            <button 
              type="button"
              onClick={onOpenUpload}
              title="Upload PDF"
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-full transition-all flex items-center justify-center flex-shrink-0 mb-0.5"
            >
              <Plus size={18} />
            </button>
            <textarea 
              name="message"
              placeholder="Ask anything"
              rows={1}
              className="flex-1 resize-none bg-transparent py-2 text-[15px] focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] custom-scrollbar min-h-[24px] max-h-[150px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              onInput={(e) => {
                const target = e.currentTarget;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 150) + 'px';
              }}
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="p-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full hover:opacity-80 disabled:opacity-30 transition-all flex items-center justify-center flex-shrink-0 mb-0.5"
            >
              <Send size={14} />
            </button>
          </form>
          <p className="text-center text-[11px] text-[var(--text-secondary)] mt-2 select-none">
            AI can make mistakes. Verify critical specifications against the original datasheet.
          </p>
        </div>
      </div>
      {/* Premium Paywall Modal */}
      {showPremiumModal && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0A0A0B] border border-[var(--border-color)] shadow-2xl rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Sparkles className="text-amber-500" size={24} />
            </div>
            <h3 className="text-[18px] font-semibold text-[var(--text-primary)] mb-2">Premium Feature</h3>
            <p className="text-[14px] text-[var(--text-secondary)] mb-6 leading-relaxed">
              The Infinite Whiteboard and PDF Extraction engine are exclusive to DatasheetAI Pro. Upgrade to unlock these tools!
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowPremiumModal(false)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[14px] font-medium transition-colors shadow-sm shadow-amber-500/20"
              >
                Upgrade to Pro
              </button>
              <button 
                onClick={() => setShowPremiumModal(false)}
                className="w-full py-2.5 text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] rounded-xl text-[14px] font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

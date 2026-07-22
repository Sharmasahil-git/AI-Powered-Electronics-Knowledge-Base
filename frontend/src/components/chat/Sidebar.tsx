import { useState, useRef, useEffect } from "react";
import { MessageSquare, Plus, Pencil, Trash2, Pin, Loader2, PinOff, SquarePen } from "lucide-react";
import { ChatThread } from "@/hooks/useChatSessions";

interface SidebarProps {
  threads: ChatThread[];
  activeThreadId: number | null;
  isLoading: boolean;
  onSelectThread: (id: number) => void;
  onNewChat: () => void;
  onRename: (id: number, newTitle: string) => void;
  onDelete: (id: number) => void;
  onPin: (id: number, isPinned: boolean) => void;
}

export default function Sidebar({
  threads,
  activeThreadId,
  isLoading,
  onSelectThread,
  onNewChat,
  onRename,
  onDelete,
  onPin
}: SidebarProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Group threads by date logic
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const last7Days = today - 7 * 86400000;

  const grouped = {
    pinned: [] as ChatThread[],
    today: [] as ChatThread[],
    yesterday: [] as ChatThread[],
    previous7: [] as ChatThread[],
    older: [] as ChatThread[]
  };

  threads.forEach(t => {
    if (t.is_pinned) {
      grouped.pinned.push(t);
      return;
    }
    const threadDate = new Date(t.updated_at).getTime();
    if (threadDate >= today) grouped.today.push(t);
    else if (threadDate >= yesterday) grouped.yesterday.push(t);
    else if (threadDate >= last7Days) grouped.previous7.push(t);
    else grouped.older.push(t);
  });

  const startRename = (t: ChatThread, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(t.id);
    setEditTitle(t.title);
  };

  const submitRename = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const renderGroup = (label: string, groupThreads: ChatThread[]) => {
    if (groupThreads.length === 0) return null;

    return (
      <div className="mb-3">
        <h3 className="px-2 text-[11px] font-medium text-[var(--text-secondary)] mb-1">{label}</h3>
        <ul>
          {groupThreads.map(t => {
            const isActive = t.id === activeThreadId;
            const isEditing = t.id === editingId;

            return (
              <li key={t.id} className="relative group">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectThread(t.id)}
                  onKeyDown={(e) => e.key === "Enter" && onSelectThread(t.id)}
                  className={`w-full text-left px-2 py-2 rounded-lg text-[13px] transition-colors duration-100 flex items-center gap-0 cursor-pointer ${
                    isActive 
                      ? "bg-[var(--active-bg)] text-[var(--text-primary)]" 
                      : "text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {isEditing ? (
                    <input
                      ref={editInputRef}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={(e) => e.key === "Enter" && submitRename()}
                      className="bg-[var(--input-bg)] text-[var(--text-primary)] px-2 py-0.5 rounded border border-blue-500/40 w-full text-[13px] focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="truncate flex-1">{t.title}</span>
                  )}

                  {/* Hover Actions */}
                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center flex-shrink-0 ml-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onPin(t.id, !t.is_pinned); }}
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors"
                        title={t.is_pinned ? "Unpin" : "Pin"}
                      >
                        {t.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                      </button>
                      <button 
                        onClick={(e) => startRename(t, e)}
                        className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors"
                        title="Rename"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                        className="p-1 text-[var(--text-secondary)] hover:text-red-400 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 pt-3">
      {/* New Chat — top row like ChatGPT */}
      <div className="px-2 pb-3">
        <button 
          onClick={onNewChat}
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] transition-colors w-full"
        >
          <SquarePen size={16} />
          New chat
        </button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={16} className="animate-spin text-[var(--text-secondary)]" />
          </div>
        ) : threads.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <p className="text-[12px] text-[var(--text-secondary)]">No recent chats</p>
          </div>
        ) : (
          <>
            {renderGroup("Pinned", grouped.pinned)}
            {renderGroup("Today", grouped.today)}
            {renderGroup("Yesterday", grouped.yesterday)}
            {renderGroup("Previous 7 Days", grouped.previous7)}
            {renderGroup("Older", grouped.older)}
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Tldraw, createShapeId, Editor, AssetRecordType } from "tldraw";
import "tldraw/tldraw.css";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";
import Link from "next/link";

export default function CanvasPage() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // PDF Extraction State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pageRange, setPageRange] = useState("1-5");
  const [isExtracting, setIsExtracting] = useState(false);

  const handleMount = (editor: Editor) => {
    setEditor(editor);
    editor.updateInstanceState({ isGridMode: true });

    const pendingDataStr = localStorage.getItem("pendingCanvasData");
    if (pendingDataStr) {
      try {
        const pendingData = JSON.parse(pendingDataStr);
        let currentY = 100;
        
        if (pendingData.images && pendingData.images.length > 0) {
          pendingData.images.forEach((imgUrl: string) => {
            const assetId = AssetRecordType.createId();
            editor.createAssets([{
              id: assetId,
              type: "image",
              typeName: "asset",
              props: {
                name: "chat-image",
                src: imgUrl,
                w: 400,
                h: 300,
                mimeType: "image/png",
                isAnimated: false
              },
              meta: {}
            }]);

            const id = createShapeId();
            editor.createShape({
              id,
              type: "image",
              x: 100,
              y: currentY,
              props: { w: 400, h: 300, assetId },
            });
            currentY += 350;
          });
        }
        
        if (pendingData.text) {
          const id = createShapeId();
          // @ts-ignore - tldraw union types can be overly strict with dynamic props
          editor.createShape({
            id,
            type: "geo", // Geo shape supports text and acts as a textbox
            x: 100,
            y: currentY,
            props: { text: String(pendingData.text) },
          } as any);
        }
        
        localStorage.removeItem("pendingCanvasData");
      } catch (e) {
        console.error("Failed to parse pending canvas data", e);
      }
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setShowModal(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i > 0 && i <= maxPages) pages.add(i);
          }
        }
      } else {
        const page = Number(part);
        if (!isNaN(page) && page > 0 && page <= maxPages) {
          pages.add(page);
        }
      }
    }
    
    let result = Array.from(pages).sort((a, b) => a - b);
    if (result.length > 50) {
      alert("You selected more than 50 pages. Capping to the first 50 selected pages to prevent browser crash.");
      result = result.slice(0, 50);
    }
    return result;
  };

  const extractPdfPages = async () => {
    if (!pdfFile || !editor) return;
    setIsExtracting(true);

    try {
      // Dynamically import pdfjs-dist ONLY on the client side
      // This prevents Next.js from trying to execute pdf.js on the Node.js server (which causes the DOMMatrix crash)
      const pdfjsLib = await import("pdfjs-dist");
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const pagesToExtract = parsePageRange(pageRange, pdf.numPages);
      
      if (pagesToExtract.length === 0) {
        alert("Invalid page range. The PDF has " + pdf.numPages + " pages.");
        setIsExtracting(false);
        return;
      }

      const center = editor.getViewportPageBounds().center;
      let currentY = center.y - 300; // Start a bit above center

      for (let i = 0; i < pagesToExtract.length; i++) {
        const pageNum = pagesToExtract[i];
        const page = await pdf.getPage(pageNum);
        
        // Render at 2x scale for better clarity on whiteboard
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        if (!context) continue;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // @ts-ignore - pdf.js types are overly strict on RenderParameters in newer versions
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8); // JPEG is much smaller than PNG
        
        const displayWidth = viewport.width / 2;
        const displayHeight = viewport.height / 2;

        const assetId = AssetRecordType.createId();
        editor.createAssets([{
          id: assetId,
          type: "image",
          typeName: "asset",
          props: {
            name: `page-${pageNum}`,
            src: dataUrl,
            w: displayWidth,
            h: displayHeight,
            mimeType: "image/jpeg",
            isAnimated: false
          },
          meta: {}
        }]);

        editor.createShape({
          id: createShapeId(),
          type: "image",
          x: center.x - (displayWidth / 2),
          y: currentY,
          props: {
            w: displayWidth,
            h: displayHeight,
            assetId: assetId,
          },
        });

        // Add 50px vertical gap between pages
        currentY += displayHeight + 50;
      }

      setShowModal(false);
      setPdfFile(null);
    } catch (e) {
      console.error("Failed to extract PDF", e);
      alert("Failed to read PDF file.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <main className="w-screen h-screen bg-[var(--bg-primary)] overflow-hidden flex flex-col font-sans relative">
      {/* Top Nav */}
      <div className="absolute top-4 left-4 z-[999]">
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-[#0A0A0B]/70 backdrop-blur-md border border-[var(--border-color)] rounded-xl text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm transition-colors">
          <ArrowLeft size={16} />
          Back to Chat
        </Link>
      </div>

      {/* Upload Button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 backdrop-blur-md border border-blue-500/30 rounded-xl text-[14px] font-medium shadow-sm transition-all hover:scale-105"
        >
          <Upload size={16} />
          Spawn PDF Pages
        </button>
        <input 
          type="file" 
          accept="application/pdf" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={onFileSelect} 
        />
      </div>

      {/* PDF Range Modal */}
      {showModal && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0A0A0B] border border-[var(--border-color)] shadow-2xl rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">Extract PDF Pages</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-[13px] text-[var(--text-secondary)] mb-4 leading-relaxed">
              File: <span className="font-medium text-[var(--text-primary)]">{pdfFile?.name}</span><br/>
              Enter the pages you want to extract as images onto the whiteboard. (Max 50 pages).
            </p>

            <input 
              type="text" 
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="e.g. 1-5, 8, 11-13"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 mb-6"
            />

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-colors"
                disabled={isExtracting}
              >
                Cancel
              </button>
              <button 
                onClick={extractPdfPages}
                disabled={isExtracting}
                className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[13px] font-medium transition-colors disabled:opacity-50"
              >
                {isExtracting && <Loader2 size={14} className="animate-spin" />}
                {isExtracting ? "Extracting..." : "Extract Pages"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 w-full h-full relative z-0">
        <Tldraw onMount={handleMount} />
      </div>
    </main>
  );
}

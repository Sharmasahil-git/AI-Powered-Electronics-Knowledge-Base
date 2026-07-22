"use client";

import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css"; // The CSS must be imported inside the wrapper!

interface CanvasWrapperProps {
  onMount: (editor: Editor) => void;
}

export default function CanvasWrapper({ onMount }: CanvasWrapperProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
      <Tldraw 
        onMount={onMount} 
        persistenceKey="datasheet-ai-pro-canvas"
      />
    </div>
  );
}

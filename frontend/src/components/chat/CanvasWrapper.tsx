"use client";

import React from "react";
import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css"; // The CSS must be imported inside the wrapper!

interface CanvasWrapperProps {
  onMount: (editor: Editor) => void;
}

export default function CanvasWrapper({ onMount }: CanvasWrapperProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {/* NO persistenceKey - forces in-memory store to prevent IndexedDB production crashes */}
      <Tldraw 
        onMount={onMount} 
        forceMobile={false}
      />
    </div>
  );
}

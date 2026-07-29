import { motion } from "framer-motion";
import { Settings, CheckSquare, Smartphone } from "lucide-react";

export default function ProcessSection() {
  return (
    <section className="relative w-full py-16 px-8 md:px-16 lg:px-24 flex flex-col items-center z-20 mt-12">
      
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center max-w-2xl mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-[var(--text-primary)] mb-4">
          Analyze
        </h2>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          Automatically extract diagrams, tables, and text from unstructured PDFs with absolute precision.
        </p>
      </motion.div>

      {/* 2-COLUMN CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl">
        
        {/* LEFT CARD: Vision Extraction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[540px] bg-white/80 dark:bg-[#050505] rounded-[2rem] border border-[var(--border-color)] overflow-hidden flex flex-col backdrop-blur-md"
        >
          {/* Deep Purple Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4c1d95]/40 to-[#6d28d9] opacity-80 pointer-events-none" />
          
          {/* Isometric Wireframe Glow (SVG) */}
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[60%] pointer-events-none">
            <svg viewBox="0 0 800 400" className="w-full h-full opacity-30" style={{ filter: "drop-shadow(0 0 10px rgba(139,92,246,0.5))" }}>
              <path d="M 400 100 L 600 200 L 400 300 L 200 200 Z" fill="transparent" stroke="currentColor" strokeWidth="1" className="text-black dark:text-white" />
              <path d="M 400 100 L 400 300" stroke="currentColor" strokeWidth="1" className="text-black dark:text-white" />
              <path d="M 200 200 L 600 200" stroke="currentColor" strokeWidth="1" className="text-black dark:text-white" />
              
              <path d="M 400 150 L 500 200 L 400 250 L 300 200 Z" fill="transparent" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-black dark:text-white" />
              <path d="M 400 300 L 400 400 M 200 200 L 100 250 M 600 200 L 700 250" stroke="currentColor" strokeWidth="1" className="text-black dark:text-white" />
            </svg>
          </div>

          {/* Card Text Content */}
          <div className="relative z-10 p-10 max-w-[90%]">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-3xl font-medium tracking-tight text-[var(--text-primary)]">Vision Extraction</h3>
              <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] text-[10px] font-mono border border-[var(--border-color)]">Beta</span>
            </div>
            <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-6">
              Deploy advanced multimodal models to parse complex schematics, pinouts, and thermal charts that traditional OCR misses. Verify the integrity of your hardware specs with built-in attestation.
            </p>
            <div className="flex gap-3">
              <button className="px-5 py-2 rounded-full bg-black/5 dark:bg-white/10 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-[13px] font-medium">
                Learn more
              </button>
              <button className="px-5 py-2 rounded-full bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-[13px] font-medium">
                View documentation
              </button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT CARD: Data Structuring */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-full min-h-[540px] bg-white/80 dark:bg-[#050505] rounded-[2rem] border border-[var(--border-color)] overflow-hidden flex flex-col justify-between backdrop-blur-md"
        >
          {/* Card Text Content */}
          <div className="relative z-10 p-10 pb-6 max-w-[90%]">
            <h3 className="text-3xl font-medium tracking-tight text-[var(--text-primary)] mb-3">Data Structuring</h3>
            <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-6">
              Turn unstructured PDF text into clean, validated JSON schemas automatically, without exposing your infrastructure to complex Regex rules.
            </p>
            <button className="px-5 py-2 rounded-full bg-black/5 dark:bg-white/10 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-[13px] font-medium">
              Learn more
            </button>
          </div>

          {/* Code Blocks Visual */}
          <div className="relative z-10 px-10 pb-10 flex flex-col gap-4 mt-auto">
            
            {/* Top Code Window */}
            <div className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-white/70 font-mono">parser.py</span>
                  <span className="text-[11px] text-white/30 font-mono">output.json</span>
                </div>
                <div className="px-2 py-1 bg-white/10 rounded border border-white/5 flex items-center gap-1 cursor-pointer">
                  <span className="text-[10px] text-white/60">Run Extraction</span>
                </div>
              </div>
              <div className="p-4 text-[12px] font-mono leading-loose">
                <div className="text-white/80"><span className="text-pink-400">const</span> extracted_data = <span className="text-pink-400">await</span> ai.extract(<span className="text-green-400">'LM358.pdf'</span>, schema)</div>
                <div className="text-white/80"><span className="text-blue-400">console</span>.<span className="text-blue-200">log</span>(extracted_data ? <span className="text-green-400">'Valid JSON'</span> : <span className="text-red-400">'Parse Failed'</span>)</div>
              </div>
            </div>

            {/* Bottom Code Window */}
            <div className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl overflow-hidden shadow-2xl opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-white/70 font-mono">schema.ts</span>
                </div>
              </div>
              <div className="p-4 text-[12px] font-mono leading-[1.6]">
                <div className="text-white/40">{'// AI guarantees payload matches this structure'}</div>
                <div className="text-white/80"><span className="text-pink-400">export type</span> OpAmp = {'{'}</div>
                <div className="text-white/80 pl-4"><span className="text-purple-400">partNumber</span>: <span className="text-blue-300">string</span>;</div>
                <div className="text-white/80 pl-4"><span className="text-purple-400">vccMax</span>: <span className="text-blue-300">number</span>;</div>
                <div className="text-white/80">{'}'};</div>
              </div>
            </div>

          </div>
        </motion.div>

      </div>

      {/* FOOTER FEATURE ROW */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-start gap-3"
        >
          <Settings className="text-[var(--text-secondary)] opacity-60 mt-0.5 shrink-0" size={16} />
          <p className="text-[12px] text-[var(--text-secondary)] opacity-80 leading-relaxed pr-4">
            Extract electrical characteristics into structured formats automatically.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-start gap-3"
        >
          <CheckSquare className="text-[var(--text-secondary)] opacity-60 mt-0.5 shrink-0" size={16} />
          <p className="text-[12px] text-[var(--text-secondary)] opacity-80 leading-relaxed pr-4">
            Identify and crop reference circuit diagrams before saving them to the DB.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-start gap-3"
        >
          <Smartphone className="text-[var(--text-secondary)] opacity-60 mt-0.5 shrink-0" size={16} />
          <p className="text-[12px] text-[var(--text-secondary)] opacity-80 leading-relaxed pr-4">
            Generate high-quality vector embeddings for instant retrieval on any device.
          </p>
        </motion.div>

      </div>

    </section>
  );
}

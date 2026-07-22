import { motion } from "framer-motion";
import { FileText, Cpu, Database, Server, Zap } from "lucide-react";

export default function PipelineSection() {
  return (
    <section className="relative w-full py-24 px-8 md:px-16 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-16 z-20">
      
      {/* LEFT COLUMN - Text Content */}
      <div className="flex-1 max-w-xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-[var(--text-primary)] leading-[1.15] mb-5">
            Automated Data Pipeline
          </h2>

          {/* Paragraph */}
          <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed mb-8 max-w-[95%]">
            An invisible ingestion proxy which automatically intercepts, chunks, and vectorizes selected sensitive datasheets before they touch your local server. No manual labeling required.
          </p>

          {/* Learn More Button */}
          <button className="px-6 py-2.5 rounded-full bg-[var(--hover-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-medium">
            Learn more
          </button>

        </motion.div>
      </div>

      {/* RIGHT COLUMN - Flow Layout Canvas */}
      <div className="flex-1 w-full h-[500px] relative hidden md:block">
        
        {/* SVG Connecting Lines (Animated) */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{ filter: "drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))" }}>
          {/* Line from PDF to Core */}
          <motion.path
            d="M 60 220 C 120 220, 150 220, 200 220"
            fill="transparent"
            stroke="url(#gradient-line)"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
          />
          {/* Line from Core to Top Pill */}
          <motion.path
            d="M 260 220 C 300 220, 320 120, 380 120"
            fill="transparent"
            stroke="url(#gradient-line)"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
          />
          {/* Line from Core to Mid Pill */}
          <motion.path
            d="M 260 220 C 320 220, 340 220, 420 220"
            fill="transparent"
            stroke="url(#gradient-line)"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.9, ease: "easeInOut" }}
          />
          {/* Line from Core to Bottom Pill */}
          <motion.path
            d="M 260 220 C 300 220, 320 320, 380 320"
            fill="transparent"
            stroke="url(#gradient-line)"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, delay: 1.0, ease: "easeInOut" }}
          />

          <defs>
            <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

        {/* 1. PDF Document Input (Left) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute left-0 top-[180px] w-20 h-24 bg-white/5 dark:bg-[#0A0A0B]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-lg shadow-xl flex flex-col items-center justify-center gap-2 z-10"
        >
          <FileText size={24} className="text-[var(--text-secondary)]" />
          <span className="text-[9px] font-mono text-[var(--text-secondary)] text-center px-1">LM358.pdf</span>
        </motion.div>

        {/* 2. Core AI Engine (Center) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.5, type: "spring", bounce: 0.4 }}
          className="absolute left-[190px] top-[180px] w-20 h-20 bg-[#0A0A0B] border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center z-20"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 animate-pulse" />
          <Cpu size={28} className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] z-10" />
        </motion.div>

        {/* 3. Output Pills (Right) */}
        {/* Top Pill */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="absolute right-[10%] top-[100px] px-5 py-2.5 bg-white/5 dark:bg-[#0A0A0B]/90 backdrop-blur-xl border border-[var(--border-color)] rounded-full shadow-lg z-20 flex items-center gap-2"
        >
          <Database size={12} className="text-purple-400" />
          <span className="text-[11px] font-mono text-[var(--text-secondary)]">part_number: <span className="text-[var(--text-primary)] font-medium">LM358</span></span>
        </motion.div>

        {/* Mid Pill */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="absolute right-0 top-[200px] px-5 py-2.5 bg-white/5 dark:bg-[#0A0A0B]/90 backdrop-blur-xl border border-[var(--border-color)] rounded-full shadow-lg z-20 flex items-center gap-2"
        >
          <Zap size={12} className="text-orange-400" />
          <span className="text-[11px] font-mono text-[var(--text-secondary)]">vcc_max: <span className="text-[var(--text-primary)] font-medium">32V</span></span>
        </motion.div>

        {/* Bottom Pill */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="absolute right-[10%] top-[300px] px-5 py-2.5 bg-white/5 dark:bg-[#0A0A0B]/90 backdrop-blur-xl border border-[var(--border-color)] rounded-full shadow-lg z-20 flex items-center gap-2"
        >
          <Server size={12} className="text-green-400" />
          <span className="text-[11px] font-mono text-[var(--text-secondary)]">package: <span className="text-[var(--text-primary)] font-medium">SOIC-8</span></span>
        </motion.div>

        {/* 4. Processing Terminal (Bottom Left) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute left-0 bottom-[10%] w-[320px] bg-[#0A0A0B] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-30"
        >
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <span className="ml-2 text-[9px] text-white/40 font-mono">ingestion_pipeline.sh</span>
          </div>
          <div className="p-4 text-[10px] font-mono leading-[1.8] text-white/60">
            <div><span className="text-green-400">➜</span>  <span className="text-blue-400">~</span> ./start_vectorization</div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 1.5 }}
            >
              [INFO] Parsing LM358.pdf...
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 2.0 }}
            >
              <span className="text-orange-400">[WARN]</span> Found 3 schematics. Extracting...
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 2.5 }}
            >
              <span className="text-green-400">[OK]</span> Embeddings saved to pgvector.
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

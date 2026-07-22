import { motion } from "framer-motion";
import { Cpu, Database, CircuitBoard } from "lucide-react";

export default function FeatureSection() {
  return (
    <section className="relative w-full py-24 px-8 md:px-16 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-16 z-20">
      
      {/* LEFT COLUMN - Text Content */}
      <div className="flex-1 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-color)] bg-[var(--hover-bg)] mb-6">
            <SparkleIcon />
            <span className="text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
              The ultimate engineering companion
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--text-primary)] leading-[1.1] mb-6">
            Component data that&apos;s instantly searchable and insightful
          </h2>

          {/* Paragraph */}
          <p className="text-[17px] text-[var(--text-secondary)] leading-relaxed mb-8 max-w-[90%]">
            Automatically extract pinouts, thermal characteristics, and reference circuits from any datasheet. With the DatasheetAI platform you can run powerful searches and safely interact with your proprietary engineering documents.
          </p>

        </motion.div>
      </div>

      {/* RIGHT COLUMN - Floating Collage Canvas */}
      <div className="flex-1 w-full h-[550px] relative hidden md:block">
        
        {/* Main Center Card (Mobile-like UI) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[450px] bg-white dark:bg-[#111111] rounded-[2rem] border border-[var(--border-color)] shadow-2xl overflow-hidden z-20 flex flex-col items-center justify-start p-6"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 mt-4">
            <Cpu className="text-blue-500" size={24} />
          </div>
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">Analyze LM358</h3>
          <p className="text-[11px] text-[var(--text-secondary)] mb-8">Uploaded by Engineer</p>

          <div className="w-full space-y-4">
            <div className="w-full p-3 rounded-xl border border-[var(--border-color)] flex justify-between items-center bg-[var(--hover-bg)]">
              <span className="text-xs text-[var(--text-secondary)]">Vcc Max</span>
              <span className="text-xs font-mono font-medium text-[var(--text-primary)]">32V</span>
            </div>
            <div className="w-full p-3 rounded-xl border border-[var(--border-color)] flex justify-between items-center bg-[var(--hover-bg)]">
              <span className="text-xs text-[var(--text-secondary)]">Package</span>
              <span className="text-xs font-mono font-medium text-[var(--text-primary)]">SOIC-8</span>
            </div>
            <div className="w-full p-3 rounded-xl border border-[var(--border-color)] flex justify-between items-center bg-[var(--hover-bg)]">
              <span className="text-xs text-[var(--text-secondary)]">Bandwidth</span>
              <span className="text-xs font-mono font-medium text-[var(--text-primary)]">1 MHz</span>
            </div>
          </div>

          <div className="mt-auto w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full text-center text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
            Extract Data
          </div>
        </motion.div>

        {/* Floating Element 1: Top Right Code Block */}
        <motion.div
          initial={{ opacity: 0, x: 20, y: -20 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="absolute right-0 top-[10%] w-[320px] bg-[#0A0A0B] border border-white/10 rounded-xl shadow-xl overflow-hidden z-10"
        >
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[10px] text-white/40 font-mono">search.py</span>
          </div>
          <div className="p-4 text-[11px] font-mono leading-relaxed">
            <div className="text-pink-400">async def <span className="text-blue-400">find_pinout</span><span className="text-white/70">(doc_id):</span></div>
            <div className="pl-4 text-white/70">chunks = <span className="text-pink-400">await</span> db.search(<span className="text-green-400">"pin configuration"</span>)</div>
            <div className="pl-4 text-white/70"><span className="text-pink-400">return</span> extract_table(chunks)</div>
          </div>
        </motion.div>

        {/* Floating Element 2: Bottom Left Code Block */}
        <motion.div
          initial={{ opacity: 0, x: -20, y: 20 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="absolute left-[-20px] bottom-[15%] w-[280px] bg-[#0A0A0B] border border-white/10 rounded-xl shadow-xl overflow-hidden z-30"
        >
          <div className="p-4 text-[11px] font-mono leading-relaxed">
            <div className="text-white/40 mb-1">{'// API Response'}</div>
            <div className="text-white/70">{'{'}</div>
            <div className="pl-4"><span className="text-blue-300">"component"</span>: <span className="text-green-400">"LM358"</span>,</div>
            <div className="pl-4"><span className="text-blue-300">"status"</span>: <span className="text-green-400">"analyzed"</span>,</div>
            <div className="pl-4"><span className="text-blue-300">"confidence"</span>: <span className="text-orange-400">0.99</span></div>
            <div className="text-white/70">{'}'}</div>
          </div>
        </motion.div>

        {/* Floating Icon 1: Database (Top Left) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="absolute left-[10%] top-[20%] w-12 h-12 bg-white dark:bg-[#1A1A1A] border border-[var(--border-color)] rounded-xl shadow-lg flex items-center justify-center z-10"
        >
          <Database size={20} className="text-purple-500" />
        </motion.div>

        {/* Floating Icon 2: Circuit (Bottom Right) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="absolute right-[10%] bottom-[10%] w-14 h-14 bg-white dark:bg-[#1A1A1A] border border-[var(--border-color)] rounded-2xl shadow-lg flex items-center justify-center z-30"
        >
          <CircuitBoard size={24} className="text-blue-500" />
        </motion.div>

      </div>
    </section>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

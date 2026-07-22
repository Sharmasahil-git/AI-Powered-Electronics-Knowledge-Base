import { motion } from "framer-motion";
import { Search, Code2, Network, Sparkles, Terminal, FileText, LayoutGrid, Server, MessageSquare, Bot, Monitor } from "lucide-react";

export default function IntegrationsSection() {
  return (
    <section className="relative w-full py-12 px-8 md:px-16 lg:px-24 flex flex-col z-20">
      
      {/* 2-Column Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        
        {/* LEFT CARD: Smart Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[480px] bg-white/80 dark:bg-[#0A0A0B]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-[2rem] p-10 overflow-hidden flex flex-col group"
        >
          {/* Card Text Content */}
          <div className="z-10 max-w-[85%]">
            <h3 className="text-3xl font-medium tracking-tight text-[var(--text-primary)] mb-3">Smart Search</h3>
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-6">
              Search your entire electronic component library using natural language and precise electrical parameters without manual SQL.
            </p>
            <button className="px-5 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[13px] font-medium">
              Learn more
            </button>
          </div>

          {/* Visual Mockup (Bottom) */}
          <div className="absolute left-10 right-10 bottom-[-20px] h-[220px] bg-[#111113] border border-white/10 rounded-t-2xl shadow-2xl flex flex-col transition-transform duration-500 group-hover:-translate-y-4">
            
            {/* Mock Header */}
            <div className="w-full flex items-center px-4 py-3 border-b border-white/5">
              <Sparkles size={14} className="text-purple-400 mr-2" />
              <span className="text-[11px] font-mono text-white/40">Datasheet Playground</span>
            </div>

            {/* Mock Search Bar */}
            <div className="p-6 w-full">
              <div className="w-full bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <span className="text-[13px] text-white/80 font-mono tracking-tight">find dual op-amp with 1MHz bw</span>
                <div className="px-3 py-1.5 bg-white/10 rounded-lg flex items-center gap-1">
                  <Search size={12} className="text-white/60" />
                  <span className="text-[11px] text-white/60 font-medium">Search</span>
                </div>
              </div>

              {/* Mock Results */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="w-full h-8 bg-white/5 rounded-lg" />
                <div className="w-[80%] h-8 bg-white/5 rounded-lg" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT CARD: SDKs & API */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-full h-[480px] bg-white/80 dark:bg-[#0A0A0B]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-[2rem] p-10 overflow-hidden flex flex-col"
        >
          {/* Card Text Content */}
          <div className="z-10 max-w-[85%]">
            <h3 className="text-3xl font-medium tracking-tight text-[var(--text-primary)] mb-3">Context-Aware Chat</h3>
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mb-6">
              Have a conversation with your datasheets. Our AI understands complex electrical specifications and provides cited answers directly from your documents.
            </p>
            <button className="px-5 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-[13px] font-medium">
              Learn more
            </button>
          </div>

          {/* Visual Concentric Rings (Bottom) */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-full h-[250px] flex items-end justify-center overflow-hidden">
            
            {/* Ring 3 (Outer) */}
            <div className="absolute bottom-[-100px] w-[500px] h-[500px] rounded-full border border-white/5 flex items-start justify-center">
               <motion.div 
                 animate={{ rotate: 360 }} 
                 transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                 className="absolute w-full h-full"
               >
                 <div className="absolute top-[10%] left-[20%] w-12 h-12 bg-[#1A1A1C] border border-white/10 rounded-full flex items-center justify-center shadow-lg">
                    <MessageSquare size={20} className="text-blue-400" />
                 </div>
               </motion.div>
            </div>

            {/* Ring 2 (Middle) */}
            <div className="absolute bottom-[-80px] w-[350px] h-[350px] rounded-full border border-white/[0.08] flex items-start justify-center">
              <motion.div 
                 animate={{ rotate: -360 }} 
                 transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                 className="absolute w-full h-full"
               >
                 <div className="absolute top-[15%] right-[15%] w-12 h-12 bg-[#1A1A1C] border border-white/10 rounded-full flex items-center justify-center shadow-lg">
                    <Bot size={20} className="text-green-400" />
                 </div>
               </motion.div>
            </div>

            {/* Ring 1 (Inner) */}
            <div className="absolute bottom-[-60px] w-[200px] h-[200px] rounded-full border border-white/10 bg-white/[0.02]" />

          </div>
        </motion.div>

      </div>

      {/* FOOTER FEATURE ROW */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-start gap-4"
        >
          <Server className="text-[var(--text-secondary)] opacity-60 mt-1 shrink-0" size={18} />
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Ingest proprietary datasheets securely onto your own infrastructure with the local ingestion engine.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-start gap-4"
        >
          <LayoutGrid className="text-[var(--text-secondary)] opacity-60 mt-1 shrink-0" size={18} />
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Extract pinouts, schematics, and thermal charts automatically without handling them manually.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-start gap-4"
        >
          <Monitor className="text-[var(--text-secondary)] opacity-60 mt-1 shrink-0" size={18} />
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Interact with your component library through a clean, intuitive web dashboard designed specifically for hardware engineers.
          </p>
        </motion.div>

      </div>

    </section>
  );
}

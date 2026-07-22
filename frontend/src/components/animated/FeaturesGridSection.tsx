import { motion } from "framer-motion";
import { 
  Settings, Zap, Code2, 
  ShieldCheck, Lock, Database, 
  Layers, Globe, TrendingUp 
} from "lucide-react";

export default function FeaturesGridSection() {
  return (
    <section className="relative w-full py-24 px-8 md:px-16 lg:px-24 flex flex-col items-start z-20 mt-12 bg-white dark:bg-[#050505] border-t border-[var(--border-color)]">
      
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-24"
      >
        <h2 className="text-5xl md:text-6xl tracking-tight text-[var(--text-secondary)] opacity-80 mb-6 font-light">
          Why <span className="font-medium text-[var(--text-primary)]">DatasheetAI?</span>
        </h2>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-xl">
          DatasheetAI is secure by default. We build, manage, and implement search best practices into the platform so you don&apos;t have to.
        </p>
      </motion.div>

      {/* ROW 1: Built for Engineers */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-start gap-8 py-16 border-t border-[var(--border-color)]">
        
        {/* Badge Column */}
        <div className="w-full lg:w-1/4 shrink-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex px-4 py-1.5 rounded-full border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-[11px] text-[var(--text-secondary)] font-medium"
          >
            Built for Engineers
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <FeatureItem 
            delay={0.1}
            icon={<Settings size={18} />}
            title="Component Agnostic"
            description="Works seamlessly with any electronic component datasheet or technical manual."
          />
          <FeatureItem 
            delay={0.2}
            icon={<Zap size={18} />}
            title="Instant Retrieval"
            description="Optimized vector search provides exact parameters with absolute minimal latency."
          />
          <FeatureItem 
            delay={0.3}
            icon={<Code2 size={18} />}
            title="Seamless Integration"
            description="Built so engineers spend less time digging through PDFs and more time designing."
          />

        </div>
      </div>

      {/* ROW 2: Secure by Default */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-start gap-8 py-16 border-t border-[var(--border-color)]">
        
        <div className="w-full lg:w-1/4 shrink-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex px-4 py-1.5 rounded-full border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-[11px] text-[var(--text-secondary)] font-medium"
          >
            Secure by Default
          </motion.div>
        </div>

        <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <FeatureItem 
            delay={0.1}
            icon={<ShieldCheck size={18} />}
            title="Local Execution"
            description="Process proprietary, unreleased schematics entirely on your local infrastructure."
          />
          <FeatureItem 
            delay={0.2}
            icon={<Lock size={18} />}
            title="Data Privacy"
            description="Your proprietary documents and search queries are never used to train public models."
          />
          <FeatureItem 
            delay={0.3}
            icon={<Database size={18} />}
            title="Isolated DB"
            description="Built on hardened pgvector instances for maximum data isolation and security."
          />

        </div>
      </div>

      {/* ROW 3: Designed for Scale */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-start gap-8 py-16 border-t border-b border-[var(--border-color)]">
        
        <div className="w-full lg:w-1/4 shrink-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="inline-flex px-4 py-1.5 rounded-full border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-[11px] text-[var(--text-secondary)] font-medium"
          >
            Designed for Scale
          </motion.div>
        </div>

        <div className="w-full lg:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <FeatureItem 
            delay={0.1}
            icon={<Layers size={18} />}
            title="Massive Libraries"
            description="Process, chunk, and index thousands of complex datasheets in minutes."
          />
          <FeatureItem 
            delay={0.2}
            icon={<Globe size={18} />}
            title="Extensible API"
            description="Connect the ingestion engine to your existing internal component databases."
          />
          <FeatureItem 
            delay={0.3}
            icon={<TrendingUp size={18} />}
            title="Open Core"
            description="Built on reliable, transparent open-source technologies you can trust."
          />

        </div>
      </div>

    </section>
  );
}

// Subcomponent for individual features
function FeatureItem({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-start"
    >
      <div className="flex items-center gap-2 mb-3 text-[var(--text-primary)]">
        <div className="text-[var(--text-secondary)]">{icon}</div>
        <h4 className="text-[14px] font-medium tracking-wide">{title}</h4>
      </div>
      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

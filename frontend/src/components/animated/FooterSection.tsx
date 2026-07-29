import { motion } from "framer-motion";
import { ArrowUpRight, Code2, MessageCircle, Globe, ArrowUp } from "lucide-react";
import Link from "next/link";

export default function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative w-full z-20 flex flex-col mt-24">

      {/* 1. CTA GRID (Dark Theme) */}
      <div className="w-full flex flex-col md:flex-row border-t border-b border-[var(--border-color)] bg-white dark:bg-[#0A0A0B]">

        {/* Left Block (ABOUT US) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex-1 p-12 md:p-16 lg:p-24 border-b md:border-b-0 md:border-r border-[var(--border-color)] flex flex-col justify-between min-h-[400px] group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
        >
          <div className="w-full flex justify-between items-start">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-[var(--text-primary)] uppercase leading-none max-w-[200px]">
              ABOUT<br />US
            </h2>
            <Link href="/about" className="w-12 h-12 rounded-xl border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              <ArrowUpRight size={24} />
            </Link>
          </div>
          <p className="text-[15px] text-[var(--text-secondary)] font-medium max-w-sm mt-16 leading-relaxed">
            Learn more about our company&apos;s journey in redefining how hardware engineers interact with proprietary electronic component data.
          </p>
        </motion.div>

        {/* Right Block (READ THE DOCS) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex-1 p-12 md:p-16 lg:p-24 flex flex-col justify-between min-h-[400px] group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
        >
          <div className="w-full flex justify-between items-start">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-[var(--text-primary)] uppercase leading-none max-w-[250px]">
              READ<br />THE DOCS
            </h2>
            <Link href="/docs" className="w-12 h-12 rounded-xl border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              <ArrowUpRight size={24} />
            </Link>
          </div>
          <p className="text-[15px] text-[var(--text-secondary)] font-medium max-w-sm mt-16 leading-relaxed">
            Learn more about our system architecture, local vector embeddings, and the open-source ingestion engine.
          </p>
        </motion.div>

      </div>

      {/* 2. MAIN FOOTER */}
      <footer className="w-full bg-[#FAFAFA] dark:bg-[#050505] px-8 md:px-16 lg:px-24 pt-24 pb-12 flex flex-col">

        {/* Top Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-16 border-b border-[var(--border-color)] pb-20">

          {/* Logo & Contact (Spans 2 columns) */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-10">
              {/* Simple Logo Mockup */}
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">DatasheetAI</span>
            </div>
            <p className="text-[15px] font-medium text-[var(--text-secondary)] mb-4">
              Have questions or want to chat?
            </p>
            <p className="text-[15px] font-medium text-[var(--text-secondary)] flex items-center gap-2">
              Drop us a line <span className="opacity-40">→</span> <a href="mailto:hello@datasheetai.local" className="text-blue-600 dark:text-[#facc15] hover:underline">edtsilofficial@gmail.com</a>
            </p>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[13px] font-semibold text-[var(--text-primary)] mb-2">Platform</h4>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Smart Search</Link>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Vision Extraction</Link>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Local Ingestion</Link>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">API Reference</Link>
          </div>

          {/* Solutions Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[13px] font-semibold text-[var(--text-primary)] mb-2">Solutions</h4>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Enterprise Engineering</Link>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Hardware Startups</Link>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Component Manufacturers</Link>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Security & Privacy</Link>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[13px] font-semibold text-[var(--text-primary)] mb-2">Company</h4>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">About Us</Link>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Careers</Link>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Blog</Link>
            <Link href="#" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Trust Center</Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 pt-8">

          <div className="flex items-center gap-6">
            <button onClick={scrollToTop} className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <ArrowUp size={12} />
              </div>
              Back to top
            </button>
            <span className="text-[12px] text-[var(--text-secondary)] opacity-60 font-mono">
              DatasheetAI © 2026 | All rights reserved
            </span>
          </div>

          <div className="flex items-center gap-6 text-[12px] text-[var(--text-secondary)] opacity-60 font-mono text-right">
            <div className="hidden lg:block">
              DELHI, INDIA<br />
              110040
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <a href="#" className="text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:text-[var(--text-primary)] transition-colors"><Globe size={16} /></a>
              <a href="#" className="text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:text-[var(--text-primary)] transition-colors"><MessageCircle size={16} /></a>
              <a href="#" className="text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:text-[var(--text-primary)] transition-colors"><Code2 size={16} /></a>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Link href="#" className="text-[11px] text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:text-[var(--text-primary)] transition-colors">Terms of Service</Link>
              <Link href="#" className="text-[11px] text-[var(--text-secondary)] opacity-60 hover:opacity-100 hover:text-[var(--text-primary)] transition-colors">Privacy Statement</Link>
            </div>
          </div>

        </div>
      </footer>
    </section>
  );
}

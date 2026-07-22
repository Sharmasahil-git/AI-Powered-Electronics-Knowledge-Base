"use client";

import { useEffect, useState } from "react";
import { ChevronDown, UserCircle, Sun, Moon, Cpu } from "lucide-react";

export default function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Determine initial theme on client load
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-transparent z-50 fixed top-0 left-0 transition-colors duration-300">
      <div className="flex items-center gap-3">
        {/* Minimalist Hardware Logo */}
        <div className="relative flex items-center justify-center p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--hover-bg)] shadow-sm">
          <Cpu size={18} className="text-[var(--text-primary)]" strokeWidth={2} />
        </div>
        <span className="font-sans text-xl font-bold tracking-tight text-[var(--text-primary)] transition-colors duration-300">
          Datasheet<span className="text-[var(--text-secondary)]">AI</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm font-normal text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--text-primary)] transition-colors duration-300">
          Products <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--text-primary)] transition-colors duration-300">
          Use Cases <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
        </div>
        <div className="cursor-pointer hover:text-[var(--text-primary)] transition-colors duration-300">Pricing</div>
        <div className="cursor-pointer hover:text-[var(--text-primary)] transition-colors duration-300">Blog</div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--text-primary)] transition-colors duration-300">
          Resources <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle Button */}
        {mounted ? (
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} className="text-orange-400" />}
          </button>
        ) : (
          <div className="w-8 h-8" />
        )}

        <button className="flex items-center gap-2 border border-[var(--border-color)] bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-[var(--text-primary)] px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200">
          Login <UserCircle size={15} />
        </button>
      </div>
    </nav>
  );
}

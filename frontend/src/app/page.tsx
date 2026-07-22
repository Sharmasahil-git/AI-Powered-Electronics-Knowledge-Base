"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ParallaxHero from "@/components/animated/ParallaxHero";
import FeatureSection from "@/components/animated/FeatureSection";
import PipelineSection from "@/components/animated/PipelineSection";
import IntegrationsSection from "@/components/animated/IntegrationsSection";
import ProcessSection from "@/components/animated/ProcessSection";
import FeaturesGridSection from "@/components/animated/FeaturesGridSection";
import FooterSection from "@/components/animated/FooterSection";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 overflow-hidden font-sans">
      
      {/* 100vh Hero Container */}
      <div className="relative min-h-screen flex flex-col w-full">
        <Navbar />
        
        {/* Particle Background (Blue Dots) */}
        <ParallaxHero />
        
        {/* Main Hero Content */}
        <div className="relative z-10 flex flex-col items-start justify-center flex-grow w-full pt-8 pb-32 px-8 md:px-16 lg:px-24 text-left">
        
        {/* Top small label */}
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-start gap-2.5 mb-8 w-full"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-orange-400 opacity-20 blur-[1px]" />
            <div className="w-3.5 h-3.5 rounded-full border border-[var(--text-secondary)] flex items-center justify-center transition-colors duration-300">
              <div className="w-1 h-1 rounded-full bg-[var(--text-secondary)] transition-colors duration-300" />
            </div>
          </div>
          <span className="font-sans text-sm font-bold text-[var(--text-secondary)] tracking-wide uppercase transition-colors duration-300">DatasheetAI</span>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          className="w-full mb-12 flex flex-wrap justify-start"
        >
          <h1 className="text-6xl md:text-7xl lg:text-[80px] font-medium tracking-tight text-[var(--text-primary)] leading-[1.05] flex flex-wrap justify-start transition-colors duration-300">
            
            {/* Line 1 */}
            {"Experience liftoff with the".split(" ").map((word, wordIndex) => (
              <span key={`line1-${wordIndex}`} className="inline-flex mr-[0.25em]">
                {word.split("").map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.3, delay: 0.1 + ((wordIndex * 6 + charIndex) * 0.02) }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}

            {/* Forced Flex Line Break */}
            <div className="w-full h-0" />

            {/* Line 2 */}
            {"next-gen agent platform".split(" ").map((word, wordIndex) => (
              <span key={`line2-${wordIndex}`} className="inline-flex mr-[0.25em]">
                {word.split("").map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.3, delay: 0.4 + ((wordIndex * 6 + charIndex) * 0.02) }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}

          </h1>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-start gap-3 w-full"
        >
          <Link href="/dashboard" className="flex items-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-7 py-3.5 rounded-[2rem] font-medium text-[15px] hover:bg-black dark:hover:bg-white/90 transition-all duration-300 group">
            Lets get started <ArrowRight size={16} className="text-white/80 dark:text-[#111111]/80 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <button className="bg-[var(--btn-bg-secondary)] text-[var(--btn-text-secondary)] px-7 py-3.5 rounded-[2rem] font-medium text-[15px] hover:bg-[#e4e4e7] dark:hover:bg-white/15 transition-all duration-300">
            Explore use cases
          </button>
        </motion.div>

        </div>
      </div>

      {/* Feature Section Collage */}
      <FeatureSection />

      {/* Second Feature Section Collage */}
      <PipelineSection />

      {/* Third Feature Section (Two Cards) */}
      <IntegrationsSection />

      {/* Fourth Feature Section (Process) */}
      <ProcessSection />

      {/* Fifth Feature Section (Features Grid) */}
      <FeaturesGridSection />

      {/* Footer Section */}
      <FooterSection />

    </main>
  );
}

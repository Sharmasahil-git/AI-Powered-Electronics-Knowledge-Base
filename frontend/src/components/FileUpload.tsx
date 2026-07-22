"use client";

import { useState, MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { UploadCloud } from "lucide-react";

export default function FileUpload() {
  const [isHovering, setIsHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Function to track mouse movement inside the card
  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className="relative w-full max-w-xl mx-auto"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        className="group relative flex flex-col items-center justify-center p-16 rounded-3xl cursor-pointer overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:border-green-400/50"
      >
        {/* Interactive Mouse Tracking Spotlight */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(74, 222, 128, 0.15),
                transparent 80%
              )
            `,
          }}
        />

        <div className="relative z-10 p-5 rounded-full bg-white/10 mb-6 group-hover:bg-green-400/20 transition-colors duration-500 shadow-xl">
          <UploadCloud 
            size={48} 
            className="text-white/70 group-hover:text-green-400 transition-colors duration-500" 
          />
        </div>
        <h3 className="relative z-10 text-2xl font-semibold mb-3 tracking-tight group-hover:text-green-400 transition-colors duration-500">
          Upload Datasheet
        </h3>
        <p className="relative z-10 text-base text-white/50 text-center max-w-xs">
          Drag and drop your PDF here, or click to browse your computer.
        </p>
      </motion.div>
    </motion.div>
  );
}

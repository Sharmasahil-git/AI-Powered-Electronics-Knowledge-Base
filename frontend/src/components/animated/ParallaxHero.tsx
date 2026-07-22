"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring, animate } from "framer-motion";

interface ParticleConfig {
  id: number;
  absX: number; // Absolute X position on the screen
  absY: number; // Absolute Y position on the screen
  size: number;
  color: string;
  opacity: number;
}

// Ultra-optimized individual particle
// This uses ZERO `useAnimationFrame` loops and ZERO React state changes.
// It only calculates math reactively exactly when the mouse moves.
function Particle({ config, mouseX, mouseY }: { config: ParticleConfig, mouseX: any, mouseY: any }) {
  
  const xOffset = useTransform([mouseX, mouseY], ([mx, my]: number[]) => {
    if (mx === -1000) return 0;
    
    const dx = config.absX - mx;
    const dy = config.absY - my;
    const distance = Math.hypot(dx, dy);
    
    // The massive repulse bubble
    const INFLUENCE_RADIUS = 250; 
    if (distance < INFLUENCE_RADIUS) {
      // Exponential push for a soft magnetic feel
      const pushRatio = Math.pow(1 - (distance / INFLUENCE_RADIUS), 2);
      const angle = Math.atan2(dy, dx);
      return Math.cos(angle) * (pushRatio * 90); 
    }
    return 0;
  });

  const yOffset = useTransform([mouseX, mouseY], ([mx, my]: number[]) => {
    if (mx === -1000) return 0;
    
    const dx = config.absX - mx;
    const dy = config.absY - my;
    const distance = Math.hypot(dx, dy);
    
    const INFLUENCE_RADIUS = 250;
    if (distance < INFLUENCE_RADIUS) {
      const pushRatio = Math.pow(1 - (distance / INFLUENCE_RADIUS), 2);
      const angle = Math.atan2(dy, dx);
      return Math.sin(angle) * (pushRatio * 90);
    }
    return 0;
  });

  // Framer Motion's physics engine handles the smooth gliding
  const smoothX = useSpring(xOffset, { damping: 20, stiffness: 120, mass: 0.5 });
  const smoothY = useSpring(yOffset, { damping: 20, stiffness: 120, mass: 0.5 });

  // Separate motion values for organic floating drift
  const driftX = useMotionValue(0);
  const driftY = useMotionValue(0);

  useEffect(() => {
    let active = true;

    // Async loop that continuously generates brand new target destinations.
    // This creates true, non-repetitive organic movement.
    const runDrift = async () => {
      while (active) {
        // Random offsets up to 25px away (calmed down for organic feel)
        const targetX = (Math.random() - 0.5) * 50;
        const targetY = (Math.random() - 0.5) * 50;
        // Random duration to stagger speeds (faster active pace: 2s to 4s)
        const duration = Math.random() * 2 + 2; 

        if (!active) break;

        await Promise.all([
          animate(driftX, targetX, { duration, ease: "easeInOut" }),
          animate(driftY, targetY, { duration, ease: "easeInOut" })
        ]);
      }
    };

    runDrift();

    return () => {
      active = false;
    };
  }, [driftX, driftY]);

  // Sum both the mouse spring physics and the organic float drift
  const combinedX = useTransform([smoothX, driftX], ([x, dx]: number[]) => x + dx);
  const combinedY = useTransform([smoothY, driftY], ([y, dy]: number[]) => y + dy);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: config.absX,
        top: config.absY,
        width: config.size,
        height: config.size,
        backgroundColor: config.color,
        x: combinedX,
        y: combinedY,
        opacity: config.opacity,
        boxShadow: `0 0 ${config.size * 2.5}px ${config.color}`, // Beautiful neon glow
      }}
    />
  );
}

export default function ParallaxHero() {
  const [particles, setParticles] = useState<ParticleConfig[]>([]);
  
  // Motion values exist outside React renders for maximum performance
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  useEffect(() => {
    const generated: ParticleConfig[] = [];
    let idCounter = 0;
    
    // Shift slightly left to wrap behind the main text
    const centerX = window.innerWidth * 0.35; 
    const centerY = window.innerHeight * 0.5;
    
    const colors = ["#f97316", "#3b82f6", "#a855f7"]; // Premium Antigravity colors

    // Generating a breathtaking uniform 3D sphere using Fermat's Spiral
    const numParticles = 160; // Perfect density, completely lag-free
    const spacing = 45; // Increased spacing to account for fewer particles 

    for (let i = 1; i <= numParticles; i++) {
      const goldenAngle = 137.508 * (Math.PI / 180);
      const r = spacing * Math.sqrt(i);
      const theta = i * goldenAngle;

      // Stretch it horizontally to look like a massive 3D globe rather than a flat circle
      const x = r * Math.cos(theta) * 1.6; 
      const y = r * Math.sin(theta);

      // Microscopic particle sizes based on user request
      const size = Math.random() * 2.5 + 1.5; 
      
      const opacity = Math.random() * 0.5 + 0.3;
      const color = colors[Math.floor(Math.random() * colors.length)];

      generated.push({
        id: idCounter++,
        absX: centerX + x,
        absY: centerY + y,
        size,
        color,
        opacity,
      });
    }

    setParticles(generated);

    // Track mouse efficiently
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
      mouseX.set(-1000);
      mouseY.set(-1000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(config => (
        <Particle 
          key={config.id} 
          config={config} 
          mouseX={mouseX} 
          mouseY={mouseY} 
        />
      ))}
    </div>
  );
}

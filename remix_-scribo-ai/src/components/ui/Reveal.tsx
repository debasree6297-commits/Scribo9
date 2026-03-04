import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  xOffset?: number; // Optional x offset for entrance
  yOffset?: number; // Optional y offset for entrance (default 40)
}

export default function Reveal({ children, className = "", delay = 0, xOffset = 0, yOffset = 40 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Map scroll progress to opacity and transform
  // 0 (entering from bottom/side) -> offset, opacity: 0
  // 0.15 (entered) -> 0, opacity: 1
  // 0.85 (leaving) -> 0, opacity: 1
  // 1 (left top/side) -> -offset, opacity: 0
  
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  
  // If xOffset is provided, animate X. Otherwise animate Y (default).
  const x = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [xOffset, 0, 0, -xOffset]);
  const y = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [yOffset, 0, 0, -yOffset]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, x, y }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
}

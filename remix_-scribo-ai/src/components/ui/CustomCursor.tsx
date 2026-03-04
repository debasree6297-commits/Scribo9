import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button') || target.classList.contains('cursor-hover')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <div className="hidden lg:block pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference">
      {/* Main Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-[#FFBFA6] rounded-full"
        animate={{
          x: mousePosition.x - 5,
          y: mousePosition.y - 5,
          scale: isHovering ? 2.5 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      />
      
      {/* Ghost Ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-[#FFBFA6] rounded-full opacity-30"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isHovering ? 0.5 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
          mass: 0.8,
          delay: 0.05 // Slight lag
        }}
      />
    </div>
  );
}

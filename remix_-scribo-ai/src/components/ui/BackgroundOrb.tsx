import React, { useEffect, useRef } from 'react';

export default function BackgroundOrb() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const updatePosition = () => {
      if (!orbRef.current) return;

      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;

      // Figure-8 pattern
      // x: sin(t * 4pi) * width
      // y: sin(t * 2pi) * height
      
      const x = Math.sin(scrollProgress * Math.PI * 4) * (window.innerWidth * 0.3);
      const y = Math.sin(scrollProgress * Math.PI * 2) * (window.innerHeight * 0.3);

      orbRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('scroll', updatePosition);
    updatePosition(); // Initial pos

    return () => {
      window.removeEventListener('scroll', updatePosition);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={orbRef}
      className="fixed top-1/2 left-1/2 w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full pointer-events-none z-0 blur-[60px]"
      style={{
        background: 'radial-gradient(circle, rgba(255,154,108,0.15), rgba(255,191,166,0.05))',
        transform: 'translate(-50%, -50%)',
        willChange: 'transform'
      }}
    />
  );
}

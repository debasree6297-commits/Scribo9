import React, { useEffect, useRef } from 'react';

export default function RotatingRings() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      
      const ring1 = ref.current.getElementById('ring1') as SVGElement | null;
      const ring2 = ref.current.getElementById('ring2') as SVGElement | null;
      const ring3 = ref.current.getElementById('ring3') as SVGElement | null;
      const group = ref.current.getElementById('ringGroup') as SVGElement | null;

      if (ring1) ring1.style.transform = `rotate(${scrollProgress * 360}deg)`;
      if (ring2) ring2.style.transform = `rotate(${-(scrollProgress * 540)}deg)`;
      if (ring3) ring3.style.transform = `rotate(${scrollProgress * 720}deg)`;
      
      if (group) {
        const yPos = scrollProgress * 200 - 100;
        group.style.transform = `translateY(${yPos}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
      <svg 
        ref={ref}
        width="800" 
        height="800" 
        viewBox="0 0 800 800" 
        className="opacity-[0.08] md:opacity-[0.08] opacity-[0.06] scale-75 md:scale-100 transition-transform duration-500"
      >
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFBFA6" />
            <stop offset="100%" stopColor="#FF9A6C" />
          </linearGradient>
        </defs>
        <g id="ringGroup" style={{ transformOrigin: 'center' }}>
          {/* Ring 1 */}
          <circle 
            id="ring1"
            cx="400" 
            cy="400" 
            r="200" 
            fill="none" 
            stroke="url(#ringGradient)" 
            strokeWidth="2" 
            strokeDasharray="20 10"
            style={{ transformOrigin: 'center', willChange: 'transform' }}
          />
          {/* Ring 2 */}
          <circle 
            id="ring2"
            cx="400" 
            cy="400" 
            r="140" 
            fill="none" 
            stroke="url(#ringGradient)" 
            strokeWidth="2" 
            strokeDasharray="15 8"
            style={{ transformOrigin: 'center', willChange: 'transform' }}
          />
          {/* Ring 3 */}
          <circle 
            id="ring3"
            cx="400" 
            cy="400" 
            r="80" 
            fill="none" 
            stroke="url(#ringGradient)" 
            strokeWidth="2" 
            strokeDasharray="10 5"
            style={{ transformOrigin: 'center', willChange: 'transform' }}
          />
        </g>
      </svg>
    </div>
  );
}

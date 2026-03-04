import React, { useEffect, useState } from 'react';

export default function PageTransition() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleTrigger = () => {
      setActive(true);
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('openAuth'));
        setTimeout(() => {
          setActive(false);
        }, 300);
      }, 500);
    };

    document.addEventListener('triggerPageTransition', handleTrigger);
    return () => document.removeEventListener('triggerPageTransition', handleTrigger);
  }, []);

  return (
    <div 
      id="page-transition" 
      className={`fixed inset-0 bg-white z-[99999] flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-250 ease-linear ${active ? 'opacity-100 pointer-events-auto' : ''}`}
    >
      <div className="pt-logo animate-ptPulse">
        <svg width="48" height="48" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="ptLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFBFA6" />
              <stop offset="100%" stopColor="#FF9A6C" />
            </linearGradient>
          </defs>
          <path
            d="M25,60 A15,15 0 0,1 40,45 A20,20 0 0,1 80,45 A15,15 0 0,1 85,70 L25,70 Z"
            fill="url(#ptLogoGrad)"
          />
          <circle cx="55" cy="55" r="5" fill="white" />
        </svg>
      </div>
      <style>{`
        .animate-ptPulse {
          animation: ptPulse 0.6s ease-in-out infinite alternate;
        }
        @keyframes ptPulse {
          from { transform: scale(0.9); opacity: 0.7; }
          to   { transform: scale(1.1); opacity: 1.0; }
        }
      `}</style>
    </div>
  );
}

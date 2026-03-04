import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence
    const timers = [
      setTimeout(() => setStep(1), 100),  // Logo appears
      setTimeout(() => setStep(2), 600),  // Text appears
      setTimeout(() => setStep(3), 1200), // Loading bar
      setTimeout(() => setStep(4), 1800), // Tagline
      setTimeout(() => setStep(5), 2800), // Exit start
      setTimeout(() => onComplete(), 3300), // Complete
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,191,166,0.4) 0%, rgba(255,154,108,0.15) 40%, transparent 70%)',
        clipPath: step === 5 ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)',
        transition: 'clip-path 0.5s ease-in'
      }}
    >
      {/* Step 1: Logo SVG */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={step >= 1 ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-[80px] h-[80px] mb-6"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ animation: step >= 1 ? 'logoPulse 2s ease-in-out infinite' : 'none' }}>
          <defs>
            <linearGradient id="splashLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFBFA6" />
              <stop offset="100%" stopColor="#FF9A6C" />
            </linearGradient>
          </defs>
          {/* Cloud Shape */}
          <path
            d="M25,60 A15,15 0 0,1 40,45 A20,20 0 0,1 80,45 A15,15 0 0,1 85,70 L25,70 Z"
            fill="url(#splashLogoGrad)"
          />
          {/* Swirl Inside */}
          <path
            d="M45,65 C40,65 35,60 35,55 C35,45 45,40 55,50 C60,55 55,65 45,65"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ opacity: 0.8 }}
          />
        </svg>
        <style>{`
          @keyframes logoPulse {
            0%,100% { filter: drop-shadow(0 0 8px rgba(255,154,108,0.4)); }
            50%      { filter: drop-shadow(0 0 20px rgba(255,154,108,0.8)); }
          }
        `}</style>
      </motion.div>

      {/* Step 2: Text Reveal */}
      <div className="h-10 overflow-hidden flex items-center justify-center mb-6">
        <motion.h1
          className="text-[28px] font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-[#FF9A6C] to-[#FFC87A]"
          initial={{ y: 10, opacity: 0, letterSpacing: "8px" }}
          animate={step >= 2 ? { y: 0, opacity: 1, letterSpacing: "2px" } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Scribo AI
        </motion.h1>
      </div>

      {/* Step 3: Loading Bar */}
      <div className="w-[160px] h-[2px] bg-[rgba(255,154,108,0.2)] rounded-full overflow-hidden mb-4">
        {step >= 3 && (
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF9A6C] to-[#FFC87A]"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* Step 4: Tagline */}
      <div className="h-6">
        <motion.p
          className="text-[13px] font-sans font-normal text-[rgba(255,154,108,0.7)] uppercase tracking-[3px]"
          initial={{ opacity: 0 }}
          animate={step >= 4 ? { opacity: 0.7 } : {}}
          transition={{ duration: 0.6 }}
        >
          Write. Create. Scale.
        </motion.p>
      </div>
    </motion.div>
  );
}

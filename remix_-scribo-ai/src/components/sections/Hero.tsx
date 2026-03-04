import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Reveal from '../ui/Reveal';
import Magnetic from '../ui/Magnetic';
import { User } from '../../App';
import { auth } from '../../services/firebase';

const playTone = (
  freq: number, dur: number,
  type: OscillatorType = 'sine',
  vol = 0.15, delay = 0
) => {
  try {
    const ac = new (
      (window as any).AudioContext ||
      (window as any).webkitAudioContext
    )();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.value = freq;
    osc.type = type;
    const t = ac.currentTime + delay;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur);
    setTimeout(() => ac.close(), (dur + delay + 0.1) * 1000);
  } catch (e) {}
};

const soundClick = () => playTone(800, 0.1, 'sine', 0.1);
const soundStart = () => {
  playTone(400, 0.3, 'sine', 0.15);
  playTone(600, 0.3, 'sine', 0.1, 0.05);
};

interface HeroProps {
  user?: User | null;
  onNavigate?: (page: string) => void;
  setShowAuth?: (show: boolean) => void;
}

export default function Hero({ user, onNavigate, setShowAuth }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollIndicatorRef.current) {
        if (window.scrollY > 300) {
          scrollIndicatorRef.current.style.opacity = '0';
          scrollIndicatorRef.current.style.pointerEvents = 'none';
        } else {
          scrollIndicatorRef.current.style.opacity = '1';
          scrollIndicatorRef.current.style.pointerEvents = 'auto';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Word Cycle Logic
    const words = document.querySelectorAll('.cycle-word');
    if (words.length > 0) {
      let currentIndex = 0;
      
      // Initialize first word
      words[0].classList.add('active');

      const cycleWord = () => {
        const current = words[currentIndex];
        
        // Exit current
        current.classList.remove('active');
        current.classList.add('exit');
        
        setTimeout(() => {
          current.classList.remove('exit');
        }, 400);
        
        // Move to next
        currentIndex = (currentIndex + 1) % words.length;
        const next = words[currentIndex] as HTMLElement;
        
        // Enter next
        next.style.transform = 'translate(-50%, calc(-50% + 40px))';
        next.style.opacity = '0';
        
        requestAnimationFrame(() => {
          // Force reflow
          void next.offsetWidth;
          next.style.transform = '';
          next.style.opacity = '';
          next.classList.add('active');
        });
      };
      
      // Start cycle after splash screen ends (3.5s delay)
      const startTimeout = setTimeout(() => {
        const interval = setInterval(cycleWord, 2200);
        return () => clearInterval(interval);
      }, 3500);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(startTimeout);
      };
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = () => {
    soundStart();
    if (setShowAuth) {
      setShowAuth(true);
    } else {
      document.dispatchEvent(new CustomEvent('openAuth'));
    }
  };

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Background gradient orbs */}
      <div style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        {/* Top right large orb */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '55vw',
          height: '55vw',
          maxWidth: 500,
          maxHeight: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,154,108,0.18) 0%, rgba(255,200,122,0.1) 40%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'orbFloat1 8s ease-in-out infinite'
        }}/>

        {/* Bottom left orb */}
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-15%',
          width: '60vw',
          height: '60vw',
          maxWidth: 520,
          maxHeight: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,154,108,0.14) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'orbFloat2 10s ease-in-out infinite'
        }}/>

        {/* Center subtle orb */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '20%',
          width: '40vw',
          height: '40vw',
          maxWidth: 380,
          maxHeight: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,200,122,0.1) 0%, transparent 65%)',
          filter: 'blur(35px)',
          animation: 'orbFloat3 12s ease-in-out infinite'
        }}/>
      </div>

      {/* Main Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            style={{ y, opacity }}
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob"
          />
          <motion.div 
            style={{ y, opacity }}
            className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[var(--saffron)] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-2000"
          />
          <motion.div 
            style={{ y, opacity }}
            className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-orange-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-4000"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center pt-20">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-[var(--glass-border)] backdrop-blur-sm shadow-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-mid)]">Now in Public Beta</span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-[1.1] mb-0 text-[var(--text-dark)] px-2">
            Built for Creators Who
          </h1>
          
          <div className="word-cycle-wrapper">
            <div className="word-cycle-container">
              <span className="cycle-word">Dream</span>
              <span className="cycle-word">Create</span>
              <span className="cycle-word">Scale</span>
              <span className="cycle-word">Lead</span>
              <span className="cycle-word">Build</span>
              <span className="cycle-word">Inspire</span>
              <span className="cycle-word">Grow</span>
            </div>
          </div>
        </Reveal>

        <style>{`
          .word-cycle-wrapper {
            position: relative;
            width: 100%;
            height: 90px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 8px 0 24px 0;
          }

          .word-cycle-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cycle-word {
            display: block;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 72px;
            font-weight: 900;
            background: linear-gradient(135deg, #FF9A6C, #FFC87A);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, calc(-50% + 40px));
            opacity: 0;
            white-space: nowrap;
            transition: opacity 0.5s ease, 
                        transform 0.5s cubic-bezier(0.23,1,0.32,1);
          }

          .cycle-word.active {
            opacity: 1;
            transform: translate(-50%, -50%);
          }

          .cycle-word.exit {
            opacity: 0;
            transform: translate(-50%, calc(-50% - 40px));
            transition: opacity 0.4s ease,
                        transform 0.4s ease;
          }

          @media (max-width: 640px) {
            .cycle-word {
              font-size: 36px;
            }
            .word-cycle-wrapper {
              height: 50px;
              margin-bottom: 16px;
            }
          }
        `}</style>

        <Reveal delay={0.2}>
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--text-mid)] max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed relative z-10 px-4">
            The all-in-one AI workspace to generate scripts, design prompts, and build your creative empire.
          </p>
        </Reveal>

        <Reveal delay={0.3}>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 sm:mb-20 px-4">
            <Magnetic>
              <button 
                onClick={handleStart}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-105 transition-all duration-300"
              >
                Start Chatting →
              </button>
            </Magnetic>
            <Magnetic>
              <button 
                onClick={() => {
                  soundClick();
                  // Demo logic here
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-gray-200 text-[var(--text-dark)] font-bold text-lg hover:border-[var(--accent)] hover:bg-orange-50 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                Watch Demo
              </button>
            </Magnetic>
          </div>
          
          {/* Scroll Indicator */}
          <div 
            ref={scrollIndicatorRef}
            className="flex flex-col items-center gap-2 mt-10 transition-opacity duration-500"
          >
            <div className="relative w-[28px] h-[40px]">
              <svg width="28" height="40" viewBox="0 0 28 40">
                <rect x="1" y="1" width="26" height="38" 
                  rx="13" fill="none" 
                  stroke="rgba(255,154,108,0.6)" 
                  strokeWidth="2"/>
                <rect className="animate-scrollWheel" x="12" y="8" 
                  width="4" height="8" rx="2" 
                  fill="rgba(255,154,108,0.8)"/>
              </svg>
            </div>
            <p className="text-[12px] text-[var(--accent)]/70 tracking-[2px] uppercase font-medium">Scroll to explore</p>
          </div>
          <style>{`
            .animate-scrollWheel {
              animation: scrollWheel 1.5s ease-in-out infinite;
            }
            @keyframes scrollWheel {
              0%   { transform: translateY(0); opacity: 1; }
              50%  { transform: translateY(6px); opacity: 0.4; }
              100% { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="pt-16 border-t border-gray-100/50 w-full overflow-hidden">
            <div className="marquee-wrapper">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by creators at</p>
              <div className="marquee-track-container">
                <div className="marquee-track">
                  {/* Set 1 */}
                  <span>YouTube</span>
                  <span className="dot">✦</span>
                  <span>Instagram</span>
                  <span className="dot">✦</span>
                  <span>TikTok</span>
                  <span className="dot">✦</span>
                  <span>LinkedIn</span>
                  <span className="dot">✦</span>
                  
                  {/* Set 2 (Duplicate for loop) */}
                  <span>YouTube</span>
                  <span className="dot">✦</span>
                  <span>Instagram</span>
                  <span className="dot">✦</span>
                  <span>TikTok</span>
                  <span className="dot">✦</span>
                  <span>LinkedIn</span>
                  <span className="dot">✦</span>

                  {/* Set 3 (Extra buffer) */}
                  <span>YouTube</span>
                  <span className="dot">✦</span>
                  <span>Instagram</span>
                  <span className="dot">✦</span>
                  <span>TikTok</span>
                  <span className="dot">✦</span>
                  <span>LinkedIn</span>
                  <span className="dot">✦</span>
                </div>
              </div>
            </div>
          </div>
          <style>{`
            .marquee-wrapper {
              width: 100%;
              overflow: hidden;
            }
            .marquee-track-container {
              width: 100%;
              overflow: hidden;
              white-space: nowrap;
              position: relative;
              mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
              -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
            }
            .marquee-track {
              display: inline-flex;
              align-items: center;
              gap: 40px;
              white-space: nowrap;
              animation: marqueeScroll 20s linear infinite;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
            @keyframes marqueeScroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-33.33%); } /* Adjusted for 3 sets */
            }
            .marquee-track span {
              font-size: 18px;
              font-weight: 600;
              color: var(--text-mid);
              opacity: 0.7;
              flex-shrink: 0;
              display: inline-block;
              font-family: var(--font-display);
            }
            .marquee-track .dot {
              color: var(--accent);
              opacity: 0.4;
              font-size: 10px;
            }
          `}</style>
        </Reveal>
      </div>
    </div>

      {/* Removed old fixed scroll indicator */}
    </section>
  );
}

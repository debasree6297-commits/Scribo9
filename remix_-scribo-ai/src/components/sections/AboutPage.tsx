import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { User } from '../../App';

interface AboutPageProps {
  user: User;
  onBack: () => void;
}

const CountUp = ({ end, duration = 1500 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={countRef}>{count}</span>;
};

export default function AboutPage({ user, onBack }: AboutPageProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      (window as any).observeScrollElements?.('about-page');
    }
  }, []);

  const heroText = "Built for Creators, By Creators 🔥";

  return (
    <motion.div 
      id="about-page"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-0 z-[10000] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFF8F4, #FFF0E6, #FFF8F4)'
      }}
    >
      <style>{`
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 transparent); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 15px rgba(255,154,108,0.4)); }
        }
        @keyframes gradShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pillBounce {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes teamGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .pill-bounce-anim {
          animation: pillBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .team-card-anim {
          background-size: 200% 200%;
          animation: teamGradient 6s ease infinite;
        }
      `}</style>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]" 
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 py-3 bg-white/85 backdrop-blur-[20px] border-b border-[rgba(255,154,108,0.15)] shrink-0 h-[60px] relative z-20 anim-fadeDown">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#FF9A6C] font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h2 className="font-display font-bold text-base text-[#1A1A2E]">About Scribo AI</h2>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] flex items-center justify-center text-white font-bold text-xs">
          {user.avatar}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10" ref={scrollRef}>
        <div className="max-w-[800px] mx-auto px-6 py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-16 pt-12">
            <div
              className="w-16 h-16 mx-auto mb-6 anim-popIn"
              style={{ animation: 'popIn 0.6s cubic-bezier(0.23,1,0.32,1) forwards, logoPulse 3s ease-in-out 0.6s infinite' }}
            >
              <svg width="64" height="64" viewBox="0 0 100 100">
                <path d="M25,60 A15,15 0 0,1 40,45 A20,20 0 0,1 80,45 A15,15 0 0,1 85,70 L25,70 Z" fill="url(#aboutLogoGrad)" />
                <circle cx="55" cy="55" r="5" fill="white" />
                <defs>
                  <linearGradient id="aboutLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF9A6C" />
                    <stop offset="100%" stopColor="#FFC87A" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <h1 
              className="font-display text-4xl font-extrabold mb-4 bg-gradient-to-r from-[#FF9A6C] to-[#FFC87A] bg-clip-text text-transparent flex flex-wrap justify-center gap-x-2 anim-fadeUp delay-1"
              style={{ backgroundSize: '200% auto', animation: 'fadeUp 0.6s cubic-bezier(0.23,1,0.32,1) 0.1s forwards, gradShimmer 4s linear infinite' }}
            >
              {heroText}
            </h1>
            
            <p className="text-[#4A4A6A] text-lg leading-[1.8] max-w-[560px] mx-auto font-inter anim-fadeUp delay-2">
              Scribo AI is India's first AI-powered creative studio built exclusively for content creators, entrepreneurs, and digital storytellers.
            </p>
          </div>

          {/* Mission Card */}
          <div className="bg-white/80 backdrop-blur-[20px] border-[1.5px] border-[rgba(255,154,108,0.2)] rounded-[24px] p-8 mb-16 shadow-sm scroll-reveal">
            <div className="text-4xl mb-6">🎯</div>
            <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-4 font-display">Our Mission</h3>
            <div className="text-[#4A4A6A] text-[15px] leading-[1.9] font-inter space-y-4">
              <p>
                We believe every creator deserves access to powerful AI tools — without complexity, without barriers, and without a steep learning curve.
              </p>
              <p>
                Scribo AI was born from one simple idea: <span className="text-[#FF9A6C] font-bold">what if your smartest creative friend was available 24/7, spoke your language, and helped you create content that actually connects with people?</span>
              </p>
              <p>
                That's exactly what we built.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-8 font-display scroll-reveal">What Scribo AI Does</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: "💬",
                  title: "Chat Studio",
                  text: "Your AI creative partner. Write scripts, craft prompts, brainstorm ideas — in any language. Bengali, Hindi, Hinglish, English. Scribo speaks your language."
                },
                {
                  icon: "🖼️",
                  title: "Image Studio",
                  text: "Describe your vision and bring it to life. Generate stunning thumbnails, posters, and artwork. Prompt analysis powered by Gemini AI. Full generation coming soon."
                },
                {
                  icon: "📦",
                  title: "Assets",
                  text: "Your personal creative library. Store your best prompts, scripts, and ideas. Access them anytime, anywhere. Coming in Phase 2."
                },
                {
                  icon: "🕐",
                  title: "Chat History",
                  text: "Never lose your best conversations. Scribo saves your chats for 48 hours so you can continue right where you left off."
                }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="bg-white/75 border-[1.5px] border-[rgba(255,154,108,0.15)] rounded-[20px] p-6 transition-all duration-300 group scroll-reveal hover:-translate-y-2 hover:shadow-xl hover:shadow-[rgba(255,154,108,0.15)] hover:border-[rgba(255,154,108,0.4)]"
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h4 className="text-[15px] font-bold text-[#1A1A2E] mb-2 font-display">{feature.title}</h4>
                  <p className="text-[13px] text-[#6A6A8A] leading-[1.7] font-inter">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Language Support */}
          <div className="bg-gradient-to-br from-[rgba(255,154,108,0.08)] to-[rgba(255,200,122,0.08)] border-[1.5px] border-[rgba(255,154,108,0.2)] rounded-[24px] p-8 mb-16 scroll-reveal">
            <h3 className="text-lg font-extrabold text-[#1A1A2E] mb-4 font-display">🌍 Every Language Welcome</h3>
            <p className="text-[#4A4A6A] text-sm mb-6 font-inter">
              Scribo AI is built for India's incredible diversity of languages and cultures.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "🇧🇩 Bengali", "🇮🇳 Hindi", "🌐 English", "Hinglish", "Banglish", "Gujarati", "Marathi", "Tamil", "Telugu"
              ].map((lang, i) => (
                <span 
                  key={lang} 
                  className="bg-[rgba(255,154,108,0.12)] border border-[rgba(255,154,108,0.25)] rounded-full px-4 py-1.5 text-[13px] font-semibold text-[#FF9A6C] font-inter opacity-0 pill-bounce-anim"
                  style={{ animationDelay: `${0.5 + i * 0.05}s` }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-16 scroll-reveal">
            {[
              { num: "🚀 Phase 1", label: "Now Live", count: null },
              { num: "🌍 9+", label: "Languages Supported", count: 9 },
              { num: "⚡ Gemini 2.0", label: "Powered By", count: null }
            ].map((stat, i) => (
              <div key={i} className="bg-white/80 border-[1.5px] border-[rgba(255,154,108,0.15)] rounded-[20px] p-6 text-center">
                <div className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-[#FF9A6C] to-[#FFC87A] bg-clip-text text-transparent mb-1 font-display">
                  {stat.count !== null ? (
                    <>
                      {stat.num.split(stat.count.toString())[0]}
                      <CountUp end={stat.count} />
                      {stat.num.split(stat.count.toString())[1]}
                    </>
                  ) : stat.num}
                </div>
                <div className="text-[10px] md:text-[12px] text-[#888] font-medium uppercase tracking-wider font-inter">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Team Note */}
          <div className="bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] rounded-[24px] p-8 text-white text-center mb-12 shadow-lg shadow-orange-100 scroll-reveal team-card-anim">
            <div className="text-[14px] opacity-85 mb-3 font-inter">✨ A Note From the Team</div>
            <div className="text-base md:text-lg leading-[1.85] opacity-95 font-inter">
              <p className="mb-4">
                Scribo AI is just getting started. We're a small team of creators who got tired of generic AI tools that didn't understand our world.
              </p>
              <p className="mb-4">
                So we built our own.
              </p>
              <p>
                Every feature you see was made with real creators in mind — and we're just getting started. 🔥
              </p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

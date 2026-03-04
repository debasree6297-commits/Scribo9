import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Copy, Check } from 'lucide-react';
import { User } from '../../App';

interface ContactPageProps {
  user: User;
  onBack: () => void;
}

export default function ContactPage({ user, onBack }: ContactPageProps) {
  const [copied, setCopied] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const email = "bishalenter7@gmail.com";

  useEffect(() => {
    (window as any).observeScrollElements?.('contact-page');
  }, []);

  const handleCopy = () => {
    setIsClicked(true);
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setIsClicked(false), 300);
    });
  };

  return (
    <motion.div 
      id="contact-page"
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
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-14px) rotate(5deg); }
        }
        @keyframes auroraFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes colorPulse {
          0%, 100% { color: #1A1A2E; }
          50% { color: #FF9A6C; }
        }
        .float-bounce-anim {
          animation: floatBounce 2.8s ease-in-out infinite;
        }
        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
          opacity: 0.4;
        }
        .btn-shine {
          position: relative;
          overflow: hidden;
        }
        .btn-shine::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-25deg);
          transition: none;
        }
        .btn-shine:hover::after {
          left: 200%;
          transition: left 0.6s ease-in-out;
        }
      `}</style>

      {/* Aurora Blobs */}
      <div className="aurora-blob w-[250px] h-[250px] bg-[#FF9A6C] top-[-50px] right-[-50px]" style={{ animation: 'auroraFloat 8s ease-in-out infinite' }} />
      <div className="aurora-blob w-[200px] h-[200px] bg-[#FFC87A] bottom-[-50px] left-[-50px]" style={{ filter: 'blur(60px)', animation: 'auroraFloat 10s ease-in-out infinite reverse' }} />

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
        <h2 className="font-display font-bold text-base text-[#1A1A2E]">Contact Us</h2>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] flex items-center justify-center text-white font-bold text-xs">
          {user.avatar}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10 px-6">
        <div className="max-w-[640px] mx-auto py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-12 pt-12">
            <div className="text-6xl mb-6 inline-block float-bounce-anim anim-popIn">
              💌
            </div>
            
            <h1 className="font-display text-4xl font-extrabold mb-4 bg-gradient-to-r from-[#FF9A6C] to-[#FFC87A] bg-clip-text text-transparent anim-fadeUp delay-1">
              Let's Talk! 👋
            </h1>
            
            <p className="text-[#4A4A6A] text-lg leading-[1.8] max-w-[500px] mx-auto font-inter anim-fadeUp delay-2">
              Have a question, idea, or just want to say hi? We'd love to hear from you.
            </p>
          </div>

          {/* Main Contact Card */}
          <div 
            className="bg-white/85 backdrop-blur-[24px] border-[1.5px] border-[rgba(255,154,108,0.2)] rounded-[28px] p-8 md:p-10 text-center shadow-sm mb-12 relative z-10 anim-slideUp delay-2"
          >
            <div className="inline-block bg-[rgba(255,154,108,0.1)] border border-[rgba(255,154,108,0.25)] rounded-full px-5 py-1.5 text-[12px] font-bold text-[#FF9A6C] tracking-[1px] uppercase mb-6 font-inter">
              📧 Email Us Directly
            </div>
            
            <div className="font-display text-xl md:text-2xl font-extrabold text-[#1A1A2E] mb-3 break-all flex justify-center flex-wrap">
              {email.split("").map((char, i) => (
                <span
                  key={i}
                  className="opacity-0"
                  style={{ animation: `fadeUp 0.3s forwards ${0.4 + i * 0.02}s, colorPulse 2s ease-in-out 1s 1` }}
                >
                  {char}
                </span>
              ))}
            </div>
            
            <p className="text-[#6A6A8A] text-sm leading-[1.8] mb-8 font-inter">
              Reach out to the Scribo AI team for support, feedback, partnerships, or just to share your ideas with us. We read every email and reply within 24-48 hours. 🚀
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setIsClicked(true);
                  setTimeout(() => setIsClicked(false), 300);
                  window.location.href = `mailto:${email}`;
                }}
                className={`w-full bg-gradient-to-r from-[#FF9A6C] to-[#FFC87A] text-white py-4 rounded-full font-bold text-[15px] shadow-lg shadow-orange-100 hover:-translate-y-0.5 hover:shadow-orange-200 transition-all active:translate-y-0 flex items-center justify-center gap-2 font-inter btn-shine ${isClicked ? 'scale-95' : ''}`}
              >
                <Mail size={18} />
                Send Us an Email
              </button>
              
              <button 
                onClick={handleCopy}
                className={`w-full bg-transparent border-[1.5px] border-[rgba(255,154,108,0.3)] py-4 rounded-full font-bold text-[15px] hover:bg-[rgba(255,154,108,0.05)] transition-all flex items-center justify-center gap-2 font-inter ${copied ? 'text-green-500 border-green-500 bg-green-50' : 'text-[#FF9A6C]'} ${isClicked && !copied ? 'scale-95' : ''}`}
                style={{ transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)' }}
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Email Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy Email Address
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Time Info Pills */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            {[
              { emoji: "⚡", title: "Fast Reply", sub: "Within 24-48 hrs" },
              { emoji: "🌍", title: "Any Language", sub: "Bengali, Hindi, English" },
              { emoji: "💙", title: "We Care", sub: "Every email is read" }
            ].map((pill, i) => (
              <div 
                key={i} 
                className="flex-1 bg-white/75 border border-[rgba(255,154,108,0.15)] rounded-[16px] p-4 text-center font-inter scroll-reveal transition-all hover:-translate-y-1 hover:border-[rgba(255,154,108,0.4)] hover:shadow-[0_4px_12px_rgba(255,154,108,0.1)]"
              >
                <div className="text-2xl mb-1.5">{pill.emoji}</div>
                <div className="text-[12px] font-bold text-[#1A1A2E] mb-0.5">{pill.title}</div>
                <div className="text-[11px] text-[#888]">{pill.sub}</div>
              </div>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="text-center text-[13px] text-[rgba(100,100,120,0.6)] leading-[1.7] font-inter scroll-reveal">
            Scribo AI is built with ❤️ for creators.<br />
            Your feedback shapes what we build next.
          </div>

        </div>
      </div>
    </motion.div>
  );
}

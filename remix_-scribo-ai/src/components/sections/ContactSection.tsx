import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Copy, Check } from 'lucide-react';

interface ContactSectionProps {
  onBack: () => void;
}

export default function ContactSection({ onBack }: ContactSectionProps) {
  const [copied, setCopied] = useState(false);
  const email = "bishalenter7@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div 
      id="contact-page-landing"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-0 z-[10000] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFF8F4, #FFF0E6, #FFF8F4)'
      }}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]" 
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 py-3 bg-white/85 backdrop-blur-[20px] border-b border-[rgba(255,154,108,0.15)] shrink-0 h-[60px]">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#FF9A6C] font-semibold text-sm hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h2 className="font-display font-bold text-base text-[#1A1A2E]">Contact Us</h2>
        <button 
          onClick={() => document.dispatchEvent(new CustomEvent('openAuth'))}
          className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF9A6C] to-[#FFC87A] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
        >
          Sign In
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10 px-6">
        <div className="max-w-[640px] mx-auto py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-12 pt-12">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl mb-6 inline-block"
            >
              💌
            </motion.div>
            
            <h1 className="font-display text-4xl font-extrabold mb-4 bg-gradient-to-r from-[#FF9A6C] to-[#FFC87A] bg-clip-text text-transparent">
              Let's Talk! 👋
            </h1>
            
            <p className="text-[#4A4A6A] text-lg leading-[1.8] max-w-[500px] mx-auto font-inter">
              Have a question, idea, or just want to say hi? We'd love to hear from you.
            </p>
          </div>

          {/* Main Contact Card */}
          <div className="bg-white/85 backdrop-blur-[24px] border-[1.5px] border-[rgba(255,154,108,0.2)] rounded-[28px] p-8 md:p-10 text-center shadow-sm mb-12">
            <div className="inline-block bg-[rgba(255,154,108,0.1)] border border-[rgba(255,154,108,0.25)] rounded-full px-5 py-1.5 text-[12px] font-bold text-[#FF9A6C] tracking-[1px] uppercase mb-6 font-inter">
              📧 Email Us Directly
            </div>
            
            <div className="font-display text-xl md:text-2xl font-extrabold text-[#1A1A2E] mb-3 break-all">
              {email}
            </div>
            
            <p className="text-[#6A6A8A] text-sm leading-[1.8] mb-8 font-inter">
              Reach out to the Scribo AI team for support, feedback, partnerships, or just to share your ideas with us. We read every email and reply within 24-48 hours. 🚀
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.href = `mailto:${email}`}
                className="w-full bg-gradient-to-r from-[#FF9A6C] to-[#FFC87A] text-white py-4 rounded-full font-bold text-[15px] shadow-lg shadow-orange-100 hover:-translate-y-0.5 hover:shadow-orange-200 transition-all active:translate-y-0 flex items-center justify-center gap-2 font-inter"
              >
                <Mail size={18} />
                Send Us an Email
              </button>
              
              <button 
                onClick={handleCopy}
                className="w-full bg-transparent border-[1.5px] border-[rgba(255,154,108,0.3)] text-[#FF9A6C] py-4 rounded-full font-bold text-[15px] hover:bg-[rgba(255,154,108,0.05)] transition-all flex items-center justify-center gap-2 font-inter"
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
              <div key={i} className="flex-1 bg-white/75 border border-[rgba(255,154,108,0.15)] rounded-[16px] p-4 text-center font-inter">
                <div className="text-2xl mb-1.5">{pill.emoji}</div>
                <div className="text-[12px] font-bold text-[#1A1A2E] mb-0.5">{pill.title}</div>
                <div className="text-[11px] text-[#888]">{pill.sub}</div>
              </div>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="text-center text-[13px] text-[rgba(100,100,120,0.6)] leading-[1.7] font-inter">
            Scribo AI is built with ❤️ for creators.<br />
            Your feedback shapes what we build next.
          </div>

        </div>
      </div>
    </motion.div>
  );
}

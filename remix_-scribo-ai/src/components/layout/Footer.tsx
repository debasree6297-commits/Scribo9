import React from 'react';
import { motion } from 'motion/react';
import Reveal from '../ui/Reveal';

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-dark)] text-white pt-20 pb-10 relative overflow-hidden">
      {/* Decorative Top Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          {/* Brand Column */}
          <div className="max-w-sm">
            <Reveal>
              <div className="flex items-center gap-2 mb-6">
                <svg width="32" height="32" viewBox="0 0 100 100">
                  <path
                    d="M25,60 A15,15 0 0,1 40,45 A20,20 0 0,1 80,45 A15,15 0 0,1 85,70 L25,70 Z"
                    fill="#FFBFA6"
                  />
                  <circle cx="55" cy="55" r="5" fill="#1A0F0A" />
                </svg>
                <span className="font-display font-bold text-2xl">Scribo AI</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Empowering creators with AI tools to write, design, and scale their digital presence.
              </p>
              
              <div className="space-y-1">
                <p className="font-semibold text-white">Proudly Founded in India 🇮🇳</p>
                <p className="text-xs text-gray-500">Built by an Indian founder — designed for creators worldwide.</p>
              </div>
            </Reveal>
          </div>

          {/* Links Column */}
          <div>
            <Reveal delay={0.1}>
              <h4 className="font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-4 text-gray-400">
                <li><button onClick={() => document.dispatchEvent(new CustomEvent('openAuth'))} className="hover:text-[var(--primary)] transition-colors">Sign In</button></li>
                <li><button className="hover:text-[var(--primary)] transition-colors">About Us</button></li>
                <li><button className="hover:text-[var(--primary)] transition-colors">Contact</button></li>
              </ul>
            </Reveal>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Scribo AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a 
              href="https://www.termsfeed.com/live/ba5dc91f-bb8e-4eda-ae93-6cd87eacb1db"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-[#FF9A6C] hover:underline"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              Privacy Policy
            </a>
            <a 
              href="https://www.termsfeed.com/live/afe5e882-eab8-4825-b299-584b83d1c96e"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-[#FF9A6C] hover:underline"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

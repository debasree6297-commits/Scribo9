import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Reveal from '../ui/Reveal';
import Magnetic from '../ui/Magnetic';
import Modal from '../ui/Modal';

export default function TeamLetter() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 text-center relative z-10">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 text-[var(--text-dark)]">
            Built for the <span className="text-gradient">Crazy Ones</span>.
          </h2>
        </Reveal>
        
        <Reveal delay={0.1}>
          <p className="text-xl text-[var(--text-mid)] max-w-2xl mx-auto mb-12 leading-relaxed">
            We believe the future belongs to those who create. Scribo AI is our love letter to every founder, writer, and artist daring to build something new.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="flex flex-col items-center gap-8">
            <Magnetic>
              <button 
                onClick={() => document.dispatchEvent(new CustomEvent('openAuth'))}
                className="px-10 py-5 rounded-full bg-[var(--text-dark)] text-white font-bold text-lg hover:bg-black transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden group"
              >
                <span className="relative z-10">Start Building Now</span>
                {/* Pulse Glow Animation */}
                <div className="absolute inset-0 rounded-full ring-4 ring-white/20 animate-pulse-slow" />
              </button>
            </Magnetic>
            
            <button 
              onClick={() => setIsOpen(true)}
              className="text-sm font-bold text-[var(--text-mid)] hover:text-[var(--accent)] transition-colors relative group"
            >
              Read the letter from our founders
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full" />
            </button>
          </div>
        </Reveal>
      </div>

      {/* Letter Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--bg-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧡</span>
          </div>
          <h3 className="text-3xl font-display font-bold mb-2">To The Creators</h3>
          <p className="text-sm text-[var(--text-mid)] uppercase tracking-widest">February 2026</p>
        </div>
        
        <div className="prose prose-lg mx-auto text-[var(--text-mid)] leading-relaxed space-y-6 font-serif">
          <p>
            <span className="text-4xl float-left mr-2 mt-[-10px] font-display font-bold text-[var(--text-dark)]">W</span>
            e started Scribo AI with a simple belief: <strong>Creativity should not be limited by tools.</strong>
          </p>
          <p>
            Too often, we see brilliant minds get stuck in the "how" — how to write the script, how to design the prompt, how to structure the launch. We wanted to build a second brain that handles the "how" so you can focus on the "what".
          </p>
          <p>
            This isn't just another AI wrapper. It's a workspace designed to respect your voice, amplify your ideas, and help you scale your vision.
          </p>
          <p>
            We're just getting started, and we're honored to have you on this journey with us.
          </p>
          <p className="font-handwriting text-2xl text-[var(--accent)] pt-4 rotate-[-2deg]">
            — The Scribo Team
          </p>
        </div>
      </Modal>
    </section>
  );
}

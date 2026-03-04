import React from 'react';
import { motion } from 'motion/react';
import Reveal from '../ui/Reveal';
import CountUp from '../ui/CountUp';

export default function Stats() {
  return (
    <section className="py-20 bg-gradient-to-br from-[var(--bg-alt)] to-[#FFE8D9] relative overflow-hidden">
      <motion.div 
        initial={{ x: "-100%" }}
        whileInView={{ x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 pointer-events-none"
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <Reveal>
            <h2 className="text-3xl font-display font-bold mb-2">Scribo AI by the Numbers</h2>
            <p className="text-[var(--text-mid)]">Join the fastest growing community of creators.</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { label: "Creators", value: 5000 },
            { label: "Scripts Generated", value: 15000 },
            { label: "Prompts Built", value: 25000 }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotateX: -45 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: false }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: "backOut" }}
              className="p-6"
            >
              <div className="text-4xl md:text-5xl font-display font-black text-[var(--text-dark)] mb-2">
                <CountUp end={stat.value} suffix="+" />
              </div>
              <div className="text-[var(--text-mid)] font-medium uppercase tracking-wider text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

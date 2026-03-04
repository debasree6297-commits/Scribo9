import React from 'react';
import { motion } from 'motion/react';
import Reveal from '../ui/Reveal';

const workflowSteps = [
  { 
    id: 1, 
    label: "Strategy", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 20h20M5 20V8h4v12M11 20V4h4v16M17 20v-8h4v8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    x: 0, y: -180 
  },
  { 
    id: 2, 
    label: "Planning", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    x: 170, y: -60 
  },
  { 
    id: 3, 
    label: "Execution", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    x: 100, y: 150 
  },
  { 
    id: 4, 
    label: "Optimization", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    x: -100, y: 150 
  },
  { 
    id: 5, 
    label: "Growth", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    x: -170, y: -60 
  },
];

export default function OrbitalDiagram() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,191,166,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <Reveal>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Creator Strategy</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-[var(--text-mid)] text-lg mb-16">The complete workflow for modern creators</p>
        </Reveal>

        <div className="relative w-full max-w-[600px] h-[600px] mx-auto hidden md:block">
          {/* Center Hub */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full shadow-[0_0_60px_rgba(255,154,108,0.3)] flex items-center justify-center z-20 border border-[var(--primary)]/20"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "backOut" }}
          >
            <div className="text-center">
              <span className="block font-display font-bold text-2xl text-gradient">Scribo</span>
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-mid)]">Workflow</span>
            </div>
            {/* Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[var(--primary)]/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Connecting Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFBFA6" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#FF9A6C" stopOpacity="1" />
                <stop offset="100%" stopColor="#FFBFA6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {workflowSteps.map((step, i) => {
              const nextStep = workflowSteps[(i + 1) % workflowSteps.length];
              const x1 = 300 + step.x;
              const y1 = 300 + step.y;
              const x2 = 300 + nextStep.x;
              const y2 = 300 + nextStep.y;
              
              return (
                <g key={`line-group-${i}`}>
                  {/* Base path */}
                  <path
                    d={`M${x1} ${y1} Q 300 300 ${x2} ${y2}`}
                    fill="none"
                    stroke="#FFBFA6"
                    strokeWidth="1"
                    strokeOpacity="0.2"
                  />
                  {/* Flowing energy path */}
                  <motion.path
                    d={`M${x1} ${y1} Q 300 300 ${x2} ${y2}`}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="10 10"
                    initial={{ strokeDashoffset: 0, opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ 
                      strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" },
                      opacity: { duration: 0.5, delay: i * 0.2 }
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Nodes */}
          {workflowSteps.map((step, i) => (
            <motion.div
              key={step.id}
              className="absolute top-1/2 left-1/2 w-24 h-24 -ml-12 -mt-12 z-30"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              whileInView={{ 
                x: step.x, 
                y: step.y, 
                opacity: 1, 
                scale: 1 
              }}
              transition={{ 
                duration: 0.8, 
                delay: i * 0.15, 
                ease: "backOut" 
              }}
            >
              <motion.div
                className="w-full h-full bg-white rounded-full shadow-lg border border-[var(--primary)]/20 flex flex-col items-center justify-center gap-2 relative group cursor-default"
                animate={{ y: [0, -8, 0] }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 0.5 
                }}
                whileHover={{ scale: 1.1, borderColor: "var(--accent)" }}
              >
                <div className="text-[var(--accent)] group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dark)]">
                  {step.label}
                </span>
                
                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-full bg-[var(--primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Vertical Flow */}
        <div className="md:hidden flex flex-col items-center gap-6 mt-8">
          {workflowSteps.map((step, i) => (
            <React.Fragment key={step.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="w-full max-w-xs bg-white p-6 rounded-2xl shadow-sm border border-[var(--glass-border)] flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--bg-alt)] flex items-center justify-center text-[var(--accent)] shrink-0">
                  {step.icon}
                </div>
                <span className="font-bold text-[var(--text-dark)] text-lg">{step.label}</span>
              </motion.div>
              {i < workflowSteps.length - 1 && (
                <motion.div 
                  initial={{ height: 0 }}
                  whileInView={{ height: 40 }}
                  className="w-0.5 bg-gradient-to-b from-[var(--primary)] to-[var(--accent)]"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

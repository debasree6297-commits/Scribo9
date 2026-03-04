import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import Reveal from '../ui/Reveal';

const features = [
  {
    title: "Prompt Builder",
    desc: "Engineer perfect AI prompts with intelligent templates and guided workflows",
    tag: "Most Popular",
    gradient: "from-[#FFBFA6] to-[#FF9A6C]",
    xOffset: -50,
    yOffset: -30,
    rotate: -3,
    icon: (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white">
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="50" cy="50" r="6" fill="currentColor" />
        <path d="M50 20 L50 10 M50 80 L50 90 M20 50 L10 50 M80 50 L90 50" stroke="currentColor" strokeWidth="3" />
        <circle cx="25" cy="25" r="4" fill="currentColor" />
        <circle cx="75" cy="25" r="4" fill="currentColor" />
        <circle cx="75" cy="75" r="4" fill="currentColor" />
        <circle cx="25" cy="75" r="4" fill="currentColor" />
      </svg>
    )
  },
  {
    title: "Script Generator",
    desc: "Transform raw ideas into complete, structured scripts in seconds",
    tag: "⚡ AI Powered",
    gradient: "from-[#FFC87A] to-[#FF9A6C]",
    xOffset: 50,
    yOffset: -30,
    rotate: 3,
    icon: (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white">
        <rect x="25" y="20" width="50" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
        <line x1="35" y1="35" x2="65" y2="35" stroke="currentColor" strokeWidth="3" />
        <line x1="35" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="3" />
        <line x1="35" y1="55" x2="55" y2="55" stroke="currentColor" strokeWidth="3" />
        <path d="M70 70 L90 90" stroke="currentColor" strokeWidth="3" />
      </svg>
    )
  },
  {
    title: "Image Studio",
    desc: "Generate stunning visuals that perfectly match your creative vision",
    tag: "Phase 2 →",
    locked: true,
    gradient: "from-[#A8D5BA] to-[#5DB88C]",
    xOffset: -50,
    yOffset: 30,
    rotate: 3,
    icon: (
      <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-md">
        <rect x="20" y="25" width="60" height="50" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="35" cy="40" r="5" fill="currentColor" />
        <path d="M20 65 L40 45 L55 60 L65 50 L80 75" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M85 20 L90 25 L95 20 M90 15 L90 30" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  },
  {
    title: "Creator Strategy",
    desc: "Build data-driven content strategies that grow your audience consistently",
    tag: "Phase 2 →",
    locked: true,
    gradient: "from-[#4F7FE8] to-[#7BA7F5]",
    xOffset: 50,
    yOffset: 30,
    rotate: -3,
    icon: (
      <div style={{
        width: '100%',
        height: 180,
        background: '#f3e8ff',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Glass icon container */}
        <div style={{
          width: 72, height: 72,
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Chart/Strategy SVG icon */}
          <svg 
            width="34" height="34" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M3 3v18h18" 
              stroke="#8B5CF6" 
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path 
              d="M7 14l4-4 3 3 5-6" 
              stroke="#8B5CF6" 
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle 
              cx="19" cy="7" r="2.5"
              fill="rgba(139,92,246,0.5)"
            />
          </svg>
        </div>
      </div>
    )
  }
];

export default function Features() {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8; // Max -8deg
    const rotateY = ((x - centerX) / centerX) * 8;  // Max 8deg

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    // Move gradient orb
    const orb = card.querySelector('.gradient-orb') as HTMLElement;
    if (orb) {
      orb.style.left = `${x}px`;
      orb.style.top = `${y}px`;
      orb.style.opacity = '1';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    const orb = e.currentTarget.querySelector('.gradient-orb') as HTMLElement;
    if (orb) {
      orb.style.opacity = '0';
    }
  };

  return (
    <section className="py-24 bg-[var(--bg-alt)] relative overflow-hidden">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#FFBFA6_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
              hidden: {}
            }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 flex flex-wrap justify-center gap-x-3">
              {"Everything You Need to Create".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {word}
                </motion.span>
              ))}
            </h2>
          </motion.div>
          
          <Reveal delay={0.1}>
            <p className="text-[var(--text-mid)] text-lg">
              One platform. Infinite creative possibilities.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: feature.xOffset, 
                y: feature.yOffset, 
                opacity: 0, 
                rotate: feature.rotate 
              }}
              whileInView={{ 
                x: 0, 
                y: 0, 
                opacity: 1, 
                rotate: 0 
              }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ 
                duration: 0.65, 
                delay: i * 0.12,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={`group rounded-[28px] overflow-hidden shadow-xl transition-all duration-100 ease-out hover:shadow-2xl ${feature.locked ? 'opacity-90' : ''} ${feature.title === "Creator Strategy" ? "" : "bg-white"}`}
              style={{ 
                transformStyle: 'preserve-3d',
                ...(feature.title === "Creator Strategy" ? {
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                } : {})
              }}
            >
              {/* Gradient Orb */}
              <div className="gradient-orb absolute w-64 h-64 bg-[var(--accent)]/20 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 opacity-0 -translate-x-1/2 -translate-y-1/2 z-0" />

              {/* Top Colored Section */}
              <div 
                className={`h-[180px] bg-gradient-to-br ${feature.gradient} flex items-center justify-center relative overflow-hidden z-10`}
                style={feature.title === "Creator Strategy" ? {
                  padding: 0,
                  height: 'auto',
                  background: 'none'
                } : {}}
              >
                {feature.title === "Creator Strategy" ? (
                  feature.icon
                ) : (
                  <motion.div 
                    className="w-16 h-16 group-hover:animate-float transition-transform duration-500"
                    whileInView={{ rotate: [0, 360] }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    {feature.icon}
                  </motion.div>
                )}
                {/* Shine effect */}
                {feature.title !== "Creator Strategy" && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                )}
              </div>

              {/* Content Section */}
              <div 
                className={`p-8 relative z-10 ${feature.title === "Creator Strategy" ? "" : "bg-white"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <motion.h3 
                    className="text-2xl font-display font-bold text-[var(--text-dark)]"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                  >
                    {feature.title}
                  </motion.h3>
                  {feature.locked ? (
                    <div className="bg-gray-100 p-1.5 rounded-full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  )}
                </div>
                
                <p className="text-[var(--text-mid)] leading-relaxed mb-6 text-sm h-10">
                  {feature.desc}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button className={`text-sm font-bold flex items-center gap-1 transition-colors ${feature.locked ? 'text-gray-400 cursor-not-allowed' : 'text-[var(--text-dark)] group-hover:text-[var(--accent)]'}`}>
                    {feature.locked ? 'Coming Soon' : 'Explore'} 
                    {!feature.locked && <span>→</span>}
                  </button>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {feature.tag}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function LivePreview() {
  const strategyRef = useRef<HTMLDivElement>(null);
  const [strategyVisible, setStrategyVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStrategyVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (strategyRef.current) {
      observer.observe(strategyRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 bg-[var(--bg-alt)] overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {}
            }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 flex flex-wrap justify-center gap-x-3">
              {"See Scribo AI in Action".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {word}
                </motion.span>
              ))}
            </h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-[var(--text-mid)] text-lg"
          >
            Real-time generation. Instant results.
          </motion.p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch overflow-x-auto md:overflow-visible pb-8 snap-x snap-mandatory px-4">
          
          {/* Panel 1: Script Output (Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -80, rotate: -2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: false, margin: "-50px" }}
            className="w-full md:w-[350px] flex-shrink-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden snap-center"
          >
            <div className="bg-gray-50 border-b border-gray-100 p-3 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="p-6 font-mono text-sm space-y-4">
              <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">Script Generator Output</div>
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
                variants={{
                  visible: { transition: { staggerChildren: 0.5, delayChildren: 0.5 } }
                }}
              >
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-[var(--text-dark)] font-bold">Title: The Future of AI</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-[var(--text-mid)]">[Intro Music Fades In]</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-[var(--text-dark)]">Host: "Imagine a world where..."</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-[var(--text-mid)]">
                  [Cut to B-Roll of City] <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>|</motion.span>
                </motion.p>
              </motion.div>
            </div>
          </motion.div>

          {/* Panel 2: Prompt Builder (Center/Bottom) */}
          <motion.div 
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: false, margin: "-50px" }}
            className="w-full md:w-[400px] flex-shrink-0 bg-white rounded-2xl shadow-2xl border border-[var(--primary)]/20 overflow-hidden relative z-10 snap-center"
          >
            <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <span className="font-bold text-[var(--text-dark)]">Prompt Builder Lab</span>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {['Cinematic', '4K', 'Cyberpunk', 'Neon'].map((tag, i) => (
                  <motion.span 
                    key={tag}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.8 + (i * 0.1), type: "spring", bounce: 0.5 }}
                    viewport={{ once: false }}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "94%" }}
                  viewport={{ once: false }}
                  transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" 
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Optimizing...</span>
                <span>94%</span>
              </div>
            </div>
          </motion.div>

          {/* Panel 3: Strategy (Right) */}
          <motion.div 
            initial={{ opacity: 0, x: 80, rotate: 2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: false, margin: "-50px" }}
            className="w-full md:w-[350px] flex-shrink-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden snap-center"
          >
            <div className="bg-gray-50 border-b border-gray-100 p-3 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-gray-300" />
            </div>
            <div className="p-6">
              <div 
                ref={strategyRef}
                style={{
                  opacity: strategyVisible ? 1 : 0,
                  transform: strategyVisible 
                    ? 'translateY(0)' 
                    : 'translateY(30px)',
                  transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.23,1,0.32,1)'
                }}
              >
                {/* Header row */}
                <div style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'space-between',
                  marginBottom:12
                }}>
                  <div style={{display:'flex',gap:6}}>
                    <div style={{
                      width:8,height:8,borderRadius:'50%',
                      background:'#6366F1'
                    }}/>
                    <div style={{
                      width:8,height:8,borderRadius:'50%',
                      background:'#8B5CF6'
                    }}/>
                  </div>
                  <span style={{
                    fontSize:10,fontWeight:700,
                    color:'#6366F1',letterSpacing:1.5,
                    textTransform:'uppercase'
                  }}>Creator Strategy</span>
                  <span style={{
                    fontSize:9,fontWeight:700,color:'white',
                    background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
                    padding:'2px 8px',borderRadius:20
                  }}>LIVE</span>
                </div>

                {/* 4 Strategy Steps with progress bars */}
                {[
                  {icon:'🎯',title:'Define Niche',
                   pct:87,color:'#FF9A6C'},
                  {icon:'✍️',title:'Script & Hook',
                   pct:72,color:'#6366F1'},
                  {icon:'🤖',title:'AI Optimize',
                   pct:94,color:'#8B5CF6'},
                  {icon:'🚀',title:'Grow & Scale',
                   pct:58,color:'#10B981'}
                ].map((item,i) => (
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{
                      display:'flex',
                      justifyContent:'space-between',
                      alignItems:'center',
                      marginBottom:5
                    }}>
                      <div style={{
                        display:'flex',
                        alignItems:'center',gap:6
                      }}>
                        <span style={{fontSize:12}}>
                          {item.icon}
                        </span>
                        <span style={{
                          fontSize:11,fontWeight:600,
                          color:'#1A1A2E'
                        }}>{item.title}</span>
                      </div>
                      <span style={{
                        fontSize:11,fontWeight:800,
                        color:item.color
                      }}>{item.pct}%</span>
                    </div>

                    {/* Progress bar track */}
                    <div style={{
                      height:5,
                      background:'rgba(0,0,0,0.06)',
                      borderRadius:50,overflow:'hidden'
                    }}>
                      <div style={{
                        height:'100%',
                        width: strategyVisible ? `${item.pct}%` : '0%',
                        background:`linear-gradient(
                          90deg,${item.color}66,${item.color}
                        )`,
                        borderRadius:50,
                        transition: `width 1.2s ease ${i*0.25}s`
                      }}/>
                    </div>
                  </div>
                ))}

                {/* Bottom growth card */}
                <div style={{
                  marginTop:8,
                  padding:'10px 12px',
                  background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))',
                  border:'1px solid rgba(99,102,241,0.15)',
                  borderRadius:12,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'space-between'
                }}>
                  <div>
                    <div style={{
                      fontSize:9,color:'#999',marginBottom:2
                    }}>Projected Growth</div>
                    <div style={{
                      fontSize:20,fontWeight:800,
                      color:'#6366F1'
                    }}>+340%</div>
                  </div>
                  <div style={{
                    width:38,height:38,borderRadius:'50%',
                    background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
                    display:'flex',alignItems:'center',
                    justifyContent:'center',fontSize:18
                  }}>📈</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

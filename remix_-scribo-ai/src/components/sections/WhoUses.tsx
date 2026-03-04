import React from 'react';
import { motion } from 'motion/react';
import Reveal from '../ui/Reveal';

const users = [
  {
    title: "Content Creator",
    roles: "YouTubers, Instagrammers",
    desc: "Generate scripts and thumbnails in minutes, not hours.",
    stat: "50K+ scripts generated",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=220&fit=crop&q=80",
    xOffset: -60,
    yOffset: 0,
    delay: 0
  },
  {
    title: "Entrepreneur",
    roles: "Founders, Indie Hackers",
    desc: "Build your personal brand while building your business.",
    stat: "200+ hours saved/mo",
    image: "https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=400&h=220&fit=crop&q=80",
    xOffset: 0,
    yOffset: 60,
    delay: 0.1
  },
  {
    title: "Startup Founder",
    roles: "SaaS, Tech, Agencies",
    desc: "Scale your content marketing without a marketing team.",
    stat: "3x faster growth",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=220&fit=crop&q=80",
    xOffset: 0,
    yOffset: 60,
    delay: 0.2
  },
  {
    title: "Digital Marketer",
    roles: "SEO, Social Media",
    desc: "Create high-converting copy for ads and landing pages.",
    stat: "15% higher conversion",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=220&fit=crop&q=80",
    xOffset: 60,
    yOffset: 0,
    delay: 0.3
  }
];

export default function WhoUses() {
  return (
    <section className="py-24 bg-white relative">
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
              {"Built for Every Creator".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, rotateX: -90 },
                    visible: { opacity: 1, rotateX: 0 }
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ perspective: 600 }}
                >
                  {word}
                </motion.span>
              ))}
            </h2>
          </motion.div>
          
          <Reveal delay={0.1}>
            <p className="text-[var(--text-mid)] text-lg">
              Whether you're just starting or scaling an empire.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {users.map((user, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: user.xOffset, 
                y: user.yOffset, 
                opacity: 0 
              }}
              whileInView={{ 
                x: 0, 
                y: 0, 
                opacity: 1 
              }}
              viewport={{ once: false, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: user.delay,
                ease: "easeOut"
              }}
              className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-xl hover:-translate-y-3 transition-all duration-300 relative overflow-hidden"
            >
              <div className="h-48 mb-6 rounded-xl overflow-hidden relative card-image-wrapper">
                <motion.img 
                  src={user.image} 
                  alt={user.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 z-10">
                  <span className="text-white font-bold text-sm">View Profile →</span>
                </div>
                {/* Gradient Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-[rgba(255,248,244,0.6)] pointer-events-none" />
              </div>
              
              <h3 className="text-xl font-bold text-[var(--text-dark)] mb-1">{user.title}</h3>
              <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-wide mb-3">{user.roles}</p>
              <p className="text-sm text-[var(--text-mid)] mb-4 leading-relaxed">
                {user.desc}
              </p>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: user.delay + 0.3, duration: 0.4 }}
                className="pt-4 border-t border-gray-100 group-hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="text-xs font-bold text-[var(--text-dark)]">{user.stat}</span>
                </div>
              </motion.div>
              
              {/* Bottom Glow Border */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

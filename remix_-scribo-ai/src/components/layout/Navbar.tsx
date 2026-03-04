import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Lock, Twitter, Instagram, Linkedin, ArrowRight, User as UserIcon, LogOut, Mail, Shield } from 'lucide-react';
import Modal from '../ui/Modal';
import { User } from '../../App';

interface NavbarProps {
  onNavigate: (page: string) => void;
  user?: User | null;
  onLogout?: () => void;
}

export default function Navbar({ onNavigate, user, onLogout }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openComingSoon = (feature: string) => {
    setComingSoonFeature(feature);
    setComingSoonOpen(true);
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    onLogout?.();
    // Toast handled in parent or here if needed, but App.tsx handles state
    // We can add a simple alert or just let the UI update
  };

  const menuItems = [
    { id: '01', name: "Chat Studio", locked: !user },
    { id: '02', name: "Image Studio", locked: !user },
    { id: '03', name: "Chat History", locked: !user },
    { id: '04', name: "Creator Hub", locked: !user },
    { id: '05', name: "About", locked: false, action: () => onNavigate('about') },
    { id: '06', name: "Contact Us", locked: false, action: () => onNavigate('contact') },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ease-in-out ${
          scrolled ? 'glass-panel py-4' : 'bg-transparent py-6'
        }`}
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 3.2, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: scrolled ? 0.9 : 1 }}
            transition={{ delay: 3.3, duration: 0.4 }}
          >

            <span className="font-display font-bold text-xl tracking-tight text-gradient">
              Scribo AI
            </span>
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative hidden md:block">
                <motion.button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border border-[rgba(255,154,108,0.3)] bg-[rgba(255,154,108,0.15)] hover:bg-[rgba(255,154,108,0.25)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.avatar}
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-dark)]">{user.name}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[var(--text-mid)] transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}>
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-2 overflow-hidden"
                    >
                      <div className="p-3 border-b border-gray-100 mb-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] flex items-center justify-center text-white font-bold shadow-sm">
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-dark)] text-sm">{user.name}</div>
                            <div className="text-xs text-[var(--text-mid)]">{user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-md w-fit">
                          <Shield size={10} />
                          {user.plan}
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-red-50 text-red-500 transition-colors text-sm font-medium"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button 
                onClick={() => document.dispatchEvent(new CustomEvent('triggerPageTransition'))}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 3.6, type: "spring", bounce: 0.4 }}
                className="hidden md:block px-5 py-2 rounded-full border border-[var(--accent)] text-[var(--accent)] font-medium text-sm hover:text-white transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--saffron)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            )}
            
            {/* Hamburger Button */}
            <button 
              onClick={() => setMenuOpen(true)}
              className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 group z-[100] relative"
            >
              <span className={`w-6 h-0.5 bg-[var(--text-dark)] transition-all duration-300 cubic-bezier(0.23,1,0.32,1) ${menuOpen ? 'rotate-[45deg] translate-y-[6px]' : 'group-hover:translate-x-[3px]'}`} />
              <span className={`w-6 h-0.5 bg-[var(--text-dark)] transition-all duration-300 cubic-bezier(0.23,1,0.32,1) ${menuOpen ? 'scale-x-0 opacity-0' : 'group-hover:-translate-x-[3px]'}`} />
              <span className={`w-6 h-0.5 bg-[var(--text-dark)] transition-all duration-300 cubic-bezier(0.23,1,0.32,1) ${menuOpen ? 'rotate-[-45deg] translate-y-[-6px]' : 'group-hover:translate-x-[3px]'}`} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Side Panel Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-[4px] z-[9998]"
            />
            
            {/* Slide Panel */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="fixed top-0 left-0 h-full w-[280px] md:w-[320px] bg-[#FFF8F4]/97 backdrop-blur-2xl z-[9999] shadow-[8px_0_40px_rgba(255,154,108,0.15)] border-r border-[var(--glass-border)] flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 md:p-7 flex items-center justify-between border-b border-[var(--primary)]/10">
                <div className="flex items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 100 100">
                    <path
                      d="M25,60 A15,15 0 0,1 40,45 A20,20 0 0,1 80,45 A15,15 0 0,1 85,70 L25,70 Z"
                      fill="url(#navLogoGrad)"
                    />
                  </svg>
                  <span className="font-display font-bold text-lg text-[var(--text-dark)]">Scribo AI</span>
                </div>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/5 hover:bg-[var(--accent)]/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--text-dark)]" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 px-6 py-4 flex flex-col">
                {menuItems.map((item, i) => (
                  <div
                    key={item.id}
                    className="anim-ready anim-fadeRight"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <button
                      onClick={() => {
                        if (item.locked) {
                          openComingSoon(item.name);
                        } else {
                          setMenuOpen(false);
                          item.action?.();
                        }
                      }}
                      className={`w-full flex items-center justify-between py-3.5 border-b border-[var(--primary)]/10 group transition-all ${
                        item.locked ? 'opacity-55 cursor-not-allowed' : 'hover:pl-1'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.locked ? (
                          <Lock className="w-4 h-4 text-gray-400" />
                        ) : (
                          <div className={`w-1 h-4 bg-[var(--accent)] rounded-full opacity-0 transition-opacity ${!item.locked && 'group-hover:opacity-100'}`} />
                        )}
                        <span className="font-semibold text-[16px] text-[var(--text-dark)]">
                          {item.name}
                        </span>
                        {item.locked && (
                          <span className="text-[10px] bg-[var(--primary)]/20 text-[var(--text-dark)] px-2 py-0.5 rounded-full font-bold">
                            Phase 2
                          </span>
                        )}
                      </div>
                      {!item.locked && (
                        <ArrowRight className="w-4 h-4 text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Section */}
              <div className="p-6 border-t border-[var(--primary)]/10 bg-white/30">
                <p className="text-[11px] text-center text-[var(--text-mid)] mb-4">
                  Scribo AI v1.0 — Phase 1 Beta
                </p>
                <div className="flex justify-center gap-4">
                  {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                    <button key={i} className="p-2 bg-white rounded-full shadow-sm hover:text-[var(--accent)] transition-colors">
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <Modal isOpen={comingSoonOpen} onClose={() => setComingSoonOpen(false)} className="max-w-md text-center p-8">
        <div className="w-20 h-20 bg-[var(--bg-alt)] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h3 className="text-2xl font-bold font-display mb-2">Coming in Phase 2</h3>
        <p className="text-[var(--text-mid)] mb-6">
          <span className="font-semibold text-[var(--text-dark)]">{comingSoonFeature}</span> is being crafted with care. We're building something extraordinary.
        </p>
        <div className="flex gap-2">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all"
          />
          <button 
            onClick={() => {
              alert("You'll be notified!");
              setComingSoonOpen(false);
            }}
            className="px-6 py-3 rounded-xl bg-[var(--text-dark)] text-white font-medium hover:bg-black transition-colors"
          >
            Notify Me
          </button>
        </div>
      </Modal>
    </>
  );
}

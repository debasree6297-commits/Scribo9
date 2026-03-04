import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageSquare, 
  Clock, 
  Image as ImageIcon, 
  Info, 
  Mail, 
  Hexagon, 
  LogOut, 
  Plus 
} from 'lucide-react';
import { User } from '../../App';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  activeStudioPage: string;
  onNavigate: (page: 'chat' | 'history' | 'image' | 'about' | 'contact' | 'assets' | 'landing') => void;
  onNewChat: () => void;
  setUser: (user: User | null) => void;
  setMessages: ((messages: any[]) => void) | undefined;
}

export default function Sidebar({
  isOpen,
  onClose,
  user,
  onLogout,
  activeStudioPage,
  onNavigate,
  onNewChat,
  setUser,
  setMessages
}: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[4px] z-[99998]"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              maxWidth: '100vw',
              height: '100vh',
              zIndex: 99998,
              display: 'flex'
            }}
          />
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-0 left-0 h-full w-[280px] bg-[#FFF8F4]/97 backdrop-blur-2xl z-[99999] shadow-[8px_0_40px_rgba(255,154,108,0.15)] border-r border-[var(--glass-border)] flex flex-col"
            style={{
              width: '82%',
              maxWidth: 320,
              minWidth: 260,
              height: '100vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              background: 'white',
              padding: '0 0 40px 0',
              zIndex: 99999
            }}
          >
            <div className="p-6 flex items-center justify-between border-b border-[var(--primary)]/10">
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="sidebarLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFBFA6" />
                      <stop offset="100%" stopColor="#FF9A6C" />
                    </linearGradient>
                  </defs>
                  <path d="M25,60 A15,15 0 0,1 40,45 A20,20 0 0,1 80,45 A15,15 0 0,1 85,70 L25,70 Z" fill="url(#sidebarLogoGrad)" />
                  <circle cx="55" cy="55" r="5" fill="white" />
                </svg>
                <span className="font-display font-bold text-lg text-[var(--text-dark)]">Scribo AI</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-[var(--text-dark)]" />
              </button>
            </div>

            <div className="flex-1 px-4 py-6 flex flex-col overflow-y-auto">
              {/* New Chat Button */}
              <div
                className="anim-ready anim-fadeRight mb-2"
                style={{ animationDelay: '0.05s' }}
              >
                <button
                  onClick={() => {
                    import('../../utils/soundEffects').then(s => {
                      s.playNewChat();
                      navigator.vibrate?.(30);
                    });
                    onNewChat();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#FF9A6C] to-[#FFC87A] text-white font-bold shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus size={18} />
                  New Chat
                </button>
              </div>

              {/* Main Apps */}
              <div className="space-y-1 mb-2">
                {[
                  { id: 'chat', label: 'Chat Studio', icon: <MessageSquare size={18} />, active: activeStudioPage === 'chat', action: () => onNavigate('chat') },
                  { id: 'history', label: 'Chat History', icon: <Clock size={18} />, active: activeStudioPage === 'history', action: () => onNavigate('history') },
                  { id: 'image', label: 'Image Studio', icon: <ImageIcon size={18} />, active: activeStudioPage === 'image', action: () => onNavigate('image') },
                  { id: 'assets', label: 'Asset Hub', icon: <Hexagon size={18} />, active: activeStudioPage === 'assets', action: () => onNavigate('assets') },
                ].map((item, i) => (
                  <div
                    key={item.id}
                    className="anim-ready anim-fadeRight"
                    style={{ animationDelay: `${(i + 1) * 0.05}s` }}
                  >
                    <button
                      onClick={() => {
                        import('../../utils/soundEffects').then(s => {
                          s.playNav();
                          navigator.vibrate?.([15,5,20]);
                        });
                        item.action?.();
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        item.active 
                          ? 'bg-[rgba(255,154,108,0.1)] text-[#FF9A6C] font-semibold' 
                          : 'text-[var(--text-dark)] hover:bg-black/5'
                      }`}
                    >
                      <span className={item.active ? 'text-[#FF9A6C]' : 'text-[var(--text-mid)]'}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--primary)]/10 my-2 mx-2" />

              {/* Info Pages */}
              <div className="space-y-1 mb-2">
                {[
                  { id: 'about', label: 'About Scribo AI', icon: <Info size={18} />, active: activeStudioPage === 'about', action: () => onNavigate('about') },
                  { id: 'contact', label: 'Contact Us', icon: <Mail size={18} />, active: activeStudioPage === 'contact', action: () => onNavigate('contact') },
                ].map((item, i) => (
                  <div
                    key={item.id}
                    className="anim-ready anim-fadeRight"
                    style={{ animationDelay: `${(i + 5) * 0.05}s` }}
                  >
                    <button
                      onClick={() => {
                        import('../../utils/soundEffects').then(s => {
                          s.playNav();
                          navigator.vibrate?.([15,5,20]);
                        });
                        item.action?.();
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        item.active 
                          ? 'bg-[rgba(255,154,108,0.1)] text-[#FF9A6C] font-semibold' 
                          : 'text-[var(--text-dark)] hover:bg-black/5'
                      }`}
                    >
                      <span className={item.active ? 'text-[#FF9A6C]' : 'text-[var(--text-mid)]'}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--primary)]/10 my-2 mx-2" />

              {/* User Profile & Sign Out */}
              <div className="mt-auto pt-2">
                <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-white/50 border border-[var(--primary)]/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[var(--text-dark)] text-sm truncate">{user.name}</div>
                    <div className="text-[11px] text-[var(--text-mid)] truncate">{user.email}</div>
                  </div>

                </div>
                
                <button 
                  onClick={async () => {
                    try {
                      // Try Firebase signOut first
                      await signOut(auth);
                    } catch(e) {
                      // If dev user (no Firebase), skip
                      console.log('Dev mode logout');
                    }
                    
                    // Always do these regardless:
                    setUser(null);
                    setMessages?.([]);
                    onClose();
                    onNavigate('landing');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-500 transition-colors text-sm font-medium"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

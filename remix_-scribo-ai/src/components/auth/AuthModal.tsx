import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { 
  auth, 
  signInWithPopup, 
  googleProvider
} from '../../services/firebase';

const playTone = (
  freq: number, dur: number,
  type: OscillatorType = 'sine',
  vol = 0.15, delay = 0
) => {
  try {
    const ac = new (
      (window as any).AudioContext ||
      (window as any).webkitAudioContext
    )();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.value = freq;
    osc.type = type;
    const t = ac.currentTime + delay;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur);
    setTimeout(() => ac.close(), (dur + delay + 0.1) * 1000);
  } catch (e) {}
};

const soundClick = () => playTone(800, 0.1, 'sine', 0.1);
const soundLogin = () => {
  playTone(500, 0.4, 'sine', 0.15);
  playTone(700, 0.4, 'sine', 0.1, 0.1);
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess = () => {} }: AuthModalProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setGoogleLoading(false);
      setToastMessage(null);
    } else {
      document.body.style.overflow = '';
      setToastMessage(null);
      setUnauthorizedDomain(null);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    setGoogleLoading(false);
    setToastMessage(null);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setToastMessage(null);
      setUnauthorizedDomain(null);
      
      // Safety timeout — reset after 10 seconds if no response
      const timeout = setTimeout(() => {
        setGoogleLoading(false);
        setToastMessage('Sign-in timed out. Please try again.');
      }, 10000);
      
      // Ensure local persistence is set before signing in
      await setPersistence(auth, browserLocalPersistence);
      
      // Use popup (not redirect) for web apps
      const result = await signInWithPopup(auth, googleProvider);
      
      clearTimeout(timeout);
      
      console.log('Google sign in success:', result.user.email);
      
      // Don't navigate here —
      // onAuthStateChanged in App.tsx handles it
      
    } catch (error: any) {
      setGoogleLoading(false);
      
      if (error.code === 'auth/unauthorized-domain') {
        console.warn("Domain not authorized:", window.location.hostname);
        const domain = window.location.hostname;
        setUnauthorizedDomain(domain);
        setToastMessage('🚫 Domain not authorized.');
      } else {
        console.error("Google Sign In Error:", error);
        
        if (error.code === 'auth/popup-blocked') {
          setToastMessage('🚫 Allow popups in browser settings.');
        } else if (error.code === 'auth/operation-not-allowed') {
          setToastMessage('⚠️ Google Sign-In is not enabled in Firebase Console.');
        } else if (error.code !== 'auth/popup-closed-by-user') {
          setToastMessage('Sign in failed. Try again.');
        } else {
          // User closed popup — reset loading
          setGoogleLoading(false);
        }
      }
    }
  };

  const copyDomain = () => {
    if (unauthorizedDomain) {
      navigator.clipboard.writeText(unauthorizedDomain);
      setToastMessage('✅ Domain copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[rgba(10,10,30,0.7)] backdrop-blur-[20px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-[400px] bg-[rgba(255,255,255,0.08)] backdrop-blur-[40px] border border-[rgba(255,255,255,0.15)] rounded-[36px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,154,108,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]"
            style={{
              width: '92%',
              maxWidth: 420,
              margin: '0 auto'
            }}
          >
            {/* Floating Orbs (Inside Modal) */}
            <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(255,154,108,0.25),transparent)] blur-[40px] animate-[orbFloat1_6s_ease-in-out_infinite] pointer-events-none" />
            <div className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] rounded-full bg-[radial-gradient(circle,rgba(255,200,122,0.2),transparent)] blur-[30px] animate-[orbFloat2_8s_ease-in-out_infinite] pointer-events-none" />
            <div className="absolute top-[40%] right-[-20px] w-[80px] h-[80px] rounded-full bg-[radial-gradient(circle,rgba(150,100,255,0.15),transparent)] blur-[20px] animate-[orbFloat1_5s_ease-in-out_infinite_reverse] pointer-events-none" />

            {/* Top Banner */}
            <div className="relative h-[150px] bg-gradient-to-br from-[rgba(255,154,108,0.9)] via-[rgba(255,200,122,0.85)] to-[rgba(255,224,163,0.8)] backdrop-blur-[10px] flex items-center justify-center overflow-hidden">
              {/* Shimmer Sweep */}
              <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.3)_50%,transparent_70%)] bg-[length:200%_100%] animate-[bannerShimmer_3s_ease_infinite]" />
              
              {/* Glowing Grid Pattern */}
              <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

              {/* Close Button */}
              <button 
                onClick={() => {
                  soundClick();
                  handleClose();
                }}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(255,255,255,0.25)] flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.4)] hover:rotate-90 transition-all duration-300 z-20 backdrop-blur-md border border-[rgba(255,255,255,0.3)]"
              >
                <X size={18} />
              </button>

              {/* Logo & Branding */}
              <div className="flex flex-col items-center z-10 relative">
                <div className="w-[72px] h-[72px] rounded-[20px] bg-[rgba(255,255,255,0.25)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.4)] flex items-center justify-center text-[32px] text-white animate-[logoPulse_3s_ease-in-out_infinite] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                  ✦
                </div>
                <h2 className="font-display text-[22px] font-extrabold text-white mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                  Scribo AI
                </h2>
                <span className="font-sans text-[11px] font-medium text-[rgba(255,255,255,0.85)] tracking-[2px] uppercase">
                  Your AI Creative Studio
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="px-7 pt-7 pb-6 bg-transparent relative z-10">
              <motion.h2 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="font-display text-[22px] font-extrabold text-center mb-2 bg-gradient-to-br from-white via-[rgba(255,200,150,0.9)] to-white bg-[length:200%] bg-clip-text text-transparent animate-[textShimmer_4s_ease_infinite]"
              >
                Welcome, Creator! 👋
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="font-sans text-[14px] text-[rgba(255,255,255,0.6)] text-center leading-[1.7] mb-6"
              >
                Sign in securely with your Google account<br/>to access your creative workspace.
              </motion.p>

              {/* Trust Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex justify-center gap-3 mb-6"
              >
                {[
                  { icon: '🔒', text: 'Secure' },
                  { icon: '⚡', text: 'Instant' },
                  { icon: '🛡️', text: 'Private' }
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-1 px-3.5 py-1.5 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,154,108,0.3)] rounded-full backdrop-blur-[8px] hover:bg-[rgba(255,154,108,0.15)] hover:-translate-y-[1px] transition-all duration-300 cursor-default">
                    <span className="text-[11px]">{badge.icon}</span>
                    <span className="font-sans text-[11px] font-bold text-[rgba(255,200,150,0.9)]">{badge.text}</span>
                  </div>
                ))}
              </motion.div>

              <div className="h-[1px] w-full bg-[rgba(255,255,255,0.1)] mb-5" />

              {/* Google Button OR Unauthorized Domain Error */}


              {unauthorizedDomain ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-[20px] backdrop-blur-md"
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="text-2xl mb-2">⚠️</span>
                    <h3 className="text-[#FF8A8A] font-bold text-[14px] mb-1">Domain Not Authorized</h3>
                    <p className="text-[rgba(255,255,255,0.7)] text-[12px] mb-3 leading-relaxed">
                      This preview URL needs to be added to your Firebase Console to allow sign-in.
                    </p>
                    
                    <div className="flex items-center gap-2 w-full bg-[rgba(0,0,0,0.2)] rounded-lg p-2 mb-3 border border-[rgba(255,255,255,0.1)]">
                      <code className="text-[11px] text-[rgba(255,255,255,0.9)] font-mono truncate flex-1 text-left">
                        {unauthorizedDomain}
                      </code>
                      <button 
                        onClick={copyDomain}
                        className="text-[10px] bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-white px-2 py-1 rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>

                    <p className="text-[10px] text-[rgba(255,255,255,0.5)]">
                      Go to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized Domains
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.button 
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  onClick={() => {
                    soundLogin();
                    navigator.vibrate?.([20, 10, 30]);
                    handleGoogleSignIn();
                  }}
                  disabled={googleLoading}
                  className="w-full py-4 bg-[rgba(255,255,255,0.95)] border border-[rgba(255,255,255,0.3)] rounded-[20px] flex items-center justify-center gap-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.25),0_0_30px_rgba(255,154,108,0.2)] hover:-translate-y-[3px] hover:border-[rgba(255,154,108,0.4)] active:scale-[0.98] transition-all duration-300 group disabled:opacity-75 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {/* Button Shimmer */}
                  <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_30%,rgba(255,154,108,0.15)_50%,transparent_70%)] -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  
                  {googleLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-[spin_1s_linear_infinite] text-[#FF9A6C]" />
                      <span className="font-sans text-[16px] font-bold text-[#1A1A2E]">Signing you in...</span>
                    </>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="font-sans text-[16px] font-bold text-[#1A1A2E] relative z-10">Continue with Google</span>
                    </>
                  )}
                </motion.button>
              )}


              {/* Error Display */}
              <AnimatePresence>
                {toastMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] rounded-xl px-4 py-3 text-[#FF8A8A] text-[13px] font-semibold text-center overflow-hidden backdrop-blur-md"
                  >
                    {toastMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security Note */}
              <motion.div 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-5 p-4 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,154,108,0.15)] rounded-2xl backdrop-blur-[8px]"
              >
                <h4 className="font-sans text-[13px] font-bold text-[rgba(255,255,255,0.9)] mb-2 flex items-center gap-1.5">
                  <span>🛡️</span> Why Google Sign-In?
                </h4>
                <div className="space-y-1">
                  {[
                    "Your data is protected by Google's security",
                    "We never store your password",
                    "One tap — no forms, no hassle"
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[rgba(255,154,108,0.9)] text-[12px] mt-[2px]">✓</span>
                      <span className="font-sans text-[12px] text-[rgba(255,255,255,0.5)] leading-tight">{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <p className="mt-4 font-sans text-[11px] text-[rgba(255,255,255,0.3)] text-center leading-[1.6]">
                By continuing, you agree to Scribo AI's<br/>Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

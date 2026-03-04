import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  Wand2,
  ArrowLeft,
  Info,
  Loader2,
  Bot,
  Download,
  RefreshCw,
  ZoomIn
} from 'lucide-react';
import { User } from '../../App';
// Gemini import removed
import { loadImageGenData, saveImageGenData } from '../../services/userService';
import SoundButton from '../SoundButton';
import WelcomeScreen from '../WelcomeScreen';

interface ImageStudioProps {
  user: User;
  onBack: () => void;
  onOpenMenu: () => void;
}

const detectDimensions = (text: string) => {
  const t = text.toLowerCase();
  
  // YouTube Thumbnail
  if (t.includes('thumbnail') || 
      t.includes('youtube') ||
      t.includes('16:9')) 
    return { w: 1280, h: 720 };
  
  // Portrait / Poster / Reel Cover
  if (t.includes('poster') || 
      t.includes('portrait') ||
      t.includes('reel') ||
      t.includes('story') ||
      t.includes('9:16') ||
      t.includes('vertical'))
    return { w: 720, h: 1280 };
  
  // Twitter/Facebook Cover
  if (t.includes('cover') || 
      t.includes('banner') ||
      t.includes('header'))
    return { w: 1500, h: 500 };
  
  // Profile / Avatar
  if (t.includes('avatar') || 
      t.includes('profile') ||
      t.includes('1:1') ||
      t.includes('square'))
    return { w: 512, h: 512 };
  
  // Instagram Post
  if (t.includes('instagram') || 
      t.includes('post'))
    return { w: 1080, h: 1080 };
  
  // Facebook Post
  if (t.includes('facebook'))
    return { w: 1200, h: 630 };
  
  // Default
  return { w: 1024, h: 1024 };
};

const enhancePrompt = (userPrompt: string) => {
  return `${userPrompt}, 
    masterpiece, ultra-detailed, 
    8K resolution, photorealistic, 
    cinematic lighting, sharp focus`;
};

const suggestions = [
  {
    emoji: "🎬",
    title: "Cinematic Landscape",
    desc: "Epic wide shots, dramatic lighting",
    gradient: "rgba(139, 69, 19, 0.4), rgba(165, 42, 42, 0.4)", // dark brown/red bg
    prompt: "A cinematic wide landscape with "
  },
  {
    emoji: "🎨",
    title: "Digital Art Portrait",
    desc: "Stylized, vivid, ultra-detailed",
    gradient: "rgba(75, 0, 130, 0.4), rgba(138, 43, 226, 0.4)", // dark purple bg
    prompt: "A stylized, vivid, ultra-detailed digital art portrait of "
  },
  {
    emoji: "🔥",
    title: "YouTube Thumbnail",
    desc: "High contrast, attention-grabbing",
    gradient: "rgba(85, 107, 47, 0.4), rgba(101, 67, 33, 0.4)", // dark olive/brown bg
    prompt: "A high contrast, attention-grabbing YouTube thumbnail featuring "
  },
  {
    emoji: "🌌",
    title: "Space & Cosmos",
    desc: "Nebulas, galaxies, cosmic art",
    gradient: "rgba(0, 0, 128, 0.4), rgba(25, 25, 112, 0.4)", // dark blue/navy bg
    prompt: "A cosmic art piece showing nebulas and galaxies with "
  },
  {
    emoji: "👤",
    title: "AI Avatar",
    desc: "Futuristic profile, neon style",
    gradient: "rgba(0, 128, 128, 0.4), rgba(0, 139, 139, 0.4)", // dark teal bg
    prompt: "A futuristic AI avatar profile in neon style of "
  },
  {
    emoji: "🏙️",
    title: "Cyber City",
    desc: "Neon lights, rain, dark future",
    gradient: "rgba(128, 0, 128, 0.4), rgba(148, 0, 211, 0.4)", // dark purple bg
    prompt: "A cyberpunk city with neon lights and rain in a dark future, "
  }
];

export default function ImageStudio({ user, onBack, onOpenMenu }: ImageStudioProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [imgLoading, setImgLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageType, setImageType] = useState('custom');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateFeedback, setRegenerateFeedback] = useState('');
  const [messages, setMessages] = useState<Array<{ 
    role: 'user' | 'ai', 
    text?: string, 
    images?: string[],
    generatedImage?: string,
    isLoading?: boolean,
    promptUsed?: string
  }>>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Generation Limit & Ad States
  const [genCount, setGenCount] = useState(0);
  const [adsWatched, setAdsWatched] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adReady, setAdReady] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Load from Firestore on mount
  useEffect(() => {
    if (!user?.uid) return;
    
    const init = async () => {
      const data = await loadImageGenData(user.uid);
      setGenCount(data.genCount);
      setAdsWatched(data.adsWatched);
      setDataLoaded(true);
    };
    
    init();
  }, [user?.uid]);

  // Ad Countdown
  useEffect(() => {
    if (!showAdModal) return;
    if (adReady) return;

    if (adCountdown <= 0) {
      setAdReady(true);
      return;
    }

    const timer = setTimeout(() => {
      setAdCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showAdModal, adCountdown, adReady]);

  useEffect(() => {
    // Show welcome banner on mount
    const timer = setTimeout(() => {
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3500);
    }, 500);

    // Create stars
    const container = document.getElementById('image-studio-page');
    if (container) {
      for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 2 + 1;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 5;
        
        star.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          background: white;
          border-radius: 50%;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          opacity: ${Math.random() * 0.7 + 0.2};
          animation: starTwinkle ${duration}s ease-in-out ${delay}s infinite;
          pointer-events: none;
          z-index: 0;
        `;
        container.appendChild(star);
      }

      // Create asteroids
      for (let i = 0; i < 8; i++) {
        const asteroid = document.createElement('div');
        const size = Math.random() * 4 + 2;
        const duration = Math.random() * 8 + 6;
        const delay = Math.random() * 10;
        const startX = Math.random() * 100;
        const angle = Math.random() * 20 + 30;
        
        asteroid.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size * 0.4}px;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0) 0%,
            rgba(255,220,180,0.9) 50%,
            rgba(255,255,255,0) 100%
          );
          border-radius: 50%;
          top: -10px;
          left: ${startX}%;
          transform: rotate(${angle}deg);
          animation: asteroidFall ${duration}s linear ${delay}s infinite;
          pointer-events: none;
          z-index: 0;
          box-shadow: 0 0 6px rgba(255,200,150,0.6);
        `;
        container.appendChild(asteroid);
      }
    }

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const generateImage = async (promptOverride?: string, imageFile?: File | null) => {
    const userPrompt = typeof promptOverride === 'string' ? promptOverride : input.trim();
    if (!userPrompt && !imageFile) return;
    
    setHasStarted(true);
    setIsGenerating(true);
    setStatus('✨ Analyzing your vision...');
    
    // Add AI loading message
    setMessages(prev => [...prev, { 
      role: 'ai', 
      isLoading: true 
    }]);

    // Loading message rotation
    const loadingMessages = [
      '✨ Analyzing your vision...',
      '🎨 Painting your imagination...',
      '⚡ Bringing it to life...',
      '🖼️ Final touches...'
    ];
    let msgIndex = 0;
    const loadingInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setStatus(loadingMessages[msgIndex]);
    }, 3000);

    try {
        // Step 1: If image uploaded, analyze it first
        let finalPrompt = userPrompt;
        
        if (imageFile) {
          const base64Image = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
          });

          // Use Gemini to analyze uploaded image
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({
            apiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
          });
          
          const imageData = base64Image.split(',')[1];
          const result = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      data: imageData,
                      mimeType: imageFile.type
                    }
                  },
                  {
                    text: `Analyze this image and combine with 
                    this prompt: "${userPrompt}". 
                    Create a detailed image generation 
                    prompt describing style, colors, 
                    lighting, composition, mood.
                    Return ONLY the prompt, nothing else.`
                  }
                ]
              }
            ]
          });
          
          finalPrompt = result.text || '';
        }

        // Step 2: Enhance the prompt
        const enhanced = `${finalPrompt}, 
          masterpiece, ultra-detailed, 
          8K resolution, photorealistic, 
          cinematic lighting, sharp focus, 
          professional photography`;

        // Step 3: Generate image via API
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: enhanced })
        });

        const data = await response.json();

        clearInterval(loadingInterval);

        if (data.image) {
            const imageUrl = data.image;
            setIsGenerating(false);
            setStatus('');
            setMessages(prev => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (lastMsg.role === 'ai' && lastMsg.isLoading) {
                    lastMsg.isLoading = false;
                    lastMsg.generatedImage = imageUrl;
                    lastMsg.promptUsed = userPrompt;
                }
                return newMsgs;
            });
            
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);

            const newCount = genCount + 1;
            setGenCount(newCount);

            // Save to Firestore immediately
            if (user?.uid) {
                await saveImageGenData(
                    user.uid,
                    newCount,
                    adsWatched,
                    new Date().toDateString()
                );
            }
        } else {
            throw new Error("Generation failed. Try again 🔄");
        }

    } catch (err: any) {
        clearInterval(loadingInterval);
        console.error('Generation failed:', err);
        setIsGenerating(false);
        setStatus('');
        setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg.role === 'ai' && lastMsg.isLoading) {
                lastMsg.isLoading = false;
                lastMsg.text = `❌ ${err.message || 'Something went wrong. Try again! 🔄'}`;
            }
            return newMsgs;
        });
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'scribo-ai-generated.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleRegenerate = async () => {
    setShowRegenerateModal(false);
    const lastPrompt = messages.find(m => m.role === 'ai' && m.generatedImage)?.promptUsed || input;
    const updatedPrompt = regenerateFeedback
      ? `${lastPrompt}. Improvements: ${regenerateFeedback}`
      : lastPrompt;
    setRegenerateFeedback('');
    setInput(updatedPrompt);
    setTimeout(() => generateImage(updatedPrompt), 0);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text && !uploadedFile) return;
    if (isGenerating) return;
    
    // Add user message
    const userImages = previewUrl ? [previewUrl] : [];
    setMessages(prev => [...prev, { role: 'user', text, images: userImages }]);
    
    const fileToProcess = uploadedFile;
    
    // Clear input
    setInput("");
    setUploadedFile(null);
    setPreviewUrl(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Generate
    generateImage(text, fileToProcess);
  };

  const checkLimitAndGenerate = () => {
    // Wait until data loaded from Firestore
    if (!dataLoaded) return;
    
    // Gen 8+ → Fully locked for today
    if (genCount >= 7) {
      setShowLockedModal(true);
      return;
    }
    
    // Gen 4 needs first ad (after 3 free)
    if (genCount === 3 && adsWatched === 0) {
      setAdReady(false);
      setAdCountdown(5);
      setShowAdModal(true);
      return;
    }
    
    // Gen 6 needs second ad (after 5)
    if (genCount === 5 && adsWatched === 1) {
      setAdReady(false);
      setAdCountdown(5);
      setShowAdModal(true);
      return;
    }
    
    // All good — generate
    generateImage(input.trim(), uploadedFile);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      checkLimitAndGenerate();
    }
  };

  const handleChipClick = (suggestion: typeof suggestions[0]) => {
    setInput(suggestion.prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
      }, 0);
    }
  };

  const getRemainingInfo = () => {
    if (!dataLoaded) return { 
      left: '...', total: 7, color: '#CCC' 
    };
    if (genCount < 3) return { 
      left: 3 - genCount, total: 7, 
      color: '#10B981' 
    };
    if (genCount < 5) return { 
      left: 5 - genCount, total: 7, 
      color: '#FF9A6C' 
    };
    if (genCount < 7) return { 
      left: 7 - genCount, total: 7, 
      color: '#8B5CF6' 
    };
    return { left: 0, total: 7, color: '#EF4444' };
  };

  const info = getRemainingInfo();

  return (
    <motion.div 
      id="image-studio-page"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="fixed inset-0 z-[10000] flex flex-col overflow-hidden"
      style={{
        background: '#050510',
        width: '100%',
        maxWidth: '100vw',
        height: '100dvh',
        overflowX: 'hidden'
      }}
    >
      {/* Space Effects Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Nebula 1 */}
        <div 
          className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full animate-[nebulaDrift1_15s_ease-in-out_infinite]" 
          style={{
            background: 'radial-gradient(circle, rgba(255,100,150,0.08) 0%, rgba(150,50,255,0.05) 50%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        />
        {/* Nebula 2 */}
        <div 
          className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full animate-[nebulaDrift2_18s_ease-in-out_infinite]" 
          style={{
            background: 'radial-gradient(circle, rgba(50,150,255,0.07) 0%, rgba(255,154,108,0.04) 50%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        {/* Nebula 3 */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full animate-[nebulaDrift3_12s_ease-in-out_infinite]" 
          style={{
            background: 'radial-gradient(circle, rgba(255,200,100,0.05) 0%, transparent 70%)',
            filter: 'blur(100px)'
          }}
        />
        {/* Shooting Star */}
        <div 
          className="absolute top-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent rounded-[2px] animate-[shootingStar_1.2s_ease-in_8s_infinite]" 
          style={{ width: '120px' }}
        />
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 80, left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))',
          border: '1px solid rgba(16,185,129,0.4)',
          backdropFilter: 'blur(20px)',
          borderRadius: 50,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 99999,
          animation: 'slideDown 0.4s cubic-bezier(0.23,1,0.32,1)'
        }}>
          <span style={{fontSize: 18}}>✨</span>
          <span style={{
            color: '#10B981',
            fontWeight: 700,
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: 0.3
          }}>Your image is ready!</span>
          <span style={{fontSize: 18}}>🎨</span>
        </div>
      )}

      {/* Regenerate Modal */}
      {showRegenerateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 480,
            background: 'rgba(18,18,28,0.97)',
            borderRadius: '24px 24px 0 0',
            padding: '8px 20px 32px',
            border: '1px solid rgba(255,255,255,0.08)',
            animation: 'slideUp 0.3s cubic-bezier(0.23,1,0.32,1)'
          }}>

            {/* Handle bar */}
            <div style={{
              width: 36, height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.15)',
              margin: '12px auto 20px'
            }}/>

            {/* Title */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}>
              <svg width="18" height="18"
                viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12a8 8 0 018-8 8 8 0 016.32 3.09"
                  stroke="#FF9A6C" strokeWidth="2.5"
                  strokeLinecap="round"/>
                <path
                  d="M20 12a8 8 0 01-8 8 8 8 0 01-6.32-3.09"
                  stroke="#FF9A6C" strokeWidth="2.5"
                  strokeLinecap="round"/>
                <path d="M18 5l2.5 2.5L18 10"
                  stroke="#FF9A6C" strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"/>
              </svg>
              <h3 style={{
                color: 'white',
                fontWeight: 800,
                fontSize: 17,
                margin: 0,
                fontFamily: 'Plus Jakarta Sans, sans-serif'
              }}>Regenerate Image</h3>
            </div>

            {/* Feedback input */}
            <textarea
              placeholder="What should change? (optional)"
              value={regenerateFeedback}
              onChange={e => 
                setRegenerateFeedback(e.target.value)
              }
              style={{
                width: '100%',
                minHeight: 90,
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 14,
                color: 'white',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 14,
                lineHeight: 1.6
              }}
            />

            {/* Quick chips */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 7,
              marginBottom: 18
            }}>
              {[
                'More vibrant 🌈',
                'Darker mood 🌑',
                'More realistic 📸',
                'Different angle 🔄',
                'Better lighting ✨'
              ].map(chip => (
                <button
                  key={chip}
                  onClick={() => 
                    setRegenerateFeedback(chip)
                  }
                  style={{
                    padding: '6px 12px',
                    background: regenerateFeedback === chip
                      ? 'rgba(255,154,108,0.2)'
                      : 'rgba(255,255,255,0.06)',
                    border: regenerateFeedback === chip
                      ? '1px solid rgba(255,154,108,0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 50,
                    color: regenerateFeedback === chip
                      ? '#FF9A6C'
                      : 'rgba(255,255,255,0.6)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Buttons row */}
            <div style={{
              display: 'flex', gap: 10
            }}>
              <button
                onClick={() => {
                  setShowRegenerateModal(false);
                  setRegenerateFeedback('');
                }}
                style={{
                  flex: 1,
                  padding: '13px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >Cancel</button>

              <button
                onClick={handleRegenerate}
                style={{
                  flex: 2,
                  padding: '13px',
                  background: 'linear-gradient(135deg, #FF9A6C, #FFC87A)',
                  border: 'none',
                  borderRadius: 14,
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  boxShadow: '0 4px 16px rgba(255,154,108,0.3)'
                }}
              >
                🚀 Regenerate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 py-3 min-h-[60px] bg-[rgba(5,5,16,0.8)] backdrop-blur-[24px] border-b border-[rgba(255,255,255,0.06)] shrink-0 sticky top-0 z-[100] anim-fadeDown">
        <SoundButton 
          soundType="click"
          onClick={onOpenMenu}
          className="w-10 h-10 rounded-xl bg-white/8 border border-white/12 flex flex-col items-center justify-center gap-[4px] cursor-pointer hover:bg-white/15 transition-colors relative z-[200]"
        >
          <div className="w-[18px] h-[1.5px] bg-white rounded-full" />
          <div className="w-[18px] h-[1.5px] bg-white rounded-full" />
          <div className="w-[18px] h-[1.5px] bg-white rounded-full" />
        </SoundButton>

        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          pointerEvents: 'none'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7
          }}>

            {/* Cloud SVG Logo */}
            <div style={{width: 28, height: 28}}>
              <svg viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                style={{width:'100%',height:'100%'}}
              >
                <defs>
                  <radialGradient id="ih1" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#FFE0C0"/>
                    <stop offset="55%" stopColor="#FFAA72"/>
                    <stop offset="100%" stopColor="#FF8C50"/>
                  </radialGradient>
                  <radialGradient id="ih2" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#FFD4A8"/>
                    <stop offset="100%" stopColor="#FF9A6C"/>
                  </radialGradient>
                </defs>
                <ellipse cx="62" cy="118" rx="38" ry="34"
                  fill="url(#ih2)" opacity="0.92"/>
                <ellipse cx="138" cy="122" rx="34" ry="30"
                  fill="url(#ih2)" opacity="0.88"/>
                <ellipse cx="100" cy="135" rx="72" ry="38"
                  fill="url(#ih1)"/>
                <ellipse cx="100" cy="90" rx="50" ry="50"
                  fill="url(#ih1)"/>
                <ellipse cx="62" cy="100" rx="36" ry="36"
                  fill="url(#ih2)" opacity="0.95"/>
                <circle cx="105" cy="95" r="40"
                  fill="none" stroke="white" strokeWidth="7"
                  strokeOpacity="0.65" strokeLinecap="round"
                  strokeDasharray="180 70"
                  transform="rotate(-30 105 95)"/>
                <circle cx="105" cy="95" r="27"
                  fill="none" stroke="white" strokeWidth="5.5"
                  strokeOpacity="0.55" strokeLinecap="round"
                  strokeDasharray="120 45"
                  transform="rotate(20 105 95)"/>
                <circle cx="105" cy="95" r="16"
                  fill="none" stroke="white" strokeWidth="4"
                  strokeOpacity="0.5" strokeLinecap="round"
                  strokeDasharray="65 28"
                  transform="rotate(80 105 95)"/>
                <circle cx="105" cy="95" r="7"
                  fill="white" opacity="0.9"/>
                <circle cx="105" cy="95" r="3.5"
                  fill="white"/>
              </svg>
            </div>

            <span style={{
              fontWeight: 800,
              fontSize: 17,
              color: 'white',
              fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
              letterSpacing: 0.2
            }}>Scribo AI</span>
          </div>

          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: '#FF9A6C',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif'
          }}>IMAGE STUDIO</span>
        </div>
      </nav>

      {/* Welcome Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div 
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            className="bg-[rgba(255,154,108,0.12)] border-b border-[rgba(255,154,108,0.15)] py-3 px-5 flex items-center justify-center text-center sticky top-0 z-50"
          >
            <span className="text-[rgba(255,154,108,0.95)] text-sm font-semibold">
              🎨 Welcome to Image Studio, {user.name.split(' ')[0]}! Describe your vision and bring it to life ✨
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star Particles Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-20 animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 3 + 2 + 's'
            }}
          />
        ))}
      </div>

      {/* Blur Overlay */}
      <div 
        id="studio-blur-overlay"
        className={`absolute inset-0 z-[1] backdrop-blur-[3px] bg-[rgba(5,5,16,0.3)] transition-opacity duration-500 pointer-events-none ${hasStarted ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div 
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center z-10 w-full px-6"
            >
              <div style={{
                width: 90,
                height: 90,
                marginBottom: 24,
                animation: 'logoPulse 3s ease-in-out infinite',
                filter: 'drop-shadow(0 10px 28px rgba(255,154,108,0.45))'
              }}>
                <svg viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{width:'100%',height:'100%'}}
                >
                  <defs>
                    <radialGradient id="is1" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#FFE0C0"/>
                      <stop offset="55%" stopColor="#FFAA72"/>
                      <stop offset="100%" stopColor="#FF8C50"/>
                    </radialGradient>
                    <radialGradient id="is2" cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#FFD4A8"/>
                      <stop offset="100%" stopColor="#FF9A6C"/>
                    </radialGradient>
                  </defs>
                  <ellipse cx="62" cy="118" rx="38" ry="34"
                    fill="url(#is2)" opacity="0.92"/>
                  <ellipse cx="138" cy="122" rx="34" ry="30"
                    fill="url(#is2)" opacity="0.88"/>
                  <ellipse cx="100" cy="135" rx="72" ry="38"
                    fill="url(#is1)"/>
                  <ellipse cx="100" cy="90" rx="50" ry="50"
                    fill="url(#is1)"/>
                  <ellipse cx="62" cy="100" rx="36" ry="36"
                    fill="url(#is2)" opacity="0.95"/>
                  <circle cx="105" cy="95" r="40"
                    fill="none" stroke="white" strokeWidth="7"
                    strokeOpacity="0.65" strokeLinecap="round"
                    strokeDasharray="180 70"
                    transform="rotate(-30 105 95)"/>
                  <circle cx="105" cy="95" r="27"
                    fill="none" stroke="white" strokeWidth="5.5"
                    strokeOpacity="0.55" strokeLinecap="round"
                    strokeDasharray="120 45"
                    transform="rotate(20 105 95)"/>
                  <circle cx="105" cy="95" r="16"
                    fill="none" stroke="white" strokeWidth="4"
                    strokeOpacity="0.5" strokeLinecap="round"
                    strokeDasharray="65 28"
                    transform="rotate(80 105 95)"/>
                  <circle cx="105" cy="95" r="8"
                    fill="white" opacity="0.92"/>
                  <circle cx="105" cy="95" r="4"
                    fill="white"/>
                </svg>
              </div>
              
              <h2 className="font-display text-2xl font-extrabold text-white mb-2 tracking-[0.5px] [text-shadow:0_0_40px_rgba(255,154,108,0.3)] anim-fadeUp delay-2" style={{ animation: 'fadeUp 0.55s cubic-bezier(0.23,1,0.32,1) 0.1s forwards, textGlow 3s ease-in-out 0.65s infinite' }}>Describe Your Vision</h2>
              <p className="text-white/50 text-sm max-w-[300px] mb-8 font-inter anim-fadeUp delay-3">
                Type a prompt below to generate stunning images with AI
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-[680px] mt-8 mx-auto">
                {suggestions.map((card, i) => (
                  <SoundButton
                    soundType="click"
                    key={i}
                    onClick={() => handleChipClick(card)}
                    className="group relative rounded-[16px] p-[20px] min-h-[160px] border border-[rgba(255,255,255,0.1)] text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden anim-popIn studio-card"
                    style={{ 
                      background: `linear-gradient(135deg, ${card.gradient})`,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px'
                    }}
                  >
                    {/* Floating white dots animation */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      {[...Array(6)].map((_, j) => (
                        <div key={j} className="absolute bg-white rounded-full opacity-20" style={{
                          width: Math.random() * 3 + 1 + 'px',
                          height: Math.random() * 3 + 1 + 'px',
                          left: Math.random() * 100 + '%',
                          top: Math.random() * 100 + '%',
                          animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
                          animationDelay: `${Math.random() * 2}s`
                        }} />
                      ))}
                    </div>

                    <div className="flex flex-col justify-between h-full col-span-2">
                      <div className="text-[40px] mb-2">{card.emoji}</div>
                      <div>
                        <div className="text-[16px] font-bold text-white mb-1 font-jakarta">{card.title}</div>
                        <div className="text-[12px] text-white/50 leading-[1.4] font-inter">{card.desc}</div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </SoundButton>
                ))}
              </div>

              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes float {
                  0%, 100% { transform: translateY(0) translateX(0); }
                  33% { transform: translateY(-10px) translateX(5px); }
                  66% { transform: translateY(5px) translateX(-5px); }
                }
                .studio-card:hover {
                  border-color: rgba(255,255,255,0.25) !important;
                }
              `}} />
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 w-full max-w-[800px] flex flex-col z-10 overflow-hidden"
            >
              <div ref={chatAreaRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6 scroll-smooth">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-${msg.role === 'user' ? 'right' : 'left'}-5 duration-300`}>
                    {msg.role === 'user' ? (
                      <div className="max-w-[75%] bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] rounded-[20px_20px_4px_20px] p-[14px_18px] text-white shadow-[0_4px_20px_rgba(255,154,108,0.4)]">
                        {msg.images && msg.images.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mb-2.5">
                            {msg.images.map((img, i) => (
                              <img key={i} src={img} alt="upload" className="w-16 h-16 object-cover rounded-[10px] border-[1.5px] border-white/30" />
                            ))}
                          </div>
                        )}
                        <p className="text-sm leading-[1.7] whitespace-pre-wrap font-inter">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="max-w-[90%] w-full">
                        {msg.isLoading ? (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px 20px',
                            gap: 20
                          }}>
                            {/* Animated art palette */}
                            <div style={{
                              position: 'relative',
                              width: 80, height: 80
                            }}>
                              <div style={{
                                position: 'absolute',
                                inset: 0,
                                border: '3px solid transparent',
                                borderTopColor: '#FF9A6C',
                                borderRightColor: '#FFC87A',
                                borderRadius: '50%',
                                animation: 'spin 1.2s linear infinite'
                              }}/>
                              <div style={{
                                position: 'absolute',
                                inset: 10,
                                border: '2px solid transparent',
                                borderTopColor: '#6366F1',
                                borderLeftColor: '#8B5CF6',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite reverse'
                              }}/>
                              <div style={{
                                position: 'absolute',
                                inset: 20,
                                background: 'linear-gradient(135deg, #FF9A6C, #FFC87A)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20
                              }}>🎨</div>
                            </div>

                            <div style={{textAlign: 'center'}}>
                              <p style={{
                                color: 'white',
                                fontSize: 16,
                                fontWeight: 700,
                                marginBottom: 8
                              }}>Creating your image...</p>
                              <p style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: 13
                              }}>
                                {status || 'AI is painting your vision ✨'}
                              </p>
                            </div>

                            <div style={{
                              display: 'flex', gap: 8
                            }}>
                              {[0,1,2].map(i => (
                                <div key={i} style={{
                                  width: 8, height: 8,
                                  borderRadius: '50%',
                                  background: '#FF9A6C',
                                  animation: `bounce 1.4s ease ${i*0.2}s infinite`
                                }}/>
                              ))}
                            </div>
                          </div>
                        ) : msg.generatedImage ? (
                          <div className="w-full">
                            <div style={{
                              position: 'relative',
                              borderRadius: 24,
                              overflow: 'hidden',
                              boxShadow: `
                                0 0 0 1px rgba(255,255,255,0.06),
                                0 24px 80px rgba(0,0,0,0.6),
                                0 0 60px rgba(99,102,241,0.15)
                              `,
                              cursor: 'zoom-in',
                              animation: 'imageReveal 0.8s cubic-bezier(0.23,1,0.32,1)'
                            }}
                            onClick={() => setZoomedImage(msg.generatedImage!)}
                            >
                              {/* Top bar — like space window */}
                              <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0,
                                height: 36,
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 14px',
                                gap: 6,
                                zIndex: 2
                              }}>
                                {['#FF5F57','#FFBD2E','#28CA41'].map(c => (
                                  <div key={c} style={{
                                    width: 10, height: 10,
                                    borderRadius: '50%',
                                    background: c
                                  }}/>
                                ))}
                                
                                <div style={{
                                  position: 'absolute',
                                  top: 10,
                                  right: 10,
                                  padding: '5px 11px',
                                  borderRadius: 50,
                                  background: 'rgba(0,0,0,0.45)',
                                  backdropFilter: 'blur(8px)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  cursor: 'pointer',
                                  animation: 'zoomBadgePulse 2.5s ease-in-out infinite',
                                  border: '1px solid rgba(255,255,255,0.15)'
                                }}>
                                  <svg width="12" height="12"
                                    viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="7"
                                      stroke="white" strokeWidth="2"/>
                                    <path d="M16.5 16.5L21 21"
                                      stroke="white" strokeWidth="2.5"
                                      strokeLinecap="round"/>
                                    <path d="M8 11h6M11 8v6"
                                      stroke="white" strokeWidth="2"
                                      strokeLinecap="round"/>
                                  </svg>
                                  <span style={{
                                    fontSize: 10,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontFamily: 'Inter, sans-serif',
                                    letterSpacing: 0.5
                                  }}>Zoom</span>
                                </div>
                              </div>

                              <img
                                src={msg.generatedImage}
                                alt="Generated"
                                onLoad={() => setImgLoading(false)}
                                onError={() => {
                                  setImgLoading(false);
                                  setMessages(prev => {
                                    const newMsgs = [...prev];
                                    const lastMsg = newMsgs[newMsgs.length - 1];
                                    if (lastMsg.role === 'ai') {
                                      lastMsg.generatedImage = undefined;
                                      lastMsg.text = "❌ Generation failed. Try a simpler prompt or try again.";
                                    }
                                    return newMsgs;
                                  });
                                }}
                                style={{
                                  width: '100%',
                                  display: 'block',
                                  marginTop: 36
                                }}
                              />

                              {/* Bottom glow */}
                              <div style={{
                                position: 'absolute',
                                bottom: 0, left: 0, right: 0,
                                height: 60,
                                background: 'linear-gradient(to top, rgba(99,102,241,0.1), transparent)'
                              }}/>
                            </div>

                            <div style={{
                              display: 'flex',
                              gap: 10,
                              marginTop: 14
                            }}>

                              {/* Download button */}
                              <button
                                onClick={() => handleDownload(msg.generatedImage!)}
                                style={{
                                  flex: 1,
                                  padding: '13px 20px',
                                  background: 'linear-gradient(135deg, #FF9A6C, #FFC87A)',
                                  border: 'none',
                                  borderRadius: 16,
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: 14,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  fontFamily: 'Inter, sans-serif',
                                  boxShadow: '0 4px 16px rgba(255,154,108,0.35)',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {/* Download arrow icon */}
                                <svg width="17" height="17"
                                  viewBox="0 0 24 24" fill="none">
                                  <path d="M12 3v13M7 11l5 5 5-5"
                                    stroke="white" strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"/>
                                  <path d="M4 20h16"
                                    stroke="white" strokeWidth="2.5"
                                    strokeLinecap="round"/>
                                </svg>
                                Download
                              </button>

                              {/* Regenerate button */}
                              <button
                                onClick={() => setShowRegenerateModal(true)}
                                style={{
                                  flex: 1,
                                  padding: '13px 20px',
                                  background: 'rgba(255,255,255,0.08)',
                                  border: '1.5px solid rgba(255,255,255,0.2)',
                                  borderRadius: 16,
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: 14,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  fontFamily: 'Inter, sans-serif',
                                  backdropFilter: 'blur(8px)',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {/* Refresh/regenerate icon */}
                                <svg width="17" height="17"
                                  viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 12a8 8 0 018-8 8 8 0 016.32 3.09"
                                    stroke="white" strokeWidth="2.5"
                                    strokeLinecap="round"/>
                                  <path
                                    d="M20 12a8 8 0 01-8 8 8 8 0 01-6.32-3.09"
                                    stroke="white" strokeWidth="2.5"
                                    strokeLinecap="round"/>
                                  <path d="M18 5l2.5 2.5L18 10"
                                    stroke="white" strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"/>
                                  <path d="M6 19l-2.5-2.5L6 14"
                                    stroke="white" strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"/>
                                </svg>
                                Regenerate
                              </button>

                            </div>
                          </div>
                        ) : (
                          <div className="bg-white/7 border border-[rgba(255,154,108,0.2)] rounded-[4px_20px_20px_20px] p-6 text-white shadow-xl backdrop-blur-md">
                            {msg.text}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Bar */}
      <div className="shrink-0 p-4 md:p-5 bg-[rgba(255,255,255,0.04)] backdrop-blur-[20px] border-t border-[rgba(255,255,255,0.06)] z-20 anim-fadeUp delay-4">
        <div className="max-w-[720px] mx-auto">
          
          {/* Remaining Counter (Dots Only) */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            marginBottom: 16
          }}>
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{
                width: 7, height: 7,
                borderRadius: '50%',
                background: i < genCount 
                  ? 'rgba(255,255,255,0.15)'
                  : info.color,
                transition: 'all 0.4s ease',
                boxShadow: i < genCount 
                  ? 'none' 
                  : `0 0 6px ${info.color}66`
              }}/>
            ))}
          </div>


          {/* Uploaded Image Preview */}
          {uploadedFile && (
            <div style={{
              margin: '0 16px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <img
                src={previewUrl || ''}
                style={{
                  width: 32, height: 32,
                  borderRadius: 6,
                  objectFit: 'cover'
                }}
              />
              <span style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
                flex: 1
              }}>
                {uploadedFile.name}
              </span>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setPreviewUrl(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: 0
                }}
              >×</button>
            </div>
          )}

          {/* New Input Area */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            margin: '0 16px 16px'
          }}>

            {/* LEFT: Image upload button */}
            <SoundButton
              as="label"
              htmlFor="imgUpload"
              soundType="upload"
              style={{
                width: 40, height: 40,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              title="Upload reference image"
            >
              {/* Paperclip / image icon */}
              <svg width="18" height="18" 
                viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" 
                  rx="4" 
                  stroke="rgba(255,255,255,0.5)" 
                  strokeWidth="1.8"/>
                <circle cx="8.5" cy="8.5" r="1.5" 
                  fill="rgba(255,255,255,0.5)"/>
                <path d="M3 15l5-5 4 4 3-3 6 6" 
                  stroke="rgba(255,255,255,0.5)" 
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"/>
              </svg>

              {/* Badge when image uploaded */}
              {uploadedFile && (
                <div style={{
                  position: 'absolute',
                  top: -4, right: -4,
                  width: 14, height: 14,
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 8,
                  color: 'white',
                  fontWeight: 800
                }}>✓</div>
              )}
            </SoundButton>

            <input
              id="imgUpload"
              type="file"
              accept="image/*"
              style={{display: 'none'}}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedFile(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />

            {/* CENTER: Auto-expanding textarea */}
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto expand
                e.target.style.height = 'auto';
                e.target.style.height = 
                  Math.min(e.target.scrollHeight, 140) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  checkLimitAndGenerate();
                }
              }}
              placeholder="Describe the image you want to create..."
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                resize: 'none',
                lineHeight: 1.5,
                padding: '4px 0',
                minHeight: 24,
                maxHeight: 140,
                overflowY: 'auto'
              }}
            />

            {/* RIGHT: Send button */}
            <SoundButton
              soundType="generate"
              onClick={checkLimitAndGenerate}
              disabled={isGenerating || !input.trim()}
              style={{
                width: 40, height: 40,
                borderRadius: 12,
                background: input.trim()
                  ? 'linear-gradient(135deg, #FF9A6C, #FFC87A)'
                  : 'rgba(255,255,255,0.08)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() 
                  ? 'pointer' : 'not-allowed',
                flexShrink: 0,
                transition: 'all 0.3s ease',
                boxShadow: input.trim()
                  ? '0 4px 16px rgba(255,154,108,0.35)'
                  : 'none'
              }}
            >
              {isGenerating ? (
                <div style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}/>
              ) : (
                <svg width="18" height="18" 
                  viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" 
                    stroke="white" strokeWidth="2"
                    strokeLinecap="round"/>
                  <path d="M22 2L15 22l-4-9-9-4 20-7z" 
                    stroke="white" strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"/>
                </svg>
              )}
            </SoundButton>

          </div>
          
          <div className="text-[11px] text-white/30 text-center mt-2 font-inter">
            ⚡ Scribo AI Image Studio — Powered by Hugging Face FLUX & Gemini • Smart Prompt Analysis
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(10px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              cursor: 'zoom-out'
            }}
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              src={zoomedImage}
              alt="Zoomed"
              style={{
                maxWidth: '95vw',
                maxHeight: '90vh',
                borderRadius: 16,
                boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
              }}
            />
            <p style={{
              position: 'absolute',
              bottom: 24,
              color: 'rgba(255,255,255,0.4)',
              fontSize: 13
            }}>Tap anywhere to close</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad Modal */}
      {showAdModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 420,
            background: 'linear-gradient(160deg, #0D0A2E 0%, #0A1628 100%)',
            borderRadius: '28px 28px 0 0',
            padding: '8px 24px 36px',
            border: '1px solid rgba(99,102,241,0.2)',
            animation: 'slideUp 0.3s cubic-bezier(0.23,1,0.32,1)'
          }}>

            {/* Handle */}
            <div style={{
              width: 38, height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.1)',
              margin: '14px auto 24px'
            }}/>

            {/* Icon */}
            <div style={{
              width: 64, height: 64,
              borderRadius: 20,
              background: 'rgba(99,102,241,0.15)',
              border: '1.5px solid rgba(99,102,241,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              fontSize: 28
            }}>🎨</div>

            <h2 style={{
              color: 'white',
              fontWeight: 900,
              fontSize: 22,
              textAlign: 'center',
              margin: '0 0 8px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>Credits Used Up!</h2>

            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              textAlign: 'center',
              margin: '0 0 6px',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6
            }}>
              Your free image credits are done.
              <br/>Watch a short ad to unlock{' '}
              <span style={{
                color: '#8B5CF6',
                fontWeight: 700
              }}>2 more generations</span>!
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: 12,
              textAlign: 'center',
              margin: '0 0 28px',
              fontFamily: 'Inter, sans-serif'
            }}>Takes only a few seconds ✨</p>

            {/* Unlock button */}
            <button
              onClick={() => {
                // Open ad URL in new tab
                window.open(
                  "https://omg10.com/4/10647732",
                  '_blank'
                );
                // Unlock after 3 seconds
                setTimeout(() => {
                  const newAds = adsWatched + 1;
                  setAdsWatched(newAds);
                  if (user?.uid) {
                    saveImageGenData(
                      user.uid,
                      genCount,
                      newAds,
                      new Date().toDateString()
                    );
                  }
                  setShowAdModal(false);
                }, 3000);
              }}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none',
                borderRadius: 16,
                color: 'white',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 6px 24px rgba(99,102,241,0.4)',
                marginBottom: 12,
                letterSpacing: 0.3
              }}
            >
              🎨 Watch Ad & Unlock Images!
            </button>

            <button
              onClick={() => setShowAdModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.25)',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >Maybe later</button>

          </div>
        </div>
      )}

      {/* Locked Modal */}
      {showLockedModal && (
        <>
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(16px)',
            zIndex: 99998
          }}/>

          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '92%', maxWidth: 380,
            background: 'rgba(10,10,25,0.98)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 28,
            padding: 28,
            zIndex: 99999,
            textAlign: 'center',
            boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            animation: 'modalPop 0.45s cubic-bezier(0.23,1,0.32,1)'
          }}>

            <div style={{fontSize: 56, marginBottom: 16}}>🌙</div>

            <h3 style={{
              color: 'white',
              fontWeight: 800,
              fontSize: 22,
              margin: '0 0 12px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>You're amazing!</h3>

            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 14,
              lineHeight: 1.75,
              margin: '0 0 8px',
              fontFamily: 'Inter, sans-serif'
            }}>
              You've created <strong style={{
                color: '#FF9A6C'
              }}>7 incredible images</strong> today. 
              That's a full day of creativity! 🎉
            </p>

            <p style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 13,
              margin: '0 0 24px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Your limit resets in 24 hours. 
              Rest up and come back tomorrow! ✨
            </p>

            {/* Stars decoration */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 4,
              marginBottom: 20
            }}>
              {[...Array(7)].map((_, i) => (
                <span key={i} style={{
                  fontSize: 16,
                  animation: `twinkle ${0.5 + i*0.1}s ease-in-out infinite alternate`
                }}>⭐</span>
              ))}
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: '14px 20px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}>
              <span style={{fontSize: 20}}>⏰</span>
              <div style={{textAlign: 'left'}}>
                <div style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 11,
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: 2
                }}>Resets at</div>
                <div style={{
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif'
                }}>Tomorrow 12:00 AM</div>
              </div>
            </div>

            <button
              onClick={() => setShowLockedModal(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, rgba(255,154,108,0.12), rgba(255,200,122,0.12))',
                border: '1px solid rgba(255,154,108,0.25)',
                borderRadius: 16,
                color: '#FF9A6C',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >Got it! See you tomorrow 👋</button>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modalPop {
          from { 
            opacity: 0; 
            transform: translate(-50%,-50%) scale(0.85); 
          }
          to { 
            opacity: 1; 
            transform: translate(-50%,-50%) scale(1); 
          }
        }
        @keyframes twinkle {
          from { opacity: 0.4; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1.1); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes nebulaDrift1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-40px,30px) scale(1.1); }
          66% { transform: translate(20px,-20px) scale(0.95); }
        }
        @keyframes nebulaDrift2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px,-40px) scale(1.15); }
        }
        @keyframes nebulaDrift3 {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes shootingStar {
          0% { 
            transform: translateX(-100px) translateY(-100px) rotate(45deg);
            opacity: 0;
            width: 0;
          }
          10% { opacity: 1; width: 120px; }
          100% { 
            transform: translateX(800px) translateY(800px) rotate(45deg);
            opacity: 0;
            width: 120px;
          }
        }
        @keyframes asteroidFall {
          0% {
            transform: rotate(35deg) translateX(0) translateY(-50px);
            opacity: 0;
          }
          5% { opacity: 1; }
          90% { opacity: 0.8; }
          100% {
            transform: rotate(35deg) translateX(600px) translateY(900px);
            opacity: 0;
          }
        }
        @keyframes orbitRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sendPulse {
          0%, 100% { 
            box-shadow: 0 4px 20px rgba(255,154,108,0.5); 
          }
          50% { 
            box-shadow: 0 4px 32px rgba(255,154,108,0.9),
                        0 0 60px rgba(255,154,108,0.3);
          }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1) rotate(10deg); }
        }
        @keyframes textGlow {
          0%,100% { text-shadow: 0 0 0 transparent; }
          50% { text-shadow: 0 0 30px rgba(255,154,108,0.4); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .studio-card::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.06),
            transparent
          );
          transition: left 0.5s ease;
        }
        .studio-card:hover::after {
          left: 200%;
        }
      `}} />
      
      {showWelcome && (
        <WelcomeScreen
          type="image"
          userName={user?.name || ''}
          onDone={() => setShowWelcome(false)}
        />
      )}
    </motion.div>
  );
}

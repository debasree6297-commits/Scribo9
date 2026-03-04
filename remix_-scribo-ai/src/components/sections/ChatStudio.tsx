import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../../App';
import { chatService, Chat, Message as FirestoreMessage } from '../../services/chatService';
import { loadUserData, saveCharms } from '../../services/userService';
import SoundButton from '../SoundButton';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Clock, 
  LogOut, 
  Send, 
  Plus,
  Youtube,
  PenTool,
  Instagram,
  Lightbulb,
  Menu,
  X,
  Shield,
  Info,
  Loader2,
  Play,
  Hexagon,
  Circle,
  AlertTriangle,
  Mail,
  Coins,
  Copy,
  Check
} from 'lucide-react';

const SYSTEM_PROMPT = `
You are Scribo AI — a world-class creative partner and content strategist.

GLOBAL QUALITY STANDARDS:
- Match user's language automatically (English, Bengali, or Mixed)
- Tone: Warm, creative bestfriend, professional yet accessible
- No robotic or textbook language. Use "you", not "the user".
- NO markdown bold (**), NO hashtags (#), NO [HIGHLIGHT] tags.
- Use emojis naturally but sparingly.
- Formatting: Proper spacing, numbers for lists (no bullets).
- Quality Check: Is this the BEST version? Would a pro be impressed?

IMPORTANT: You must ALWAYS output your response in one of the following EXACT formats. Do not deviate.

For Story:
HOOK: [2 line friendly opening]
---STORY---
[Story Content - Target 9.5/10 Quality]
Structure:
1. Hook (Drop into action)
2. World/Character build (Sensory details: smell, sound, touch)
3. Escalating tension (Short sentences)
4. Twist/Revelation (Earned, not random)
5. Gut-punch ending (Unforgettable)
Rules:
- Show, don't tell emotions ("Hands shaking" not "He was scared")
- Unique character voices
- Cinematic pacing
---END---
CTA: [closing line]

For Script:
HOOK: [opening]
---SCRIPT---
[Script Content - Target 9.5/10 Quality]
Format: Proper Screenplay (INT./EXT., Centered Names, Present Tense Action)
Structure:
1. Cold Open (Grab attention in 3s)
2. Act 1 (Setup world/problem)
3. Act 2 (Escalate/Twist)
4. Act 3 (Surprising Resolution)
Rules:
- Visual storytelling (Show don't tell)
- Subtext in dialogue (Say one thing, mean another)
- Sound design notes (SOUND:)
- Real speech patterns (fragments, interruptions)
---END---
CTA: [closing]

For Image Prompt:
HOOK: [opening]
---PROMPT---
[Prompt Content - Target 9.8/10 Quality]
Formula: [Style], [camera angle] of [subject] [doing action] in [setting], [lighting], [mood], [color palette], [technical specs], [atmosphere]
Must Include: Subject, Action, Setting, Lighting, Camera, Style, Mood, Technical (8K), Color, Atmosphere.
Example: "Hyper-realistic cinematic photograph, low-angle shot of a lone astronaut standing on a cracked desert floor, arms outstretched toward a sky filled with two setting suns, dramatic golden and crimson lighting, dust particles floating in the air, sense of epic solitude and wonder, ultra-detailed spacesuit texture, 8K resolution, anamorphic lens flare, shot on IMAX"
---END---
CTA: [closing with Image Studio mention]

For Video Prompt:
HOOK: [opening]
---VIDEO---
[Video Prompt Content - Target 9.8/10 Quality]
Include: Camera movement, scene description, lighting, mood, technical specs.
---END---
CTA: [closing]

For General Chat / Questions / Content Advice:
[Provide answer in plain text]
Quality Target 9.8/10:
- Specific actionable steps (No vague tips like "post consistently")
- Real platform knowledge (YouTube algorithms, specific metrics like CTR/AVD)
- Mention specific free tools by name
- Give real examples/case studies
Structure:
1. Validate problem (Empathetic 1-liner)
2. Root cause (Specific)
3. 3-5 Numbered Fixes (Exact steps + Tool/Resource)
4. "Why" it works
5. End with: "What's your niche? Tell me and I'll make this specific to you"

When user asks for resources or assets, provide real verified links like this:

"Here are some great free resources 🎯

🎵 Free Music:
• Pixabay Music → pixabay.com/music
• YouTube Audio Library → studio.youtube.com
• Mixkit → mixkit.co/free-music

🖼️ Free Images:
• Unsplash → unsplash.com
• Pexels → pexels.com
• Pixabay → pixabay.com

🎬 Video Tools:
• CapCut → capcut.com
• Canva → canva.com
• DaVinci Resolve → blackmagicdesign.com"
`;

function cleanAndRender(rawText: string) {
  return rawText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#+\s/gm, '')
    .trim();
}

function makeLinksClickable(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+|[a-z]+\.[a-z]{2,}\/[^\s]*)/gi;
  return text.replace(urlRegex, (url) => {
    const href = url.startsWith('http') 
      ? url : 'https://' + url;
    return `<a href="${href}" 
      target="_blank" 
      style="color:#FF8C32;
             text-decoration:underline;
             font-weight:600">
      ${url}
    </a>`;
  });
}

function detectType(text: string) {
  // Not used in new logic, but kept for safety or removed if unused.
  // We will parse markers instead.
  return 'GENERAL'; 
}

// ... (interfaces remain similar, but we use Chat from service)

interface ChatStudioProps {
  user: User;
  onNavigateImage: () => void;
  onNavigateAbout: () => void;
  onNavigateContact: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activePage: 'chat' | 'history';
  setActivePage: (page: 'chat' | 'history') => void;
  newChatTrigger: number;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  images?: string[];
  isThinking?: boolean;
}

interface UploadedImage {
  file: File;
  base64: string;
  name: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  images?: string[];
  isThinking?: boolean;
}

interface UploadedImage {
  file: File;
  base64: string;
  name: string;
}

const StreamingText = ({ text, className = "", withOrange = false }: { text: string, className?: string, withOrange?: boolean }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Safety: If text is too long, show instantly to prevent memory crash
    if (text.length > 3000) {
      setDisplayedText(text);
      setIsAnimating(false);
      return;
    }

    let index = 0;
    // Split into chunks of ~20 chars for smoother performance than word-by-word
    const chunks = text.match(/.{1,20}/g) || [text];
    let currentText = '';
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;

    setIsAnimating(true);
    setDisplayedText(''); // Clear previous

    const animate = () => {
      if (index >= chunks.length) {
        setIsAnimating(false);
        return;
      }
      
      currentText += chunks[index];
      setDisplayedText(currentText);
      index++;
      
      // Use requestAnimationFrame for performance
      animationFrameId = requestAnimationFrame(() => {
        // Add small delay to control speed (15ms)
        timeoutId = setTimeout(animate, 15);
      });
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
      setIsAnimating(false);
    };
  }, [text]);

  // Separate effect for smooth scrolling - throttled to prevent shaking
  useEffect(() => {
    if (!isAnimating) return;

    const chatBox = document.getElementById('chat-area-viewport');
    if (!chatBox) return;

    const scrollInterval = setInterval(() => {
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
      });
    }, 500); // Scroll every 500ms, not every frame

    return () => clearInterval(scrollInterval);
  }, [isAnimating]);
  
  const renderFormattedText = (textToRender: string) => {
    // Apply link formatting to the displayed text
    const linkedText = makeLinksClickable(textToRender);

    if (!withOrange) {
      return <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: linkedText }} />;
    }
    
    const sentences = textToRender.split(/(?<=[.!?])\s+/);
    return sentences.map((sentence, index) => {
      if (!sentence) return null;
      const isOrange = index % 3 === 1;
      const linkedSentence = makeLinksClickable(sentence);
      
      return (
        <p key={index} style={{
          marginBottom: '10px',
          lineHeight: 1.8,
          color: isOrange ? '#FF8C32' : '#1a1a1a',
          fontWeight: isOrange ? '600' : '400',
          whiteSpace: 'pre-wrap'
        }} dangerouslySetInnerHTML={{ __html: linkedSentence }} />
      );
    });
  };

  return (
    <div className={`ai-message ${className}`}>
      {renderFormattedText(displayedText)}
    </div>
  );
};

const renderAIMessage = (text: string) => {
  const clean = cleanAndRender(text);

  // Detect markers
  const types = {
    'STORY': { 
      icon: '📖', 
      label: 'STORY',
      regex: /---STORY---([\s\S]*?)---END---/
    },
    'SCRIPT': { 
      icon: '🎬', 
      label: 'SCRIPT',
      regex: /---SCRIPT---([\s\S]*?)---END---/
    },
    'PROMPT': { 
      icon: '✍️', 
      label: 'IMAGE PROMPT',
      regex: /---PROMPT---([\s\S]*?)---END---/
    },
    'VIDEO': { 
      icon: '🎥', 
      label: 'VIDEO PROMPT',
      regex: /---VIDEO---([\s\S]*?)---END---/
    }
  };

  for (const [type, config] of Object.entries(types)) {
    const match = clean.match(config.regex);
    if (match) {
      const hookMatch = clean.match(/HOOK:\s*(.*?)(?=---)/s);
      const ctaMatch = clean.match(/CTA:\s*(.*?)$/s);
      
      const hook = hookMatch ? hookMatch[1].trim() : '';
      const main = match[1].trim();
      const cta = ctaMatch ? ctaMatch[1].trim() : '';
      
      return (
        <div className="ai-wrap">
          {/* HOOK OUTSIDE CARD */}
          {hook && (
            <div className="hook-text">
              <StreamingText text={hook} withOrange={true} />
            </div>
          )}

          {/* CARD STARTS HERE */}
          <ResponseCard 
            content={main} 
            type={type as 'STORY' | 'SCRIPT' | 'PROMPT' | 'VIDEO'} 
            icon={config.icon}
            label={config.label}
          />

          {/* CTA OUTSIDE CARD */}
          {cta && (
            <div className="cta-text">
              <StreamingText text={cta} withOrange={true} />
            </div>
          )}
        </div>
      );
    }
  }

  // General response - plain text
  return (
    <div className="general-text">
      <StreamingText text={clean} withOrange={true} />
    </div>
  );
};

const ResponseCard = ({ 
  content, 
  type, 
  icon, 
  label 
}: { 
  content: string, 
  type: 'STORY' | 'SCRIPT' | 'PROMPT' | 'VIDEO',
  icon: string,
  label: string
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (text: string) => {
    const sections = text.split('\n');
    return sections
      .filter(l => l.trim())
      .map((line, i) => (
        <div key={i} className="mb-3 last:mb-0">
          <StreamingText text={line.trim()} />
        </div>
      ));
  };

  const getHeaderTitle = () => {
    if (type === 'STORY') return 'THE STORY';
    if (type === 'SCRIPT') return 'THE SCRIPT';
    if (type === 'PROMPT') return 'YOUR PROMPT';
    return 'VIDEO PROMPT';
  };

  return (
    <div className="content-card">
      
      <div className="card-top">
        <span className="card-pill">
          ✦ {label}
        </span>
        <button 
          className="copy-pill" 
          onClick={handleCopy}
          style={copied ? { background: '#FF8C32', color: 'white', borderColor: '#FF8C32' } : {}}
        >
          {copied ? '✅ Copied!' : '📋 Copy'}
        </button>
      </div>

      <div className="divider"></div>
      
      <p className="content-header">
        {icon} {getHeaderTitle()}
      </p>
      
      <div className="divider"></div>

      <div className="main-body">
        {renderContent(content)}
      </div>

    </div>
  );
};

export default function ChatStudio({
  user,
  onNavigateImage,
  onNavigateAbout,
  onNavigateContact,
  sidebarOpen,
  setSidebarOpen,
  activePage,
  setActivePage,
  newChatTrigger,
  messages,
  setMessages
}: ChatStudioProps) {
  // UI State
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showShortcutHint, setShowShortcutHint] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [typedName, setTypedName] = useState("");
  
  // Chat State
  const [input, setInput] = useState("");
  const [currentChatSaved, setCurrentChatSaved] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [thinkingText, setThinkingText] = useState("✨ Scribo is thinking...");
  const thinkingMessages = [
    "✨ Scribo is thinking...",
    "🎨 Crafting your response...",
    "💡 Almost ready...",
    "⚡ Putting it together...",
    "🔥 Making it perfect..."
  ];

  useEffect(() => {
    if (!isThinking) return;
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % thinkingMessages.length;
      setThinkingText(thinkingMessages[msgIndex]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isThinking]);

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]); // For Gemini context
  
  // States for voice
  const [isRecording, setIsRecording] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeText, setWelcomeText] = useState("");

  // States for Chat History
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);

  // Charm System State
  const [charms, setCharms] = useState(11);
  const [showCharmModal, setShowCharmModal] = useState(false);
  const [showAdScreen, setShowAdScreen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(7);
  const [adReady, setAdReady] = useState(false);

  const generateTitle = (message: string) => {
    return message.substring(0, 35);
  };

  useEffect(() => {
    if (!user?.uid) return;

    const init = async () => {
      const data = await loadUserData(user.uid);
      // Fix NaN bug
      const raw = data?.charms;
      const safe = (!raw || isNaN(Number(raw))) 
        ? 11 
        : Number(raw);
      setCharms(safe);
      // Save valid charms back
      if (isNaN(data.charms)) {
        saveCharms(user.uid, 11);
      }
      
      // Cleanup old chats and load history
      chatService.cleanupOldChats(user.uid);
      loadChats();
    };

    init();
  }, [user?.uid]);

  const loadChats = () => {
    setIsLoadingChats(true);
    setLoading(true);
    
    // Fallback timeout to prevent infinite loading (2 seconds max as requested)
    const timeoutId = setTimeout(() => {
      setIsLoadingChats(false);
      setLoading(false);
    }, 2000);

    try {
      const chats = chatService.loadChatHistory();
      setChatList(chats || []);
    } catch (error) {
      console.error("Failed to load chats:", error);
      setChatList([]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoadingChats(false);
      setLoading(false);
    }
  };

  const startChatSession = (firstMessage: string) => {
    try {
      const title = generateTitle(firstMessage);
      const id = chatService.saveCurrentChat([{
        role: 'user',
        content: firstMessage
      }], null);
      
      setCurrentSessionId(id);
      loadChats();
      return id;
    } catch (error) {
      console.error("Failed to start chat:", error);
      return null;
    }
  };

  const saveMessage = (role: 'user' | 'ai', content: string, sessionId: string | null) => {
    if (!sessionId) return;
    try {
      const currentMessages: Message[] = [
        ...messages,
        { role: role === 'user' ? 'user' : 'model', text: content }
      ];
      chatService.saveCurrentChat(currentMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      })), sessionId);
      loadChats();
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  };

  const onNewChatClick = () => {
    if (messages.length > 0) {
      chatService.saveCurrentChat(messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      })), currentSessionId);
    }
    setCurrentSessionId(Date.now().toString());
    setMessages([]);
    setChatHistory([]);
    setActivePage('chat');
    loadChats();
  };

  const startAdCountdown = () => {
    setShowCharmModal(false);
    setShowAdScreen(true);
    setAdCountdown(7);
    
    const timer = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const newCharms = charms + 1;
          setCharms(newCharms);
          if (user?.uid) saveCharms(user.uid, newCharms);
          setShowAdScreen(false);
          showToast('🎉 +1 Charm added! Keep creating!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (newChatTrigger > 0) {
      onNewChatClick();
    }
  }, [newChatTrigger]);

  // DELETE SINGLE CHAT
  const deleteChat = (chatId: string, event: React.MouseEvent) => {
    // Stop event bubbling - CRITICAL
    event.stopPropagation();
    event.preventDefault();
    
    try {
      // Read from localStorage
      const raw = localStorage.getItem('scribo_chats');
      const allChats = raw ? JSON.parse(raw) : [];
      
      // Filter out deleted chat
      const remaining = allChats.filter(
        (chat: any) => String(chat.id) !== String(chatId)
      );
      
      // Save back to localStorage
      localStorage.setItem(
        'scribo_chats', 
        JSON.stringify(remaining)
      );
      
      // Update React state immediately
      setChatList([...remaining]);
      
      console.log('Deleted chat:', chatId);
      console.log('Remaining chats:', remaining.length);
      
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const getTimeAgo = (timestamp: any) => {
    // timestamp might be Firestore Timestamp or Date or number
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours/24)}d ago`;
  };

  const loadChatSession = (sessionId: string) => {
    const session = chatList.find(s => s.id === sessionId);
    if (!session) return;
    
    setCurrentSessionId(sessionId);
    setActivePage('chat');
    
    // Restore history for Gemini
    // Firestore stores as 'user' | 'assistant'
    // Gemini needs 'user' | 'model'
    const restoredHistory = session.messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    setChatHistory(restoredHistory);
    
    // Restore messages for UI
    const restoredMessages: Message[] = session.messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      text: m.content
    }));
    setMessages(restoredMessages);
    
    showToast('✅ Chat restored! Continue where you left off 🚀');
  };

  // Constants
  const MAX_MEMORY = 40;

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  // Create a ref for the AI instance to avoid re-initializing on every render
  // and to handle the case where the key might be missing
  const aiRef = useRef<GoogleGenAI | null>(null);
  
  if (!aiRef.current && API_KEY) {
    try {
      aiRef.current = new GoogleGenAI({ apiKey: API_KEY });
    } catch (e) {
      console.error("Failed to initialize Gemini:", e);
    }
  }

  // Time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setGreeting("Good Morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17 && hour < 21) setGreeting("Good Evening");
    else setGreeting("Working Late");
  }, []);

  // Welcome Banner Logic
  useEffect(() => {
    const hour = new Date().getHours();
    let greetingStr = '';
    if (hour >= 5 && hour < 12) greetingStr = 'Good Morning';
    else if (hour >= 12 && hour < 17) greetingStr = 'Good Afternoon';
    else if (hour >= 17 && hour < 21) greetingStr = 'Good Evening';
    else greetingStr = 'Working Late';
    
    const firstName = user.name.split(' ')[0];
    setWelcomeText(`${greetingStr}, ${firstName}! Ready to create something amazing today? ✨`);
    
    setTimeout(() => {
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 4000);
    }, 500);

    // Typewriter effect for greeting
    const fullGreeting = `${greeting}, ${firstName}! 👋`;
    let i = 0;
    const interval = setInterval(() => {
      setTypedName(fullGreeting.slice(0, i + 1));
      i++;
      if (i === fullGreeting.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [user.name, greeting]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Mobile viewport fix
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const height = window.visualViewport.height;
        document.getElementById('chat-studio-page')!.style.height = `${height}px`;
      }
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // Thinking text cycle
  // REMOVED DUPLICATE EFFECT
  // useEffect(() => {
  //   if (!isThinking) return;
  //   const states = ["Thinking", "Analyzing", "Creating", "Crafting response", "Almost ready"];
  //   let i = 0;
  //   const interval = setInterval(() => {
  //     i = (i + 1) % states.length;
  //     setThinkingText(states[i]);
  //   }, 1200);
  //   return () => clearInterval(interval);
  // }, [isThinking]);

  // New Chat Trigger
  useEffect(() => {
    if (newChatTrigger > 0) {
      handleNewChat();
    }
  }, [newChatTrigger]);

  // Shortcut hint timer
  useEffect(() => {
    const timer = setTimeout(() => setShowShortcutHint(true), 3000);
    const hideTimer = setTimeout(() => setShowShortcutHint(false), 9000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Scroll Reveal Trigger
  useEffect(() => {
    if (activePage === 'history') {
      loadChats();
    }
  }, [activePage, user?.uid]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-save on unmount or update - REMOVED as we save incrementally
  // useEffect(() => {
  //   return () => {
  //     if (user?.uid && messages.length >= 2) {
  //       saveCurrentChat();
  //     }
  //   };
  // }, [messages, user]);

  async function handleNewChat() {
    if (user?.uid) {
      await loadChats();
    }
    setMessages([]);
    setChatHistory([]);
    setCurrentSessionId(null);
    setCurrentChatSaved(false);
    showToast('✨ New chat started!');
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (uploadedImages.length + files.length > 5) {
        showToast('⚠️ Maximum 5 images per message');
        return;
      }
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImages(prev => [...prev, {
            file,
            base64: e.target?.result as string,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMicPressStart = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Error handling
      return;
    }

    // Kill any existing
    if (recognitionRef.current) {
      try { 
        recognitionRef.current.abort(); 
      } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let collectedText = '';

    recognition.onstart = () => {
      setIsRecording(true);
      setIsConverting(false);
      collectedText = '';
      navigator.vibrate?.([25]);
    };

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; 
           i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          collectedText += 
            event.results[i][0].transcript + ' ';
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      if (event.error === 'aborted') return;
      setIsRecording(false);
      setIsConverting(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (collectedText.trim()) {
        setIsConverting(true); // Start converting UI
        
        // Simulate processing delay or just set immediately if instant
        // But per request: textReady -> setIsConverting(false)
        
        setInput(prev => {
          const trimmed = collectedText.trim();
          return prev 
            ? prev + ' ' + trimmed 
            : trimmed;
        });
        
        // Text is ready, hide converting immediately
        setIsConverting(false);
        
        navigator.vibrate?.([15, 10, 25]);
      } else {
        setIsConverting(false);
      }
    };

    try {
      recognition.start();
    } catch(e) {
      setIsConverting(false);
    }
  };

  const handleMicPressEnd = () => {
    if (!recognitionRef.current) return;
    // Stop recording, which triggers onend -> setIsConverting(true)
    try {
      recognitionRef.current.stop();
    } catch(e) {}
    
    // Safety timeout
    setTimeout(() => {
      setIsConverting(false);
    }, 5000);
  };

  const sendMessageToGemini = async (userMsg: string, images: UploadedImage[], retryCount = 0): Promise<string> => {
    // Prepare history
    let history = [...chatHistory];
    
    // Add user message to history
    const userParts: any[] = [];
    images.forEach(img => {
      userParts.push({
        inlineData: {
          mimeType: img.file.type,
          data: img.base64.split(',')[1]
        }
      });
    });
    userParts.push({ text: userMsg });
    
    history.push({ role: "user", parts: userParts });

    // Trim history if too long (keep last MAX_MEMORY)
    if (history.length > MAX_MEMORY) {
      history = history.slice(-MAX_MEMORY);
    }

    setChatHistory(history);

    try {
      // Create a promise that rejects after 30 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 30000);
      });

      if (!aiRef.current) throw new Error("AI instance not initialized");

      const apiPromise = aiRef.current.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: history,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      const aiText = response.text;
      
      if (!aiText) throw new Error("No response text");

      // Add AI response to history
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: aiText }] }]);
      
      return aiText;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      if (error.message === 'TIMEOUT' || error.message?.includes('network')) {
        if (retryCount < 2) {
          console.log(`Retrying... Attempt ${retryCount + 1}`);
          return sendMessageToGemini(userMsg, images, retryCount + 1);
        }
        return "Let me try again... (Connection timed out) 🔄";
      }

      // If it's a general error, also retry once
      if (retryCount < 1) {
        return sendMessageToGemini(userMsg, images, retryCount + 1);
      }

      // Remove failed user message from history
      setChatHistory(prev => prev.slice(0, -1));
      return "Oops, something broke! Try again? 🔄";
    }
  };

  // Helper to strip HTML
  const stripHTML = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSend = async () => {
    if (isSending || isThinking) return;
    const msgText = input.trim();
    if (!msgText && uploadedImages.length === 0) return;

    setIsSending(true);

    // 0. Check API Key
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!API_KEY || !aiRef.current) {
      console.error('Gemini API key missing!');
      showToast('❌ Configuration Error: Gemini API key is missing.');
      setIsSending(false);
      return;
    }

    // Check charms
    if (user?.uid) {
      if (charms <= 0) {
        setShowCharmModal(true);
        setIsSending(false);
        return;
      }
      // Deduct 1 charm
      const newCharms = Math.max(0, (isNaN(charms) ? 11 : charms) - 1);
      setCharms(newCharms);
      if (user?.uid) saveCharms(user.uid, newCharms);
    }

    // 1. Add user message
    const newMsg: Message = {
      role: 'user',
      text: msgText,
      images: uploadedImages.map(img => img.base64)
    };
    setMessages(prev => [...prev, newMsg]);
    
    let activeSessionId = currentSessionId;
    if (messages.length === 0) {
      activeSessionId = startChatSession(msgText || "Image Upload");
    } else {
      saveMessage('user', msgText || "Image Upload", activeSessionId);
    }
    
    // 2. Clear input
    setInput("");
    const currentImages = [...uploadedImages];
    setUploadedImages([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // 3. Show thinking
    setIsThinking(true);

    try {
      // 4. Call API
      const rawAiResponse = await sendMessageToGemini(msgText, currentImages);
      const aiResponse = cleanAndRender(rawAiResponse);

      // 5. Add AI message
      setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
      saveMessage('ai', stripHTML(aiResponse), activeSessionId);
    } catch (error) {
      console.error("Send Error:", error);
      showToast("❌ Something went wrong. Please try again.");
    } finally {
      setIsThinking(false);
      setIsSending(false);
    }
  };

  // Ad countdown logic removed - handled in startAdCountdown function

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChipClick = (text: string) => {
    let fillText = "";
    if (text === "Write a YouTube Script") fillText = "Write a YouTube script about ";
    else if (text === "Build a Prompt") fillText = "Build me an AI prompt for ";
    else if (text === "Instagram Captions") fillText = "Write Instagram captions for ";
    else if (text === "Brainstorm Ideas") fillText = "Help me brainstorm ideas about ";
    
    setInput(fillText);
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Trigger resize
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
      }, 0);
    }
  };

  return (
    <motion.div 
      id="chat-studio-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[10000] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFF8F4 0%, #FFF0E6 25%, #FFF5EC 50%, #FFF8F4 75%, #FFFAF7 100%)',
        width: '100%',
        maxWidth: '100vw',
        height: '100dvh', // Use dvh for mobile browsers
        overflowX: 'hidden'
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]" 
        style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      
      {/* Header */}
<header style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  height: 58,
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: 'rgba(255,255,255,0.96)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(0,0,0,0.05)',
  boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
  width: '100%',
  maxWidth: '100vw'
}}>

  {/* LEFT: Burger */}
  <button
    onClick={() => setSidebarOpen(true)}
    style={{
      width: 38, height: 38,
      borderRadius: 11,
      background: 'rgba(0,0,0,0.05)',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4.5,
      flexShrink: 0,
      padding: 0
    }}
  >
    {[0,1,2].map(i => (
      <div key={i} style={{
        width: i === 1 ? 14 : 18,
        height: 2,
        borderRadius: 2,
        background: '#333',
        transition: 'all 0.2s'
      }}/>
    ))}
  </button>

  {/* CENTER: Logo + Name — absolutely centered */}
  <div style={{
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    pointerEvents: 'none'
  }}>
    <img
      src="/logo.png"
      alt="Scribo AI"
      style={{
        width: 28,
        height: 28,
        objectFit: 'contain',
        borderRadius: 8
      }}
      onError={(e) => {
        (e.target as HTMLImageElement)
          .style.display = 'none';
      }}
    />
    <span style={{
      fontWeight: 800,
      fontSize: 17,
      color: '#FF9A6C',
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
      letterSpacing: 0.2
    }}>Scribo AI</span>
  </div>

  {/* RIGHT: Charm badge */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 12px',
    background: (isNaN(charms) ? 11 : charms) > 3
      ? 'rgba(255,154,108,0.1)'
      : 'rgba(239,68,68,0.08)',
    border: `1px solid ${
      (isNaN(charms) ? 11 : charms) > 3
        ? 'rgba(255,154,108,0.28)'
        : 'rgba(239,68,68,0.25)'
    }`,
    borderRadius: 50,
    flexShrink: 0,
    transition: 'all 0.3s ease'
  }}>
    <svg width="13" height="13"
      viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 9l10 13L22 9z"
        fill={
          (isNaN(charms) ? 11 : charms) > 3
            ? '#FF9A6C'
            : '#EF4444'
        }
      />
    </svg>
    <span style={{
      fontSize: 13,
      fontWeight: 800,
      color: (isNaN(charms) ? 11 : charms) > 3
        ? '#FF9A6C' : '#EF4444',
      fontFamily: 'Inter, sans-serif',
      lineHeight: 1
    }}>
      {isNaN(charms) || !charms ? 11 : charms}
    </span>
    <span style={{
      fontSize: 9,
      fontWeight: 700,
      color: (isNaN(charms) ? 11 : charms) > 3
        ? 'rgba(255,154,108,0.65)'
        : 'rgba(239,68,68,0.65)',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      fontFamily: 'Inter, sans-serif'
    }}>CHARMS</span>
    {(isNaN(charms) ? 11 : charms) <= 3 && 
     (isNaN(charms) ? 11 : charms) > 0 && (
      <div style={{
        width: 5, height: 5,
        borderRadius: '50%',
        background: '#EF4444',
        animation: 'blink 1s ease infinite'
      }}/>
    )}
  </div>

</header>

      {/* Welcome Banner */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            id="welcome-banner"
            initial={{ maxHeight: 0, opacity: 0, padding: 0 }}
            animate={{ maxHeight: 60, opacity: 1, padding: '10px 20px' }}
            exit={{ maxHeight: 0, opacity: 0, padding: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-[rgba(255,154,108,0.15)] to-[rgba(255,200,122,0.15)] border-b border-[rgba(255,154,108,0.2)] overflow-hidden sticky top-[60px] z-[49]"
          >
            <span className="text-base">👋</span>
            <span id="welcome-banner-text" className="font-display text-sm font-semibold text-[#FF9A6C] tracking-[0.3px]">
              {welcomeText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activePage === 'chat' ? (
          <motion.div 
            key="chat-page"
            id="chat-studio-page-content"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.98 }}
            transition={{ 
              duration: 0.45, 
              ease: [0.23, 1, 0.32, 1]
            }}
            className="flex-1 flex flex-col overflow-hidden relative"
          >
            {/* Main Chat Area */}
      <div 
        id="chat-area-viewport"
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative z-10"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <style>{`
          @keyframes fadeUp {
            from { 
              opacity: 0; 
              transform: translateY(8px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          .ai-message {
            opacity: 0;
            animation: fadeUp 0.3s ease forwards;
          }
          
          /* Premium Response Layout CSS */
          .content-card {
            background: linear-gradient(135deg,
              rgba(255,140,50,0.12),
              rgba(255,160,80,0.04));
            border-left: 4px solid #FF8C32;
            border-radius: 16px;
            padding: 18px 20px;
            margin: 12px 0;
            width: 100%;
          }

          .card-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }

          .card-pill {
            background: #FF8C32;
            color: white;
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
          }

          .copy-pill {
            background: white;
            color: #FF8C32;
            border: 1.5px solid #FF8C32;
            border-radius: 20px;
            padding: 5px 14px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .copy-pill:active {
            background: #FF8C32;
            color: white;
          }

          .hook-text {
            color: #1a1a1a;
            font-size: 15px;
            line-height: 1.8;
            margin-bottom: 12px;
          }

          .divider {
            height: 1px;
            background: rgba(255,140,50,0.3);
            margin: 12px 0;
          }

          .content-header {
            color: #FF8C32;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.5px;
            margin: 8px 0;
          }

          .main-body p {
            color: #1a1a1a;
            font-size: 15px;
            line-height: 1.85;
            margin-bottom: 12px;
          }

          .cta-text {
            color: #555;
            font-size: 14px;
            line-height: 1.8;
            margin-top: 10px;
            padding: 0 4px;
          }
        `}</style>
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="min-h-full flex flex-col items-center justify-center p-6 text-center anim-slideUp delay-1">
            <style>{`
              @keyframes logoPulse {
                0%, 100% {
                  transform: scale(1) translateY(0px);
                  filter: drop-shadow(
                    0 8px 20px rgba(255,154,108,0.3)
                  );
                }
                50% {
                  transform: scale(1.07) translateY(-4px);
                  filter: drop-shadow(
                    0 14px 30px rgba(255,154,108,0.5)
                  );
                }
              }
            `}</style>
            <div style={{
              width: 88,
              height: 88,
              marginBottom: 24,
              animation: 'logoPulse 3s ease-in-out infinite'
            }}>
            <svg viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              style={{width:'100%',height:'100%'}}
            >
              <defs>
                <radialGradient id="g1" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFE0C0"/>
                  <stop offset="50%" stopColor="#FFAA72"/>
                  <stop offset="100%" stopColor="#FF8C50"/>
                </radialGradient>
                <radialGradient id="g2" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FFD4A8"/>
                  <stop offset="100%" stopColor="#FF9A6C"/>
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feComposite in="SourceGraphic" in2="blur" 
                    operator="over"/>
                </filter>
              </defs>

              {/* Left small cloud bump */}
              <ellipse cx="62" cy="118" rx="38" ry="34"
                fill="url(#g2)" opacity="0.92"/>

              {/* Right small cloud bump */}
              <ellipse cx="138" cy="122" rx="34" ry="30"
                fill="url(#g2)" opacity="0.88"/>

              {/* Bottom cloud base */}
              <ellipse cx="100" cy="135" rx="72" ry="38"
                fill="url(#g1)"/>

              {/* Main top cloud dome */}
              <ellipse cx="100" cy="90" rx="50" ry="50"
                fill="url(#g1)"/>

              {/* Left top dome */}
              <ellipse cx="62" cy="100" rx="36" ry="36"
                fill="url(#g2)" opacity="0.95"/>

              {/* Swirl outer */}
              <circle cx="105" cy="95" r="40"
                fill="none"
                stroke="white"
                strokeWidth="7"
                strokeOpacity="0.65"
                strokeLinecap="round"
                strokeDasharray="180 70"
                transform="rotate(-30 105 95)"
              />

              {/* Swirl middle */}
              <circle cx="105" cy="95" r="27"
                fill="none"
                stroke="white"
                strokeWidth="5.5"
                strokeOpacity="0.55"
                strokeLinecap="round"
                strokeDasharray="120 45"
                transform="rotate(20 105 95)"
              />

              {/* Swirl inner */}
              <circle cx="105" cy="95" r="16"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeOpacity="0.5"
                strokeLinecap="round"
                strokeDasharray="65 28"
                transform="rotate(80 105 95)"
              />

              {/* Center glow */}
              <circle cx="105" cy="95" r="8"
                fill="white" opacity="0.9"
                filter="url(#glow)"
              />

              {/* Center dot */}
              <circle cx="105" cy="95" r="4"
                fill="white"
              />
            </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-[var(--text-dark)] mb-3 min-h-[1.2em]">
              {typedName}
            </h1>
            
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="text-[var(--text-mid)] text-lg mb-10 font-sans"
            >
              What would you like to create today?
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
              {[
                { 
                  icon: Play, 
                  title: "Write a YouTube Script", 
                  desc: "Hooks, intros, full scripts",
                  grad: "from-[#FF9A6C] to-[#FFC87A]" 
                },
                { 
                  icon: Hexagon, 
                  title: "Build a Prompt", 
                  desc: "Engineer perfect AI prompts",
                  grad: "from-[#A78BFA] to-[#8B5CF6]" 
                },
                { 
                  icon: Circle, 
                  title: "Instagram Captions", 
                  desc: "Viral captions & hashtags",
                  grad: "from-[#F472B6] to-[#EC4899]" 
                },
                { 
                  icon: Lightbulb, 
                  title: "Brainstorm Ideas", 
                  desc: "Unlock creative possibilities",
                  grad: "from-[#34D399] to-[#10B981]" 
                }
              ].map((item, i) => (
                <SoundButton
                  key={i}
                  soundType="click"
                  onClick={() => handleChipClick(item.title)}
                  className={`flex items-center gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-md border-[1.5px] border-[rgba(255,154,108,0.2)] hover:-translate-y-1 hover:border-[rgba(255,154,108,0.4)] hover:shadow-[0_8px_24px_rgba(255,154,108,0.15)] transition-all text-left group anim-popIn delay-${i+1}`}
                >
                  <div className={`w-9 h-9 rounded-[10px] bg-gradient-to-br ${item.grad} flex items-center justify-center text-white shadow-sm shrink-0`}>
                    <item.icon size={16} fill="currentColor" className="opacity-90" />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-dark)] text-sm mb-0.5">{item.title}</div>
                    <div className="text-xs text-[var(--text-light)]">{item.desc}</div>
                  </div>
                </SoundButton>
              ))}
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="p-5 md:p-8 flex flex-col gap-6 max-w-4xl mx-auto pb-32 w-full">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  x: msg.role === 'user' ? 40 : -40,
                  y: msg.role === 'model' ? 20 : 0 
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  y: 0
                }}
                transition={{ 
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                  delay: i === messages.length - 1 ? 0 : 0 // Only animate last message if needed? No, all messages on load too.
                }}
                className={`flex gap-3 ${msg.role === 'user' ? 'self-end max-w-[90%]' : 'self-start w-full'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] flex items-center justify-center shrink-0 shadow-sm">
                    {/* Robot Face SVG */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <rect x="4" y="8" width="16" height="12" rx="2" />
                      <path d="M12 2v6" />
                      <circle cx="12" cy="2" r="1" fill="white" />
                      <path d="M9 14h.01" strokeLinecap="round" strokeWidth="3" />
                      <path d="M15 14h.01" strokeLinecap="round" strokeWidth="3" />
                    </svg>
                  </div>
                )}
                
                <div className={`
                  p-4 rounded-2xl shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] text-white rounded-tr-sm whitespace-pre-wrap max-w-[85%]' 
                    : 'bg-white/93 backdrop-blur-md border border-[rgba(255,154,108,0.15)] text-[var(--text-dark)] rounded-tl-sm flex-1 min-w-0 shadow-[0_2px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] p-6'}
                `}>
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {msg.images.map((img, idx) => (
                        <img key={idx} src={img} alt="Uploaded" className="w-20 h-20 object-cover rounded-lg border border-white/20" />
                      ))}
                    </div>
                  )}
                  {msg.role === 'user' ? (
                    <div className="text-[15px] leading-relaxed">{msg.text}</div>
                  ) : (
                    <>
                      <div className="text-[15px] leading-[1.75] text-[#1A1A2E] overflow-hidden max-w-full">
                        {renderAIMessage(msg.text)}
                      </div>

                    </>
                  )}
                </div>
              </motion.div>
            ))}

            {isThinking && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="self-start flex gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,154,108,0.4)] animate-pulse">
                  {/* Blinking Robot */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="4" y="8" width="16" height="12" rx="2" />
                    <path d="M12 2v6" />
                    <circle cx="12" cy="2" r="1" fill="white" />
                    <path d="M9 14h.01" strokeLinecap="round" strokeWidth="3" className="animate-pulse" />
                    <path d="M15 14h.01" strokeLinecap="round" strokeWidth="3" className="animate-pulse" />
                  </svg>
                </div>
                <div className="bg-white/90 backdrop-blur-md border border-[rgba(255,154,108,0.2)] rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-3 shadow-[0_4px_20px_rgba(255,154,108,0.1)]">
                  <span className="text-sm font-medium text-[#FF9A6C] animate-pulse">{thinkingText}</span>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#FF9A6C] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-1.5 bg-[#FF9A6C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-[#FF9A6C] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 md:p-6 z-20 sticky bottom-0 anim-fadeUp delay-2">
        <div className="max-w-[720px] mx-auto relative">
          
          {/* Image Preview */}
          <AnimatePresence>
            {uploadedImages.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-2 mb-2 flex-wrap bg-white/80 backdrop-blur-md p-2 rounded-xl border border-[rgba(255,154,108,0.15)]"
              >
                {uploadedImages.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 group">
                    <img 
                      src={img.base64} 
                      alt="preview" 
                      className="w-full h-full object-cover rounded-[10px] border border-[rgba(255,154,108,0.3)]" 
                    />
                    <button 
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <div className="text-[10px] text-[var(--text-light)] self-center ml-2">
                  {uploadedImages.length}/5
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            <div className={`
            group flex items-end gap-2 bg-white/90 backdrop-blur-[20px] border-[1.5px] rounded-[20px] p-3 pl-4 shadow-[0_4px_24px_rgba(255,154,108,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300
            ${isThinking ? 'border-[rgba(255,154,108,0.1)] opacity-80 pointer-events-none' : 'border-[rgba(255,154,108,0.2)] focus-within:border-[#FF9A6C] focus-within:shadow-[0_0_0_4px_rgba(255,154,108,0.1),0_4px_24px_rgba(255,154,108,0.15)]'}
          `}>
            {/* Left Actions */}
            <div className="flex gap-2 pb-1">
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                multiple 
                onChange={handleImageUpload} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 rounded-[10px] bg-[rgba(255,154,108,0.1)] hover:bg-[rgba(255,154,108,0.2)] hover:scale-105 flex items-center justify-center text-[#FF9A6C] transition-all"
                title="Upload Image"
              >
                <ImageIcon size={20} />
              </button>
              <button
                onMouseDown={handleMicPressStart}
                onMouseUp={handleMicPressEnd}
                onMouseLeave={handleMicPressEnd}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMicPressStart();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleMicPressEnd();
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  background: isRecording
                    ? 'rgba(239,68,68,0.12)'
                    : 'rgba(255,154,108,0.1)',
                  border: isRecording
                    ? '2px solid rgba(239,68,68,0.5)'
                    : '1.5px solid rgba(255,154,108,0.25)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  animation: isRecording
                    ? 'micPulse 0.8s ease infinite'
                    : 'none',
                  transform: isRecording 
                    ? 'scale(0.94)' 
                    : 'scale(1)'
                }}
              >
                <svg width="17" height="17" 
                  viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="2" width="6" height="12"
                    rx="3"
                    fill={isRecording ? '#EF4444' : '#FF9A6C'}
                  />
                  <path
                    d="M5 10c0 3.87 3.13 7 7 7s7-3.13 7-7"
                    stroke={isRecording ? '#EF4444' : '#FF9A6C'}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <line x1="12" y1="17" x2="12" y2="21"
                    stroke={isRecording ? '#EF4444' : '#FF9A6C'}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <line x1="8" y1="21" x2="16" y2="21"
                    stroke={isRecording ? '#EF4444' : '#FF9A6C'}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : "Ask Scribo AI anything..."}
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-[200px] min-h-[44px] py-2.5 px-1 text-[15px] text-[var(--text-dark)] placeholder:text-[rgba(150,150,170,0.7)] leading-relaxed"
              rows={1}
              disabled={isThinking}
            />
            
            {isConverting ? (
              <div className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] text-white font-bold text-xs flex items-center gap-2 shadow-md animate-pulse shrink-0">
                <Loader2 size={14} className="animate-spin" />
                Converting...
              </div>
            ) : (
              <SoundButton 
                soundType="send"
                onClick={handleSend}
                disabled={(!input.trim() && uploadedImages.length === 0) || isThinking || isSending}
                className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] text-white shadow-md transition-all shrink-0 ${
                  (input.trim() || uploadedImages.length > 0) && !isThinking && !isSending
                    ? 'opacity-100 shadow-[0_4px_12px_rgba(255,154,108,0.4)] hover:scale-105 hover:shadow-[0_6px_16px_rgba(255,154,108,0.5)] active:scale-95' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                {(isThinking || isSending) ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={input.trim() ? "ml-0.5" : ""} />}
              </SoundButton>
            )}
          </div>
          
<div style={{
  padding: '6px 16px 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5
}}>
  <svg width="11" height="11"
    viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10"
      stroke="rgba(0,0,0,0.2)"
      strokeWidth="2"/>
    <path d="M12 8v4M12 16h.01"
      stroke="rgba(0,0,0,0.2)"
      strokeWidth="2"
      strokeLinecap="round"/>
  </svg>
  <span style={{
    fontSize: 10,
    color: 'rgba(0,0,0,0.25)',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: 0.2,
    textAlign: 'center'
  }}>
    Scribo AI can make mistakes. 
    Please double-check important info.
  </span>
</div>

          {/* Shortcut Hint */}
          <AnimatePresence>
            {showShortcutHint && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-medium bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm"
              >
                Press Enter to send • Shift+Enter for new line
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-[var(--text-dark)] text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl whitespace-nowrap flex items-center gap-2 z-50"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Charm Refill Popup */}
          <AnimatePresence>
            {showCharmModal && (
              <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-orange-100"
                >
                  <div className="text-5xl mb-4">💎</div>
                  <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">You're out of Charms!</h3>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    Watch a short ad to get <span className="text-orange-500 font-bold">+1 Charm</span> and keep going!
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={startAdCountdown}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2"
                    >
                      Support & Continue 🎬
                    </button>
                    <button
                      onClick={() => setShowCharmModal(false)}
                      className="w-full py-4 text-gray-400 font-medium hover:text-gray-600 transition-colors"
                    >
                      Maybe Later
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Ad Screen */}
          <AnimatePresence>
            {showAdScreen && (
              <div className="fixed inset-0 z-[30000] flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-md flex flex-col items-center"
                >
                  {/* Placeholder Ad Banner */}
                  <div className="w-full aspect-video bg-black/40 rounded-3xl border-2 border-orange-500/30 flex flex-col items-center justify-center mb-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-orange-500/5 animate-pulse" />
                    <div className="text-orange-500 text-4xl mb-3">📢</div>
                    <div className="text-white font-bold text-lg mb-1">Ad Space</div>
                    <div className="text-white/40 text-sm">Support Scribo AI</div>
                  </div>

                  <div className="text-center">
                    <div className="text-6xl font-bold text-white mb-4 tabular-nums">
                      {adCountdown}
                    </div>
                    <p className="text-white/60 font-medium mb-2">Watching ad...</p>
                    <p className="text-orange-400 font-bold">Thank you for supporting Scribo AI 🧡</p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  ) : (
    <motion.div 
      key="history-page"
      id="chat-history-page-content"
            initial={{ opacity: 0, x: 40, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.98 }}
            transition={{ 
              duration: 0.45, 
              ease: [0.23, 1, 0.32, 1]
            }}
            className="flex-1 flex flex-col overflow-hidden relative"
          >
            {/* Navbar */}
            <nav className="flex items-center justify-between px-5 py-3 bg-white/85 backdrop-blur-[20px] border-b border-[rgba(255,154,108,0.15)] shrink-0">
              <button 
                onClick={onNewChatClick}
                className="flex items-center gap-2 text-[#FF9A6C] font-semibold text-sm hover:opacity-80 transition-opacity"
              >
                <Plus className="rotate-45" size={18} />
                Back to Chat
              </button>
              <h2 className="font-display font-bold text-base text-[#1A1A2E]">Chat History</h2>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9A6C] to-[#FFC87A] flex items-center justify-center text-white font-bold text-xs">
                {user.avatar}
              </div>
            </nav>

            {/* Content */}
                        <div className="flex-1 overflow-y-auto px-5 py-6 max-w-[800px] mx-auto w-full box-border">
              {loading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 200
                }}>
                  <div style={{
                    width: 32, height: 32,
                    border: '3px solid rgba(255,154,108,0.2)',
                    borderTopColor: '#FF9A6C',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}/>
                </div>
              ) : chatList.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: 48
                }}>
                  <div style={{fontSize: 48, marginBottom: 16}}>
                    💬
                  </div>
                  <h3 style={{
                    color: '#1A1A2E',
                    fontWeight: 700,
                    marginBottom: 8,
                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                  }}>No chats yet</h3>
                  <p style={{
                    color: '#999',
                    fontSize: 14,
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Your conversations will appear here
                  </p>
                  <button
                    onClick={() => setActivePage('chat')}
                    style={{
                      marginTop: 20,
                      padding: '12px 28px',
                      background: 'linear-gradient(135deg, #FF9A6C, #FFC87A)',
                      border: 'none',
                      borderRadius: 50,
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >Start Chatting</button>
                </div>
              ) : selectedChat ? (
                // Show selected conversation messages
                <div>
                  <button
                    onClick={() => setSelectedChat(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#FF9A6C',
                      fontWeight: 600,
                      marginBottom: 8
                    }}
                  >← Back to History</button>
                  
                  <div style={{padding: '0 16px'}}>
                    {selectedChat.messages.map(
                      (msg: any, i: number) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' 
                          ? 'flex-end' : 'flex-start',
                        marginBottom: 12
                      }}>
                        <div style={{
                          maxWidth: '80%',
                          padding: '12px 16px',
                          borderRadius: msg.role === 'user'
                            ? '18px 18px 4px 18px'
                            : '18px 18px 18px 4px',
                          background: msg.role === 'user'
                            ? 'linear-gradient(135deg, #FF9A6C, #FFC87A)'
                            : 'rgba(0,0,0,0.05)',
                          color: msg.role === 'user' 
                            ? 'white' : '#1A1A2E',
                          fontSize: 14,
                          fontFamily: 'Inter, sans-serif',
                          lineHeight: 1.6
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Show conversation list
                <div style={{padding: '0 16px'}}>
                  {chatList.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadChatSession(conv.id)}
                      style={{
                        padding: '16px',
                        background: 'white',
                        borderRadius: 16,
                        marginBottom: 10,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: 44, height: 44,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(255,154,108,0.15), rgba(255,200,122,0.1))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0
                      }}>💬</div>
                      
                      <div style={{flex: 1, overflow: 'hidden'}}>
                        <p style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: '#1A1A2E',
                          margin: '0 0 4px',
                          fontFamily: 'Inter, sans-serif',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{conv.title}</p>
                        <p style={{
                          fontSize: 11,
                          color: '#999',
                          margin: 0,
                          fontFamily: 'Inter, sans-serif'
                        }}>
                          {conv.messages.length} messages • {
                            new Date(conv.createdAt).toLocaleDateString() || 'Recently'
                          }
                        </p>
                      </div>
                      
                      <button
                        onClick={(e) => deleteChat(conv.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '8px',
                          zIndex: 10,
                          position: 'relative'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charm Modal */}
      <AnimatePresence>
      {showCharmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 420,
            background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 100%)',
            borderRadius: '28px 28px 0 0',
            padding: '8px 24px 36px',
            border: '1px solid rgba(255,154,108,0.15)',
            animation: 'slideUp 0.3s cubic-bezier(0.23,1,0.32,1)'
          }}>

            {/* Handle */}
            <div style={{
              width: 38, height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.12)',
              margin: '14px auto 24px'
            }}/>

            {/* Icon */}
            <div style={{
              width: 64, height: 64,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(255,154,108,0.2), rgba(255,200,122,0.1))',
              border: '1.5px solid rgba(255,154,108,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              fontSize: 28
            }}>⚡</div>

            {/* Title */}
            <h2 style={{
              color: 'white',
              fontWeight: 900,
              fontSize: 22,
              textAlign: 'center',
              margin: '0 0 8px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>Out of Charms!</h2>

            {/* Subtitle */}
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              textAlign: 'center',
              margin: '0 0 6px',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6
            }}>
              You've used all{' '}
              <span style={{
                color: '#FF9A6C',
                fontWeight: 700
              }}>11 charms</span>
              {' '}🔥 You're on a roll!
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 13,
              textAlign: 'center',
              margin: '0 0 28px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Watch a short ad to get{' '}
              <span style={{
                color: '#FFC87A',
                fontWeight: 700
              }}>+11 new charms</span>
              {' '}instantly
            </p>

            {/* Charm dots preview */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 6,
              marginBottom: 28
            }}>
              {[...Array(11)].map((_,i) => (
                <div key={i} style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: 'rgba(255,154,108,0.8)',
                  boxShadow: '0 0 6px rgba(255,154,108,0.5)',
                  animation: `dotAppear 0.4s ease ${i*0.05}s both`
                }}/>
              ))}
            </div>

            {/* Continue button */}
            <button
              onClick={() => {
                // Open ad in new tab
                window.open(
                  "https://omg10.com/4/10647732",
                  '_blank'
                );
                // Refill charms after 3 seconds
                setTimeout(() => {
                  const newCharms = 11;
                  setCharms(newCharms);
                  if (user?.uid) {
                    saveCharms(user.uid, newCharms);
                  }
                  setShowCharmModal(false);
                }, 3000);
              }}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(135deg, #FF9A6C, #FFC87A)',
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
                boxShadow: '0 6px 24px rgba(255,154,108,0.4)',
                marginBottom: 12,
                letterSpacing: 0.3
              }}
            >
              ⚡ Watch Ad & Get 11 Charms!
            </button>

            {/* Maybe later */}
            <button
              onClick={() => setShowCharmModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >Maybe later</button>

          </div>
        </div>
      )}
      </AnimatePresence>

      {/* Sidebar Overlay removed - now global in App.tsx */}

    </motion.div>
  );
}

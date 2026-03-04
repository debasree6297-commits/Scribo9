import React, { useEffect, useState } from 'react';
import { playWelcome } from '../utils/soundEffects';

interface Props {
  type: 'chat' | 'image';
  userName?: string;
  onDone: () => void;
}

const WelcomeScreen: React.FC<Props> = ({
  type, userName, onDone
}) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    playWelcome();
    
    // Phase 0 → show
    // Phase 1 → after 2.5s fade out
    // Phase 2 → done
    const t1 = setTimeout(() => setPhase(1), 2500);
    const t2 = setTimeout(() => onDone(), 3200);
    
    return () => { 
      clearTimeout(t1); 
      clearTimeout(t2); 
    };
  }, []);

  const isChat = type === 'chat';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: isChat
        ? 'linear-gradient(135deg, #FFFAF5 0%, #FFF5EE 50%, #FFF0F8 100%)'
        : 'linear-gradient(135deg, #0A0A1A 0%, #0D0A2E 50%, #0A1628 100%)',
      opacity: phase === 1 ? 0 : 1,
      transform: phase === 1 
        ? 'scale(1.04)' 
        : 'scale(1)',
      transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
      padding: 32
    }}>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 4 + (i % 3) * 3,
          height: 4 + (i % 3) * 3,
          borderRadius: '50%',
          background: isChat
            ? `rgba(255,154,108,${0.2 + (i%4)*0.1})`
            : `rgba(99,102,241,${0.15 + (i%4)*0.1})`,
          left: `${8 + (i * 7.5) % 84}%`,
          top: `${10 + (i * 8.3) % 80}%`,
          animation: `
            float${i % 3} 
            ${2 + (i % 3) * 0.8}s 
            ease-in-out 
            ${i * 0.2}s 
            infinite alternate
          `,
          filter: 'blur(1px)'
        }}/>
      ))}

      {/* Main icon */}
      {type === 'image' ? (
        <div style={{
          width: 90,
          height: 90,
          marginBottom: 24,
          filter: 'drop-shadow(0 10px 28px rgba(255,154,108,0.5))',
          animation: 'logoPulse 3s ease-in-out infinite'
        }}>
          <svg viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            style={{width:'100%', height:'100%'}}
          >
            <defs>
              <radialGradient id="ws1" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFE0C0"/>
                <stop offset="55%" stopColor="#FFAA72"/>
                <stop offset="100%" stopColor="#FF8C50"/>
              </radialGradient>
              <radialGradient id="ws2" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFD4A8"/>
                <stop offset="100%" stopColor="#FF9A6C"/>
              </radialGradient>
            </defs>
            <ellipse cx="62" cy="118" rx="38" ry="34"
              fill="url(#ws2)" opacity="0.92"/>
            <ellipse cx="138" cy="122" rx="34" ry="30"
              fill="url(#ws2)" opacity="0.88"/>
            <ellipse cx="100" cy="135" rx="72" ry="38"
              fill="url(#ws1)"/>
            <ellipse cx="100" cy="90" rx="50" ry="50"
              fill="url(#ws1)"/>
            <ellipse cx="62" cy="100" rx="36" ry="36"
              fill="url(#ws2)" opacity="0.95"/>
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
      ) : (
        /* Chat Studio logo — same SVG */
        <div style={{
          width: 90,
          height: 90,
          marginBottom: 24,
          filter: 'drop-shadow(0 10px 28px rgba(255,154,108,0.4))',
          animation: 'logoPulse 3s ease-in-out infinite'
        }}>
          <svg viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            style={{width:'100%', height:'100%'}}
          >
            <defs>
              <radialGradient id="wc1" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFE0C0"/>
                <stop offset="55%" stopColor="#FFAA72"/>
                <stop offset="100%" stopColor="#FF8C50"/>
              </radialGradient>
              <radialGradient id="wc2" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFD4A8"/>
                <stop offset="100%" stopColor="#FF9A6C"/>
              </radialGradient>
            </defs>
            <ellipse cx="62" cy="118" rx="38" ry="34"
              fill="url(#wc2)" opacity="0.92"/>
            <ellipse cx="138" cy="122" rx="34" ry="30"
              fill="url(#wc2)" opacity="0.88"/>
            <ellipse cx="100" cy="135" rx="72" ry="38"
              fill="url(#wc1)"/>
            <ellipse cx="100" cy="90" rx="50" ry="50"
              fill="url(#wc1)"/>
            <ellipse cx="62" cy="100" rx="36" ry="36"
              fill="url(#wc2)" opacity="0.95"/>
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
      )}

      {/* Welcome text */}
      <h1 style={{
        fontSize: 32,
        fontWeight: 900,
        color: isChat ? '#1A1A2E' : 'white',
        margin: '0 0 10px',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        textAlign: 'center',
        animation: 'fadeUp 0.5s ease 0.2s both'
      }}>
        {isChat 
          ? `Hey${userName ? `, ${userName.split(' ')[0]}` : ''}! 👋`
          : 'Image Studio 🎨'
        }
      </h1>

      <p style={{
        fontSize: 16,
        color: isChat 
          ? 'rgba(26,26,46,0.55)' 
          : 'rgba(255,255,255,0.5)',
        margin: '0 0 32px',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 1.6,
        animation: 'fadeUp 0.5s ease 0.35s both'
      }}>
        {isChat
          ? 'Ready to create something amazing today?'
          : 'Turn your imagination into stunning visuals'
        }
      </p>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        gap: 6,
        animation: 'fadeUp 0.5s ease 0.5s both'
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: isChat ? '#FF9A6C' : '#6366F1',
            opacity: 0.3,
            animation: `
              dotPulse 1.2s ease 
              ${i * 0.2}s infinite alternate
            `
          }}/>
        ))}
      </div>

    </div>
  );
};

export default WelcomeScreen;

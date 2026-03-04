import React, { useState } from 'react';

interface SoundButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  soundType?: 'click' | 'send' | 'upload' | 
               'success' | 'generate' | 'charm' |
               'nav' | 'newChat' | 'ad' | 'error';
  disabled?: boolean;
  className?: string;
  title?: string;
  type?: 'button' | 'submit';
  href?: string;
  download?: string;
  target?: string;
  rel?: string;
  as?: 'button' | 'a' | 'label';
  htmlFor?: string;
}

const vibes: Record<string, number | number[]> = {
  send: [30, 10, 30],
  success: [20, 10, 20, 10, 40],
  generate: [20, 10, 40],
  newChat: [30, 10, 30],
  error: [60, 20, 60],
  nav: 25,
  click: 35,
  charm: [10, 5, 20],
  ad: 40,
  upload: [20, 10, 20]
};

const SoundButton: React.FC<SoundButtonProps> = ({
  onClick,
  children,
  style,
  soundType = 'click',
  disabled = false,
  as = 'button',
  htmlFor,
  href,
  download,
  target,
  rel,
  title,
  type = 'button',
  className
}) => {
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<
    {id: number; x: number; y: number}[]
  >([]);

  const handleInteraction = (
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (disabled) return;

    // Ripple effect
    try {
      const rect = (e.currentTarget as HTMLElement)
        .getBoundingClientRect();
      const clientX = 'touches' in e 
        ? e.touches[0].clientX 
        : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e 
        ? e.touches[0].clientY 
        : (e as React.MouseEvent).clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const id = Date.now();
      setRipples(prev => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    } catch(e) {}

    // Press animation
    setPressed(true);
    setTimeout(() => setPressed(false), 120);

    // Play sound — fully wrapped in try-catch
    try {
      import('../utils/soundEffects').then(s => {
        const map: Record<string, () => void> = {
          click: s.playClick,
          send: s.playSend,
          upload: s.playUpload,
          success: s.playSuccess,
          generate: s.playGenerate,
          charm: s.playCharm,
          nav: s.playNav,
          newChat: s.playNewChat,
          ad: s.playAd,
          error: s.playError
        };
        map[soundType]?.();
      }).catch(() => {});
    } catch(e) {}

    // Vibrate
    try { 
      const v = vibes[soundType] || 30;
      navigator.vibrate?.(v); 
    } catch(e) {}

    // onClick
    try { onClick?.(); } catch(e) {}
  };

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    transform: pressed ? 'scale(0.94)' : 'scale(1)',
    transition: 'transform 0.12s cubic-bezier(0.34,1.56,0.64,1)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    ...style
  };

  const rippleStyle = (x: number, y: number): 
    React.CSSProperties => ({
    position: 'absolute',
    left: x - 60,
    top: y - 60,
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    animation: 'rippleOut 0.6s ease-out forwards',
    pointerEvents: 'none',
    zIndex: 10
  });

  if (as === 'a') {
    return (
      <a
        href={href}
        download={download}
        target={target}
        rel={rel}
        title={title}
        style={baseStyle}
        className={className}
        onClick={handleInteraction as any}
      >
        {ripples.map(r => (
          <span key={r.id} style={rippleStyle(r.x, r.y)}/>
        ))}
        {children}
      </a>
    );
  }

  if (as === 'label') {
    return (
      <label
        htmlFor={htmlFor}
        title={title}
        style={baseStyle}
        className={className}
        onClick={handleInteraction as any}
      >
        {ripples.map(r => (
          <span key={r.id} style={rippleStyle(r.x, r.y)}/>
        ))}
        {children}
      </label>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      title={title}
      style={baseStyle}
      className={className}
      onClick={handleInteraction}
    >
      {ripples.map(r => (
        <span key={r.id} style={rippleStyle(r.x, r.y)}/>
      ))}
      {children}
    </button>
  );
};

export default SoundButton;

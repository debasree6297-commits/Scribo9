let _ctx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  try {
    if (!_ctx) {
      _ctx = new (
        window.AudioContext || 
        (window as any).webkitAudioContext
      )();
    }
    if (_ctx.state === 'suspended') {
      _ctx.resume();
    }
    return _ctx;
  } catch(e) { return null; }
};

const tone = (
  freq: number, dur: number,
  type: OscillatorType = 'sine',
  vol = 0.2, delay = 0
) => {
  try {
    const ac = getCtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.value = freq;
    osc.type = type;
    const t = ac.currentTime + delay;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(
      0.001, t + dur
    );
    osc.start(t);
    osc.stop(t + dur + 0.05);
  } catch(e) {}
};

// General click — subtle pop
export const playClick = () => {
  tone(600, 0.06, 'sine', 0.15);
  tone(800, 0.04, 'sine', 0.1, 0.04);
};

// Send message — ascending whoosh
export const playSend = () => {
  tone(400, 0.08, 'sine', 0.18);
  tone(600, 0.08, 'sine', 0.16, 0.07);
  tone(900, 0.1, 'sine', 0.13, 0.14);
};

// Navigation / page redirect — slide tone
export const playNav = () => {
  tone(350, 0.06, 'sine', 0.14);
  tone(500, 0.06, 'sine', 0.13, 0.06);
  tone(700, 0.09, 'sine', 0.1, 0.12);
};

// Google login tap — special entry sound
export const playLogin = () => {
  tone(500, 0.08, 'triangle', 0.18);
  tone(660, 0.08, 'triangle', 0.16, 0.09);
  tone(880, 0.1, 'triangle', 0.13, 0.18);
  tone(1100, 0.15, 'triangle', 0.1, 0.27);
};

// Image generate — magical shimmer
export const playGenerate = () => {
  tone(440, 0.07, 'triangle', 0.18);
  tone(554, 0.07, 'triangle', 0.15, 0.08);
  tone(659, 0.07, 'triangle', 0.13, 0.16);
  tone(880, 0.14, 'triangle', 0.1, 0.24);
};

// Scroll element appear — soft ping
export const playAppear = () => {
  tone(800, 0.05, 'sine', 0.08);
  tone(1000, 0.06, 'sine', 0.06, 0.04);
};

// New Chat — bright chime
export const playNewChat = () => {
  tone(660, 0.07, 'sine', 0.18);
  tone(880, 0.07, 'sine', 0.15, 0.08);
  tone(1100, 0.1, 'sine', 0.12, 0.16);
};

// Ad watch — notification tone
export const playAd = () => {
  tone(400, 0.07, 'sine', 0.15);
  tone(600, 0.1, 'sine', 0.13, 0.08);
};

// Success / Charm refill
export const playSuccess = () => {
  tone(523, 0.08, 'triangle', 0.18);
  tone(659, 0.08, 'triangle', 0.16, 0.1);
  tone(784, 0.08, 'triangle', 0.13, 0.2);
  tone(1047, 0.18, 'triangle', 0.1, 0.3);
};

// Upload
export const playUpload = () => {
  tone(350, 0.06, 'sine', 0.15);
  tone(550, 0.06, 'sine', 0.13, 0.07);
  tone(750, 0.1, 'sine', 0.1, 0.14);
};

export const vibrate = (
  p: number | number[] = 40
) => {
  try { navigator.vibrate?.(p); } catch(e) {}
};

// Charm crystal ping
export const playCharm = () => {
  tone(1200, 0.05, 'sine', 0.18);
  tone(1500, 0.07, 'sine', 0.14, 0.05);
  tone(1800, 0.1, 'sine', 0.1, 0.1);
};

// Error
export const playError = () => {
  tone(300, 0.14, 'sawtooth', 0.15);
  tone(240, 0.18, 'sawtooth', 0.1, 0.15);
};

// Welcome jingle
export const playWelcome = () => {
  tone(523, 0.1, 'triangle', 0.18);
  tone(659, 0.1, 'triangle', 0.16, 0.12);
  tone(784, 0.1, 'triangle', 0.14, 0.24);
  tone(1047, 0.1, 'triangle', 0.12, 0.36);
  tone(1319, 0.2, 'triangle', 0.1, 0.48);
};

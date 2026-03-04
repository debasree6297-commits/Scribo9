import React, { useEffect } from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import OrbitalDiagram from '../components/sections/OrbitalDiagram';
import LivePreview from '../components/sections/LivePreview';
import Stats from '../components/sections/Stats';
import WhoUses from '../components/sections/WhoUses';
import TeamLetter from '../components/sections/TeamLetter';
import FinalCTA from '../components/sections/FinalCTA';

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
    
    // Cleanup
    setTimeout(() => {
      ac.close();
    }, (dur + delay + 0.1) * 1000);
  } catch (e) {}
};

const soundClick = () => playTone(800, 0.1, 'sine', 0.1);
const soundStart = () => {
  playTone(400, 0.3, 'sine', 0.15);
  playTone(600, 0.3, 'sine', 0.1, 0.05);
};
const soundAppear = () => playTone(1200, 0.15, 'sine', 0.05);

interface LandingProps {
  setShowAuth: (show: boolean) => void;
}

export default function Landing({ setShowAuth }: LandingProps) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            soundAppear();
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe specific elements for "appear" sound
    const elements = document.querySelectorAll('.scroll-sound-trigger');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <div className="scroll-sound-trigger">
        <Hero setShowAuth={setShowAuth} />
      </div>
      <div className="scroll-sound-trigger">
        <Features />
      </div>
      <OrbitalDiagram />
      <div className="scroll-sound-trigger">
        <LivePreview />
      </div>
      <Stats />
      <WhoUses />
      <TeamLetter />
      <div className="scroll-sound-trigger">
        <FinalCTA setShowAuth={setShowAuth} />
      </div>
    </main>
  );
}

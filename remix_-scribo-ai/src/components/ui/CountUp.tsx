import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'motion/react';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export default function CountUp({ end, duration = 2.5, suffix = "", className = "" }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / (duration * 1000), 1);
        
        // easeOutExpo
        const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
        
        setCount(Math.floor(ease * end));

        if (percentage < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    } else {
      setCount(0); // Reset when out of view
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}{count === end ? suffix : ''}
    </span>
  );
}

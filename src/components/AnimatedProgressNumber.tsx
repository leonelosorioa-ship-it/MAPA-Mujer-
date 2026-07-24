import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

export interface AnimatedProgressNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
  delay?: number;
}

export const AnimatedProgressNumber: React.FC<AnimatedProgressNumberProps> = ({
  value,
  suffix = "",
  prefix = "",
  className = "",
  duration = 1.0,
  delay = 0.1
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    // Delay start if requested
    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        // Easing function: Ease Out Back / Cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + easeProgress * (endValue - startValue));
        setDisplayValue(current);

        if (progress < 1) {
          animationFrameId = window.requestAnimationFrame(step);
        }
      };

      animationFrameId = window.requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, delay]);

  return (
    <motion.span
      initial={{ scale: 0.4, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 18,
        delay: delay
      }}
      className={`inline-block ${className}`}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
};

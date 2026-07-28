import React, { useEffect, useRef } from "react";
import { Play, Pause, Sparkles, Volume2, VolumeX } from "lucide-react";

interface AudioWaveVisualizerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  title?: string;
  subtitle?: string;
  themeColor?: string; // e.g. "#36C4D8"
  audioRef?: React.RefObject<HTMLAudioElement | null>;
}

export const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  isPlaying,
  onTogglePlay,
  currentTime = 0,
  duration = 0,
  onSeek,
  title,
  subtitle,
  themeColor = "#36C4D8",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const size = 220;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const radius = 70; // Inner waveform circle radius

      phase += isPlaying ? 0.08 : 0.02;

      // Draw background ambient radial gradient inside circle
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius + 20);
      bgGlow.addColorStop(0, "rgba(232, 111, 163, 0.12)");
      bgGlow.addColorStop(0.6, "rgba(54, 196, 216, 0.1)");
      bgGlow.addColorStop(1, "rgba(249, 243, 252, 0.95)");
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 15, 0, Math.PI * 2);
      ctx.fill();

      // Render 36 vertical spectrum bars inside the central circle
      const numBars = 32;
      const barWidth = 3;
      const totalWidth = numBars * (barWidth + 2);
      const startX = centerX - totalWidth / 2;

      for (let i = 0; i < numBars; i++) {
        const x = startX + i * (barWidth + 2);
        const normI = i / numBars;

        // Symmetric height multiplier (higher in middle, lower at edges)
        const centerDist = Math.sin(normI * Math.PI);

        let barHeight = 8;
        if (isPlaying) {
          // Dynamic wave formula simulating frequencies
          const wave1 = Math.sin(phase * 1.5 + i * 0.3) * 18;
          const wave2 = Math.cos(phase * 2.2 + i * 0.5) * 12;
          const wave3 = Math.sin(phase * 0.8 + i * 0.2) * 8;
          barHeight = Math.max(6, (14 + wave1 + wave2 + wave3) * centerDist);
        } else {
          // Latent breathing wave when paused
          const breathing = Math.sin(phase * 0.8 + i * 0.2) * 4;
          barHeight = Math.max(5, (8 + breathing) * centerDist);
        }

        const yTop = centerY - barHeight / 2;

        // Color gradient for each bar (Cyan -> Magenta -> Purple)
        const barGradient = ctx.createLinearGradient(0, yTop, 0, yTop + barHeight);
        if (i % 3 === 0) {
          barGradient.addColorStop(0, "#36C4D8");
          barGradient.addColorStop(1, "#E86FA3");
        } else if (i % 3 === 1) {
          barGradient.addColorStop(0, "#E86FA3");
          barGradient.addColorStop(1, "#B5179E");
        } else {
          barGradient.addColorStop(0, "#72C7CF");
          barGradient.addColorStop(1, "#36C4D8");
        }

        // Draw bar with rounded corners
        ctx.fillStyle = barGradient;
        ctx.beginPath();
        ctx.roundRect(x, yTop, barWidth, barHeight, [2]);
        ctx.fill();

        // Add glow when playing
        if (isPlaying && i % 4 === 0) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#36C4D8";
        } else {
          ctx.shadowBlur = 0;
        }
      }

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw continuous glowing sine wave overlay across center
      ctx.beginPath();
      ctx.lineWidth = 2;
      const waveGradient = ctx.createLinearGradient(centerX - 80, 0, centerX + 80, 0);
      waveGradient.addColorStop(0, "rgba(54, 196, 216, 0.8)");
      waveGradient.addColorStop(0.5, "rgba(232, 111, 163, 0.9)");
      waveGradient.addColorStop(1, "rgba(114, 199, 207, 0.8)");
      ctx.strokeStyle = waveGradient;

      const waveSpan = 130;
      const waveStartX = centerX - waveSpan / 2;

      for (let x = 0; x <= waveSpan; x += 2) {
        const normX = x / waveSpan;
        const envelope = Math.sin(normX * Math.PI); // Envelope to taper ends
        const waveAmp = isPlaying ? 16 : 4;
        const y = centerY + Math.sin(phase * 2 + normX * Math.PI * 4) * waveAmp * envelope;

        if (x === 0) {
          ctx.moveTo(waveStartX + x, y);
        } else {
          ctx.lineTo(waveStartX + x, y);
        }
      }
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full text-center">
      {/* Central Glowing Wave Ring Container */}
      <div className="relative group flex items-center justify-center">
        {/* Outer Aura Glow */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
            isPlaying ? "opacity-80 scale-110" : "opacity-35 scale-100"
          }`}
          style={{
            background: `radial-gradient(circle, ${themeColor} 0%, rgba(181,23,158,0.5) 50%, transparent 70%)`,
          }}
        />

        {/* Rotating Sparkle Stars when playing */}
        {isPlaying && (
          <div className="absolute inset-0 w-full h-full animate-spin-slow pointer-events-none z-10 opacity-70">
            <Sparkles className="absolute top-1 left-8 w-3.5 h-3.5 text-[#36C4D8] animate-pulse" />
            <Sparkles className="absolute bottom-2 right-8 w-3.5 h-3.5 text-[#E86FA3] animate-pulse" />
            <Sparkles className="absolute top-8 right-2 w-3 h-3 text-cyan-300 animate-pulse" />
          </div>
        )}

        {/* Main Gradient Frame Ring */}
        <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full p-[3px] bg-gradient-to-tr from-[#36C4D8] via-[#B5179E] to-[#E86FA3] shadow-[0_0_20px_rgba(54,196,216,0.2)] flex items-center justify-center overflow-hidden">
          {/* Inner Light Canvas Container */}
          <div className="w-full h-full rounded-full bg-[#FAF3FC] relative flex items-center justify-center overflow-hidden border border-[#E36DB4]/30">
            {/* Real-time reactive sound wave canvas */}
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Central Interactive Play/Pause Button Overlay */}
            <button
              onClick={onTogglePlay}
              className={`absolute z-20 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl border border-white/30 text-white active:scale-95 ${
                isPlaying
                  ? "bg-gradient-to-r from-[#B5179E] to-[#E86FA3] shadow-[0_0_20px_rgba(232,111,163,0.6)]"
                  : "bg-gradient-to-r from-[#36C4D8] to-[#27A1B2] shadow-[0_0_20px_rgba(54,196,216,0.6)] hover:scale-105"
              }`}
              title={isPlaying ? "Pausar audio" : "Reproducir regalo"}
              id="btn_wave_play_pause"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white stroke-none" />
              ) : (
                <Play className="w-6 h-6 fill-white stroke-none ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Audio Title & Subtitle */}
      {title && (
        <div className="space-y-1 max-w-sm px-2">
          <h4 className="font-display font-black text-lg sm:text-xl text-[#3A185C] tracking-tight leading-snug">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-[#8A519E] font-sans italic font-medium">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Progress Bar & Elapsed Time */}
      <div className="w-full max-w-sm space-y-1 px-2">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
          className="w-full h-2 bg-purple-200/40 rounded-lg appearance-none cursor-pointer transition-all outline-none accent-[#36C4D8]"
          style={{
            background: `linear-gradient(to right, ${themeColor} 0%, ${themeColor} ${
              ((currentTime || 0) / (duration || 1)) * 100
            }%, rgba(138, 81, 158, 0.2) ${
              ((currentTime || 0) / (duration || 1)) * 100
            }%, rgba(138, 81, 158, 0.2) 100%)`,
          }}
        />
        <div className="flex justify-between text-[10px] font-mono font-bold text-[#56346F]">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[#36C4D8] font-extrabold">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

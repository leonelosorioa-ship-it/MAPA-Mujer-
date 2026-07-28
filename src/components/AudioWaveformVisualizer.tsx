import React, { useEffect, useRef } from "react";

interface AudioWaveformVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  bars?: number;
  height?: number;
  themeColor?: string; // e.g., "#E86FA3", "#36C4D8", "#6E488A"
  variant?: "gradient" | "bars" | "spectrum";
  showGlow?: boolean;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  isPlaying,
  audioRef,
  bars = 28,
  height = 42,
  themeColor = "#E86FA3",
  variant = "spectrum",
  showGlow = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.parentElement?.clientWidth || 320;
    const canvasHeight = height;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      phase += isPlaying ? 0.08 : 0.02;

      const numBars = bars;
      const spacing = 3;
      const barWidth = Math.max(3, (canvasWidth - numBars * spacing) / numBars);
      const startX = (canvasWidth - (numBars * (barWidth + spacing) - spacing)) / 2;
      const centerY = canvasHeight / 2;

      for (let i = 0; i < numBars; i++) {
        const x = startX + i * (barWidth + spacing);
        const normI = i / numBars;

        // Middle bars are taller (Gaussian bell shape)
        const bellCurve = Math.sin(normI * Math.PI);

        let barH = 6;
        if (isPlaying) {
          // Dynamic frequency calculation simulating live audio spectrum
          const f1 = Math.sin(phase * 1.8 + i * 0.35) * 16;
          const f2 = Math.cos(phase * 2.5 + i * 0.6) * 10;
          const f3 = Math.sin(phase * 0.9 + i * 0.15) * 8;
          barH = Math.max(6, (14 + f1 + f2 + f3) * bellCurve);
        } else {
          // Latent breathing resting state (estado de reposo)
          const restingWave = Math.sin(phase * 0.7 + i * 0.2) * 3;
          barH = Math.max(4, (6 + restingWave) * bellCurve);
        }

        const yTop = centerY - barH / 2;

        // Color palette matching corporate identity (Púrpura, Magenta, Turquesa) on light background
        const gradient = ctx.createLinearGradient(0, yTop, 0, yTop + barH);
        if (i % 3 === 0) {
          gradient.addColorStop(0, "#28B0C4"); // Vibrant Turquoise
          gradient.addColorStop(1, "#E85F99"); // Magenta
        } else if (i % 3 === 1) {
          gradient.addColorStop(0, "#E85F99"); // Magenta
          gradient.addColorStop(1, "#6E488A"); // Corporate Deep Purple
        } else {
          gradient.addColorStop(0, "#36C4D8"); // Light Turquoise
          gradient.addColorStop(1, "#D84B98"); // Bright Pink
        }

        ctx.fillStyle = gradient;

        // Draw bar with subtle rounded corners
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, yTop, barWidth, barH, [3]);
        } else {
          ctx.rect(x, yTop, barWidth, barH);
        }
        ctx.fill();

        // Glow effect when active
        if (isPlaying && showGlow && i % 3 === 0) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = "#E85F99";
        } else {
          ctx.shadowBlur = 0;
        }
      }

      ctx.shadowBlur = 0;

      // Draw continuous subtle central frequency line overlay
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      const lineGradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
      lineGradient.addColorStop(0, "rgba(40, 176, 196, 0.75)");
      lineGradient.addColorStop(0.5, "rgba(232, 95, 153, 0.9)");
      lineGradient.addColorStop(1, "rgba(110, 72, 138, 0.75)");
      ctx.strokeStyle = lineGradient;

      const waveSpan = canvasWidth - 20;
      const lineStartX = 10;

      for (let x = 0; x <= waveSpan; x += 3) {
        const normX = x / waveSpan;
        const envelope = Math.sin(normX * Math.PI);
        const amp = isPlaying ? 10 : 3;
        const y = centerY + Math.sin(phase * 2 + normX * Math.PI * 6) * amp * envelope;

        if (x === 0) {
          ctx.moveTo(lineStartX + x, y);
        } else {
          ctx.lineTo(lineStartX + x, y);
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
  }, [isPlaying, height, bars, themeColor, showGlow]);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-1 my-1">
      <div className="w-full relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#FAF4FC] via-[#F5ECF8] to-[#FAF4FC] p-2 border border-[#E36DB4]/30 shadow-2xs">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: `${height}px` }}
          className="block"
        />
        <div className="absolute top-1 left-2 flex items-center gap-1.5 pointer-events-none">
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying ? "bg-[#28B0C4] animate-ping" : "bg-[#8A519E]/50"
            }`}
          />
          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#56346F]">
            {isPlaying ? "Espectrograma de Frecuencia Activo" : "Onda de Sonido • En Reposo"}
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Award, Trophy, X, Compass, CheckCircle2, Star, Share2 } from "lucide-react";
import { useWhatsAppShare } from "../utils/useWhatsAppShare";

interface MilestoneModalProps {
  isOpen: boolean;
  daysCount: number;
  onClose: () => void;
  userName: string;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  daysCount,
  onClose,
  userName
}) => {
  const nameToShow = userName || "Preciosa Usuaria";
  const { shareToWhatsApp, shareWithFallback, getShareText } = useWhatsAppShare();
  const [copied, setCopied] = useState(false);

  // Configuration based on the specific completed days milestone (3, 5, or 7)
  const getMilestoneDetails = () => {
    switch (daysCount) {
      case 3:
        return {
          title: "¡HITO DE BRONCE ALCANZADO!",
          badgeName: "El Vigilante Consciente",
          description: `¡Felicidades, ${nameToShow}! Has completado con éxito 3 días continuos de autorregulación e integración somática. Tu brújula interna empieza a sintonizar la calma.`,
          insight: "Tu sistema nervioso simpático está registrando que es seguro soltar la hipervigilancia residual.",
          colorClass: "from-amber-600 via-amber-500 to-amber-700",
          shadowColor: "shadow-amber-500/20",
          borderColor: "border-amber-500/30",
          icon: <Award className="w-12 h-12 text-amber-100" />,
          stars: 1
        };
      case 5:
        return {
          title: "¡HITO DE PLATA CONSEGUIDO!",
          badgeName: "Centinela de la Calma",
          description: `¡Grandioso esfuerzo, ${nameToShow}! Has sostenido tu compromiso de bienestar por 5 días seguidos. La constancia es el puente hacia la reprogramación cognitiva.`,
          insight: "Tus reguladores del nervio vago se activan ahora con mayor agilidad ante estímulos estresores.",
          colorClass: "from-slate-400 via-slate-300 to-slate-500",
          shadowColor: "shadow-slate-400/20",
          borderColor: "border-slate-400/30",
          icon: <Star className="w-12 h-12 text-slate-100 fill-current" />,
          stars: 2
        };
      case 7:
      default:
        return {
          title: "¡MAESTRÍA EN INTEGRACIÓN AUTÓNOMA!",
          badgeName: "Maestría Vagal M.A.P.A.™",
          description: `¡Soberbio, ${nameToShow}! Has completado el ciclo completo de 7 días. Has mapeado tu cuerpo, tus rumiaciones y tus anclas. ¡Estás lista para tu informe de 12 páginas!`,
          insight: "Tu mapa interno está recalibrado y tu tono vagal se encuentra en un estado óptimo de homeostasis.",
          colorClass: "from-yellow-500 via-pink-500 to-cyan-500",
          shadowColor: "shadow-pink-500/30",
          borderColor: "border-pink-500/30",
          icon: <Trophy className="w-14 h-14 text-white" />,
          stars: 3
        };
    }
  };

  const details = getMilestoneDetails();

  // Play audio sound cue or alert when milestone is reached
  useEffect(() => {
    if (isOpen) {
      // Gentle milestone chime
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playTone = (freq: number, delay: number, dur: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + dur);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + delay);
          osc.stop(audioCtx.currentTime + delay + dur);
        };
        // Play an arpeggio of joy
        playTone(523.25, 0, 0.4); // C5
        playTone(659.25, 0.1, 0.4); // E5
        playTone(783.99, 0.2, 0.4); // G5
        playTone(1046.50, 0.3, 0.6); // C6
      } catch (e) {
        console.warn("Audio Context sound synthesis skipped:", e);
      }
    }
  }, [isOpen, daysCount]);

  const shareOptions = {
    variant: "milestone" as const,
    badgeName: details.badgeName,
    day: daysCount
  };
  const shareText = getShareText(shareOptions);

  // Generate confetti items
  const confettiArray = Array.from({ length: 45 });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          {/* Semi-transparent blur backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B0515]/85 backdrop-blur-md"
            id="milestone-backdrop"
          />

          {/* Confetti Explosion Animation Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {confettiArray.map((_, i) => {
              const randomX = Math.random() * 100; // random percentage starting X
              const duration = 2 + Math.random() * 3; // random speed
              const delay = Math.random() * 0.8;
              const scale = 0.5 + Math.random() * 1;
              const colors = ["#E86FA3", "#411F66", "#36C4D8", "#FBBF24", "#34D399"];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];

              return (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 1, 
                    y: "100%", 
                    x: `${randomX}%`,
                    rotate: 0,
                    scale: scale 
                  }}
                  animate={{ 
                    opacity: [1, 1, 0], 
                    y: "-10%", 
                    x: `${randomX + (Math.random() * 20 - 10)}%`,
                    rotate: Math.random() * 360 + 360
                  }}
                  transition={{ 
                    duration: duration, 
                    delay: delay,
                    ease: "easeOut"
                  }}
                  className="absolute w-3 h-3 rounded-sm"
                  style={{ backgroundColor: randomColor }}
                />
              );
            })}
          </div>

          {/* Interactive Cinematic Glassmorphic Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className={`relative w-full max-w-lg max-h-[92vh] overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#1E1135] to-[#0E061B] text-white rounded-3xl border ${details.borderColor} shadow-2xl z-20 p-5 sm:p-8 text-center`}
            id="milestone-card"
          >
            {/* Glossy top lighting reflection */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Sparkles / Aura Glow Effect in Background */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-r from-pink-500/10 via-[#411F66]/30 to-cyan-500/10 blur-3xl pointer-events-none" />

            {/* Top Header Bar with Badge and Dedicated Close Button */}
            <div className="flex items-center justify-between w-full mb-5 pb-3 border-b border-white/10 gap-2 relative z-20">
              <div className="inline-flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/20 px-3 py-1.5 rounded-full max-w-[82%] overflow-hidden">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0 animate-pulse" />
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-pink-300 truncate">
                  LOGRO DESBLOQUEADO
                </span>
                <span className="bg-[#36C4D8]/20 text-[#36C4D8] border border-[#36C4D8]/40 px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold shrink-0">
                  DÍA {daysCount}
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition-all cursor-pointer border border-white/15 shrink-0"
                title="Cerrar celebración"
                id="close-milestone-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* The Badge Graphic Container with rotating light effect */}
            <div className="relative flex justify-center mb-6">
              {/* Spinning particle stars */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute inset-0 w-36 h-36 mx-auto flex items-center justify-center opacity-60 pointer-events-none"
              >
                <div className="absolute top-0 text-yellow-400 font-bold text-lg">✦</div>
                <div className="absolute bottom-0 text-[#36C4D8] font-bold text-lg">✦</div>
                <div className="absolute left-0 text-[#E86FA3] font-bold text-lg">✦</div>
                <div className="absolute right-0 text-pink-300 font-bold text-lg">✦</div>
              </motion.div>

              {/* Glowing Badge Ring */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr ${details.colorClass} ${details.shadowColor} shadow-2xl flex items-center justify-center border-4 border-white/25`}
              >
                {details.icon}
                
                {/* Floating shine layer */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />
              </motion.div>
            </div>

            {/* Star Icons based on milestone tier */}
            <div className="flex justify-center gap-1.5 mb-4">
              {Array.from({ length: details.stars }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>

            {/* Heading Texts */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xl sm:text-2xl font-display font-black tracking-wider text-white">
                {details.title}
              </h3>
              <h4 className="text-base sm:text-lg font-sans font-bold text-cyan-300 tracking-wide">
                "{details.badgeName}"
              </h4>
            </div>

            {/* Motivational Body Content */}
            <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed mb-5 max-w-md mx-auto">
              {details.description}
            </p>

            {/* Professional Insight Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 text-left relative">
              <div className="absolute -top-3 left-4 px-2 bg-[#1E1135] text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                🔬 REVELACIÓN DE TU M.A.P.A.™
              </div>
              <p className="text-xs text-cyan-100/90 leading-relaxed font-serif italic">
                "{details.insight}"
              </p>
            </div>

            {/* Predesigned Social Share Preview Card */}
            <div className="bg-[#E86FA3]/10 border border-[#E86FA3]/25 rounded-2xl p-4 mb-6 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#E86FA3]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-[#E86FA3] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#E86FA3]" />
                  Mensaje Prediseñado para Redes
                </span>
                {copied && (
                  <span className="text-[10px] font-mono font-black text-green-400 bg-green-400/10 px-2.5 py-0.5 rounded border border-green-400/20 animate-bounce">
                    ¡COPIADO! 🎉
                  </span>
                )}
              </div>
              <div className="bg-[#120822]/90 border border-white/10 rounded-xl p-3 text-xs text-slate-100 font-sans leading-relaxed select-all cursor-text whitespace-pre-wrap font-medium">
                {shareText}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                * Puedes seleccionar y copiar este texto para compartir tu progreso, o presionar los botones directos abajo.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3 items-center justify-center">
              <button
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-[#2A1140] text-white font-sans font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                id="milestone-claim-btn"
              >
                <Compass className="w-4.5 h-4.5 text-cyan-300" />
                <span>Continuar mi viaje de bienestar</span>
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  const result = await shareWithFallback(shareOptions);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 3000);
                  if (result.success) {
                    if (result.method === "clipboard") {
                      // Handled by copy indicator
                    }
                  } else {
                    shareToWhatsApp(shareOptions);
                  }
                }}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-pink-500 via-[#E86FA3] to-pink-500 hover:from-pink-600 hover:to-[#d55d91] text-white font-display font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-pink-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 animate-pulse"
                id="milestone-share-btn"
                style={{ animationDuration: '3s' }}
              >
                <Share2 className="w-4.5 h-4.5 text-white" />
                <span>Compartir este logro</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Download, 
  MessageCircle, 
  Sparkles, 
  Music, 
  CheckCircle,
  HelpCircle,
  Heart,
  ExternalLink
} from "lucide-react";

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  onComplete: () => Promise<void>;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  userName,
  userEmail,
  onComplete
}) => {
  const audioUrl = "https://f005.backblazeb2.com/file/M.A.P.A/Audio+de+Clara+de+bienvenida+ya+en+la+App.mp3";
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Intentar la reproducción automática segura al abrir
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setHasInteracted(false);
      setIsClosing(false);

      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.volume = volume;
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
              setHasInteracted(true);
              setAutoplayBlocked(false);
            })
            .catch((err) => {
              console.warn("Autoplay bloqueado por políticas del navegador. Requiere interacción inicial.", err);
              setAutoplayBlocked(true);
            });
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Manejo de eventos del elemento audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setHasInteracted(true); // Ya lo completó
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setHasInteracted(true);
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((e) => console.warn("Error en reproducción manual:", e));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.currentTime = val;
    setCurrentTime(val);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.volume = val;
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleWhatsAppShare = () => {
    setHasInteracted(true);
    const shareText = `Querida, acabo de recibir el hermoso audio de bienvenida de Clara para el programa de 7 días de M.A.P.A.™ Mujer. Lo guardé aquí para escucharlo siempre que necesite recuperar mi centro y mi calma emocional. 🌸 Escúchalo tú también: ${audioUrl}`;
    const link = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleDirectDownload = () => {
    setHasInteracted(true);
    // Para asegurar descarga directa podemos abrir la URL o forzar descarga
    const link = document.createElement("a");
    link.href = audioUrl;
    link.target = "_blank";
    link.download = "Bienvenida_MAPA_Mujer.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEnterApp = async () => {
    setIsFinishing(true);
    try {
      await onComplete();
    } catch (err) {
      console.error("Error confirmando onboarding:", err);
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        
        {/* Invisible backdrop shield to block external clicks */}
        <div className="absolute inset-0" />

        <audio ref={audioRef} src={audioUrl} />

        <motion.div
          id="welcome-onboarding-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ borderWidth: "1.5px" }}
          className="relative w-full max-w-lg bg-white border-purple-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_20px_50px_rgba(157,78,221,0.15)] text-left z-10"
        >
          {/* Decorative premium header border glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-[#9D4EDD] via-[#B5179E] to-[#7b2cbf] rounded-full" />

          {/* Heading */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9D4EDD]/10 border border-[#9D4EDD]/20 text-xs text-[#7b2cbf] font-mono tracking-wide uppercase font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#9D4EDD] animate-pulse" />
              <span>Paso Obligatorio • Bienvenida</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#7b2cbf] via-[#9D4EDD] to-[#B5179E] tracking-tight pt-1 leading-tight">
              ¡Bienvenida a M.A.P.A.™ Mujer, {userName || "hermosa"}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold font-sans max-w-sm mx-auto">
              Leonel Osorio Andrade y todo el equipo te damos la bienvenida oficial a tu proceso de transformación de 7 días.
            </p>
          </div>

          {/* Core persuasion copy */}
          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans font-medium">
            <p className="text-[#7b2cbf] font-black flex items-center gap-1">
              <Heart className="w-4 h-4 fill-current text-rose-500 animate-pulse" />
              Un mensaje crítico de nuestra mentora Clara:
            </p>
            <p>
              Antes de iniciar tu evaluación, responder preguntas o comenzar el Día 1, 
              <strong> es mandatorio e imprescindible</strong> que escuches este breve audio guía de inicio. 
              En él aprenderás el verdadero sentido de este programa y cómo sacarle el máximo provecho para tu tranquilidad mental.
            </p>
          </div>

          {/* CUSTOM PREMIUM AUDIO PLAYER */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#9D4EDD]/10 rounded-xl border border-[#9D4EDD]/20">
                  <Music className="w-5 h-5 text-[#7b2cbf] animate-bounce" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-slate-900 leading-tight">
                    Audio de Clara • Bienvenida Oficial
                  </h4>
                  <p className="font-mono text-xs text-slate-500 font-bold">
                    M.A.P.A.™ Guía Esencial de Inicio
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="font-mono text-xs font-bold">
                {isPlaying ? (
                  <span className="text-[#7b2cbf] flex items-center gap-1 animate-pulse">
                    ● Reproduciendo
                  </span>
                ) : (
                  <span className="text-slate-400">Pausado</span>
                )}
              </div>
            </div>

            {/* Play progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-600 font-bold">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#7b2cbf] focus:outline-none"
              />
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-between gap-4 pt-1">
              {/* Play / Pause main button */}
              <button
                onClick={togglePlay}
                style={{ borderWidth: "2px" }}
                className="px-5 py-2.5 bg-[#9D4EDD] hover:bg-[#7b2cbf] border-[#9D4EDD] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-white fill-current" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-white fill-current" />
                    <span>Escuchar Audio</span>
                  </>
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#7b2cbf]" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#7b2cbf]"
                />
              </div>
            </div>

            {/* Browser Autoplay notification fallback if blocked */}
            {autoplayBlocked && (
              <p className="text-[10px] text-amber-600 font-mono text-center pt-1 animate-pulse font-bold">
                ⚠️ Haz clic en el botón de arriba para iniciar la reproducción.
              </p>
            )}
          </div>

          {/* SUITE DE HERRAMIENTAS: DESCARGAR Y COMPARTIR */}
          <div className="space-y-3">
            <span className="block text-xs font-mono text-slate-700 font-black uppercase tracking-wider text-center bg-slate-100 py-1.5 rounded-lg border border-slate-200">
              Conserva este Audio Guía Permanente
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* BOTÓN DE DESCARGA DIRECTA */}
              <button
                onClick={handleDirectDownload}
                style={{ borderWidth: "2px" }}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-slate-200 hover:border-[#7b2cbf] text-slate-700 hover:text-slate-900 rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer active:scale-95 shadow-sm"
              >
                <Download className="w-5 h-5 text-[#7b2cbf]" />
                <span>Descargar en mi Dispositivo</span>
              </button>

              {/* BOTÓN DE COMPARTIR EN WHATSAPP */}
              <button
                onClick={handleWhatsAppShare}
                style={{ borderWidth: "2px" }}
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] border-transparent text-white rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer active:scale-95 shadow-sm"
              >
                <MessageCircle className="w-5 h-5 fill-current text-white" />
                <span>Enviar a mi WhatsApp</span>
              </button>
            </div>
          </div>

          {/* TRANSITION ZONE & SUBMIT BUTTON */}
          <div className="pt-2 border-t border-slate-100">
            {hasInteracted ? (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleEnterApp}
                disabled={isFinishing}
                style={{ borderWidth: "2px" }}
                className="w-full py-4 bg-gradient-to-r from-[#7b2cbf] via-[#9D4EDD] to-[#B5179E] hover:from-[#5a189a] hover:to-[#9d4edd] text-white font-display font-black tracking-wider uppercase rounded-2xl shadow-md hover:shadow-lg text-center text-sm sm:text-base cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 border-transparent"
              >
                {isFinishing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Configurando Acceso...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-white animate-pulse" />
                    <span>He escuchado el audio y deseo comenzar</span>
                  </>
                )}
              </motion.button>
            ) : (
              <div className="w-full py-4 text-center text-xs sm:text-sm font-mono text-amber-800 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center justify-center gap-2 font-bold animate-pulse">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Interactúa con el reproductor de audio para desbloquear tu acceso</span>
              </div>
            )}
          </div>

          {/* Footer absolute validation */}
          <div className="text-[10px] sm:text-xs text-slate-500 font-mono text-center flex items-center justify-center gap-1.5 font-semibold bg-slate-50 py-2.5 rounded-xl border border-slate-100">
            <span>Copyright © 2026 M.A.P.A.™</span>
            <span>•</span>
            <span>Leonel Osorio Andrade</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Award, Trophy, X, Play, Pause, Volume2, Music, CheckCircle, Download, Share2, Save, Loader2, BookOpen, ExternalLink, VolumeX } from "lucide-react";
import { useWhatsAppShare } from "../utils/useWhatsAppShare";
import { AudioWaveVisualizer } from "./AudioWaveVisualizer";
import { CLARA_LUZ_PROFILE } from "../data/claraLuzProfile";

interface RewardModalProps {
  isOpen: boolean;
  type: "day3" | "day4" | "day5" | "day7" | null;
  onClose: () => void;
  userName: string;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  type,
  onClose,
  userName
}) => {
  if (!type) return null;

  const { shareToWhatsApp, shareWithFallback } = useWhatsAppShare();

  const isDay3 = type === "day3";
  const isDay4 = type === "day4";
  const isDay5 = type === "day5";
  const isDay7 = type === "day7";

  let title = "Premio a la Valentía";
  let badge = "Mitad del Camino de Calma • Día 3";
  let themeColor = "#6E488A"; // Lavender
  let audioSrc = "https://f005.backblazeb2.com/file/M.A.P.A/Audio+de+tranquilidad+por+Clara+Premio+tercer+dia.mp3";
  let audioTitle = "Audio de Tranquilidad";
  let audioSubtitle = "Voz de Clara Luz • Mentora M.A.P.A.™ Mujer";

  if (isDay3) {
    // Already set as defaults
  } else if (isDay4) {
    title = "Hito de Transformación Superado";
    badge = "Obsequio de Constancia • Día 4";
    themeColor = "#72C7CF";
    audioSrc = "https://f005.backblazeb2.com/file/M.A.P.A/Mi+psico%CC%81loga+me+dijo+-+Yulibeth+R.+G.+Katherine+Hoyer.mp3";
    audioTitle = "Audiolibro: Mi psicóloga me dijo";
    audioSubtitle = "Un obsequio exclusivo de Clara Luz • Mentora M.A.P.A.™ Mujer a tu dedicación";
  } else if (isDay5) {
    title = "Premio a la Resiliencia";
    badge = "Centinela de la Calma • Día 5";
    themeColor = "#36C4D8"; // Turquoise
    audioSrc = "https://f005.backblazeb2.com/file/M.A.P.A/Centinela+de+la+Calma+-+Clara+Premio+quinto+d%C3%ADa.mp3";
    audioTitle = "Centinela de la Calma";
    audioSubtitle = "Voz de Clara Luz • Mentora M.A.P.A.™ Mujer";
  } else if (isDay7) {
    title = "Paz Absoluta • Tu Graduación";
    badge = "Día 7 — Paz Absoluta (Tu Graduación) 🎓";
    themeColor = "#E36DB4";
    audioSrc = "https://f005.backblazeb2.com/file/M.A.P.A/El+Despertar+de+Tu+Calma+Victoria+y+Resiliencia+Sostenible.mp3";
    audioTitle = "El Despertar de Tu Calma: Victoria y Resiliencia Sostenible";
    audioSubtitle = "Sintonía de Clara Luz • Mentora M.A.P.A.™ Mujer";
  }

  // HTML5 audio state management
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Async task states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Screen Wake Lock API to keep the screen active when audio is playing
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log("M.A.P.A.™ Screen Wake Lock adquirido con éxito para Reward Player.");
        } catch (err) {
          console.warn("Screen Wake Lock no disponible o denegado:", err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLock) {
        try {
          await wakeLock.release();
          wakeLock = null;
          console.log("M.A.P.A.™ Screen Wake Lock liberado con éxito para Reward Player.");
        } catch (err) {
          console.warn("Error liberando Screen Wake Lock:", err);
        }
      }
    };

    if (isOpen && isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Reacquire lock when page is visible again
    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible' && isOpen && isPlaying) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, isPlaying]);

  // Auto-play and state resetting
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setSaveSuccess(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (isOpen && audioSrc) {
      const playTimeout = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch(e => {
              console.warn("Autoplay was prevented by browser or failed to load. Awaiting user interaction.", e);
              setIsPlaying(false);
            });
        }
      }, 500);
      return () => clearTimeout(playTimeout);
    }
  }, [type, isOpen, audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(e => console.warn("Error playing audio:", e));
      setIsPlaying(true);
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

  // 1. Guardar en Panel (API Request)
  const handleSaveToPanel = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/save-unlocked-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("MAPA_ACCESS_TOKEN") || ""}`
        },
        body: JSON.stringify({ audioId: type })
      });

      if (res.ok) {
        setSaveSuccess(true);
        // Update local memory progress structure too
        const localProgStr = localStorage.getItem("MAPA_7DAY_PROGRESS_V2");
        if (localProgStr) {
          try {
            const localProg = JSON.parse(localProgStr);
            const currentUnlocked = localProg.unlockedAudios || [];
            if (!currentUnlocked.includes(type)) {
              currentUnlocked.push(type);
              localProg.unlockedAudios = currentUnlocked;
              localStorage.setItem("MAPA_7DAY_PROGRESS_V2", JSON.stringify(localProg));
            }
          } catch (err) {}
        }
      } else {
        const errData = await res.json();
        alert(errData.error || "No se pudo guardar el audio. Por favor inicia sesión nuevamente.");
      }
    } catch (err) {
      console.error("Save reward failed:", err);
      alert("Error al intentar conectar con el servidor para guardar el audio.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Descargar MP3
  const handleDownload = async () => {
    if (!audioSrc) return;
    setIsDownloading(true);
    try {
      const fileName = isDay3 
        ? "MAPA_Mujer_Audio_de_Tranquilidad.mp3" 
        : isDay5 
          ? "MAPA_Mujer_Centinela_de_la_Calma.mp3" 
          : isDay4 
            ? "MAPA_Mujer_Audiolibro.mp3" 
            : "MAPA_Mujer_El_Despertar_de_Tu_Calma.mp3";
            
      const proxyUrl = `/api/download-audio?url=${encodeURIComponent(audioSrc)}&name=${encodeURIComponent(fileName)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Failed to download via server proxy");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed, using backup direct window open proxy method:", err);
      const fileName = isDay3 
        ? "MAPA_Mujer_Audio_de_Tranquilidad.mp3" 
        : isDay5 
          ? "MAPA_Mujer_Centinela_de_la_Calma.mp3" 
          : isDay4 
            ? "MAPA_Mujer_Audiolibro.mp3" 
            : "MAPA_Mujer_El_Despertar_de_Tu_Calma.mp3";
      window.open(`/api/download-audio?url=${encodeURIComponent(audioSrc)}&name=${encodeURIComponent(fileName)}`, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  // 3. Compartir (Web Share API con embudo de ventas)
  const handleShare = async () => {
    const options = {
      variant: "reward" as const,
      rewardTitle: audioTitle,
      day: isDay3 ? 3 : isDay5 ? 5 : isDay4 ? 4 : 7
    };
    
    const result = await shareWithFallback(options);
    if (result.success) {
      if (result.method === "clipboard") {
        alert("¡Mensaje motivador de M.A.P.A.™ y enlace al Test copiados al portapapeles! Compártelo con tus amigas y seres queridos.");
      }
    } else {
      // Fallback manual a WhatsApp
      shareToWhatsApp(options);
    }
  };

  const nameToShow = userName || "Usuaria";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop blur with deep shadow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B0515]/85 backdrop-blur-md"
          />

          {/* Cinematic Glassmorphism Content Card */}
          <motion.div
            id="reward-card"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#2D163F] via-[#1E092D] to-[#0F0417] text-white rounded-3xl p-5 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.75)] border border-white/10 z-10 text-center"
          >
            {/* Ambient dynamic glowing orbs behind card */}
            <div 
              className="absolute -right-24 -top-24 w-48 h-48 rounded-full blur-3xl opacity-35 animate-pulse pointer-events-none"
              style={{ backgroundColor: themeColor }}
            />
            <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-[#56346F]/45 rounded-full blur-3xl pointer-events-none" />

            {/* Header Bar with Badge and Independent Close Button */}
            <div className="flex items-center justify-between w-full mb-4 px-1 gap-2 border-b border-white/10 pb-3 relative z-20">
              <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full overflow-hidden max-w-[80%]">
                {isDay3 ? (
                  <Trophy className="w-4 h-4 text-[#E86FA3] shrink-0 animate-bounce" />
                ) : isDay5 ? (
                  <Award className="w-4 h-4 text-[#36C4D8] shrink-0 animate-pulse" />
                ) : isDay4 ? (
                  <Sparkles className="w-4 h-4 text-[#72C7CF] shrink-0 animate-pulse" />
                ) : (
                  <Award className="w-4 h-4 text-[#36C4D8] shrink-0 animate-spin" />
                )}
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest truncate" style={{ color: themeColor }}>
                  {badge}
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer border border-white/10 shrink-0"
                title="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden HTML5 Audio Element */}
            <audio
              ref={audioRef}
              src={audioSrc}
              preload="auto"
              style={{ display: "none" }}
            />

            {/* Content Container */}
            <div className="space-y-6 text-center relative z-10">
              
              {/* Avatar Illustration Section */}
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-[#EDE0F0]/15 rounded-full blur-xl scale-125 pointer-events-none" />
                <div 
                  className="w-20 h-20 rounded-full overflow-hidden shadow-xl border-2 p-0.5"
                  style={{ borderColor: `${themeColor}60`, backgroundColor: "#311849" }}
                >
                  <img
                    src={CLARA_LUZ_PROFILE.image}
                    alt="Clara Luz - Mentora M.A.P.A.™"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.triedFallback) {
                        target.dataset.triedFallback = "true";
                        target.src = "/clara-luz-profile.jpg";
                      } else if (!target.dataset.triedSecond) {
                        target.dataset.triedSecond = "true";
                        target.src = "/clara_luz.jpg";
                      }
                    }}
                    className="w-full h-full object-cover object-top rounded-full"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#311849] border border-white/30 px-1.5 py-0.5 rounded-full shadow-md text-xs">
                  {isDay3 ? "🌸" : isDay5 ? "🛡️" : isDay4 ? "📚" : "🎓"}
                </div>
              </div>

              {/* Title & Clara Prompt */}
              <div className="space-y-2">
                <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white">
                  {title}
                </h3>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
                  Mensaje Especial de Clara Luz • Mentora M.A.P.A.™ Mujer
                </p>
                <div className="h-0.5 w-16 mx-auto" style={{ backgroundColor: themeColor }} />
              </div>

              {/* Empathic Message Body */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 text-left text-sm leading-relaxed text-white/90 font-sans italic relative">
                <span className="absolute -top-3 -left-1 text-4xl text-white/10 font-serif">“</span>
                {isDay3 ? (
                  <p>
                    Querida <strong style={{ color: themeColor }}>{nameToShow}</strong>, hoy has completado tu tercer día de M.A.P.A.™ y quiero detenerme para honrar tu inmensa valentía. Llegar a la mitad de este proceso no es casualidad; es la prueba viviente de tu compromiso absoluto con tu paz y bienestar. Para premiar tu valentía, he desbloqueado este <strong className="text-white">Audio de Tranquilidad</strong>. Un bálsamo acústico diseñado para calmar tu sistema nervioso y recordarte que estás a salvo. Este audio quedará guardado para siempre en tu panel para que lo escuches cuando lo necesites.
                  </p>
                ) : isDay5 ? (
                  <p>
                    Felicidades, mi querida <strong style={{ color: themeColor }}>{nameToShow}</strong>. Has completado exitosamente tu test del Día 5. Hoy honramos tu constancia y tu poder de resiliencia emocional. Te entrego el audio <strong className="text-white">Centinela de la Calma</strong>, una sintonía protectora de calma profunda y equilibrio interno diseñada por mí para guiar tus momentos de tensión y devolver la armonía a tu corazón.
                  </p>
                ) : isDay4 ? (
                  <p>
                    ¡Lo lograste, <strong style={{ color: themeColor }}>{nameToShow}</strong>! Has superado la mitad de tu viaje de transformación. Llegar al Día 4 requiere un compromiso inmenso con tu paz mental, y tu persistencia merece ser honrada.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p>
                      ¡Felicidades, mi querida <strong style={{ color: themeColor }}>{nameToShow}</strong>! Has concluido con éxito los 7 días de tu Mapa de Activación y Protección Emocional. Hoy celebro con profunda admiración tu constancia, tu resiliencia y el infinito amor que te has demostrado al completar este viaje terapéutico.
                    </p>
                    <p className="text-xs text-white/80">
                      Para tu graduación, la Mentora Clara ha liberado dos valiosos recursos que te ayudarán a mantener la paz en el largo plazo. Disfrútalos a continuación. ¡Lo lograste!
                    </p>
                  </div>
                )}
                <span className="absolute -bottom-7 -right-1 text-4xl text-white/10 font-serif">”</span>
              </div>

              {/* Dynamic Interactive Audio Wave Visualizer Gift Player */}
              <div className="bg-gradient-to-b from-[#FFF5FA] to-[#FAF2FB] border border-[#E36DB4]/30 rounded-3xl p-5 shadow-md relative overflow-hidden space-y-4">
                <div 
                  className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: themeColor }}
                />

                {/* Circular Wave Sound Visualizer */}
                <AudioWaveVisualizer
                  isPlaying={isPlaying}
                  onTogglePlay={togglePlay}
                  currentTime={currentTime}
                  duration={duration || 180}
                  onSeek={(val) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = val;
                      setCurrentTime(val);
                    }
                  }}
                  title={audioTitle}
                  subtitle={audioSubtitle}
                  themeColor={themeColor}
                />

                {/* Secondary Volume Control */}
                <div className="flex items-center justify-center space-x-3 pt-1 border-t border-white/10 text-xs text-white/60">
                  <button
                    onClick={toggleMute}
                    className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-1 flex items-center gap-1 font-mono text-[11px]"
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-400 font-bold">Silenciado</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-cyan-300" />
                        <span>Volumen</span>
                      </>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#36C4D8]"
                  />
                </div>
              </div>

              {/* SECOND RESOURCE (COMPANION BOOK): ONLY FOR DAY 7 */}
              {isDay7 && (
                <div className="bg-gradient-to-r from-[#E36DB4]/10 via-[#6E488A]/10 to-[#36C4D8]/10 border border-[#E36DB4]/30 rounded-2xl p-4 sm:p-5 text-left flex flex-col gap-4 shadow-lg animate-fadeIn relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#E36DB4]/5 rounded-full blur-lg pointer-events-none" />
                  
                  <div className="flex items-start space-x-3.5 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#E36DB4]/20 flex items-center justify-center shrink-0 border border-[#E36DB4]/30">
                      <BookOpen className="w-6 h-6 text-[#E36DB4]" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-black text-[#E36DB4] uppercase tracking-widest bg-[#E36DB4]/10 px-2 py-0.5 rounded border border-[#E36DB4]/15">
                        Segundo Recurso • Regalo Especial 📚
                      </span>
                      <h4 className="font-display font-black text-base text-white mt-1">
                        Libro "Cuídate para Crecer"
                      </h4>
                      <p className="text-[11px] text-white/50 font-sans italic font-bold">
                        Por la maravillosa escritora Ana Pérez
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed font-sans font-medium relative z-10 bg-black/10 p-3 rounded-lg border border-white/5">
                    "Es una lectura consciente que se convertirá en el complemento perfecto para este nuevo ritmo de vida sostenible que hoy empiezas a edificar."
                  </p>

                  <a
                    href="https://f005.backblazeb2.com/file/M.A.P.A/Cu%C3%ADdate+para+Crecer.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-gradient-to-r from-[#6E488A] to-[#E36DB4] hover:shadow-[0_0_15px_rgba(227,109,180,0.4)] hover:scale-[1.02] active:scale-[0.98] border border-[#F08ECA]/40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ease-in-out relative z-10"
                  >
                    <span>Leer Libro Digital 📖</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Utility Tools Actions Panel */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {/* 1. Save to Panel */}
                <button
                  onClick={handleSaveToPanel}
                  disabled={isSaving || saveSuccess}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer select-none outline-none disabled:opacity-80"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeColor }} />
                  ) : saveSuccess ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Save className="w-5 h-5 text-white" />
                  )}
                  <span className="text-[10px] mt-1.5 font-bold tracking-tight">
                    {saveSuccess ? "¡Guardado!" : "Guardar Panel"}
                  </span>
                </button>

                {/* 2. Download */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer select-none outline-none disabled:opacity-80"
                >
                  {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeColor }} />
                  ) : (
                    <Download className="w-5 h-5 text-white" />
                  )}
                  <span className="text-[10px] mt-1.5 font-bold tracking-tight">Descargar</span>
                </button>

                {/* 3. Share */}
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer select-none outline-none"
                >
                  <Share2 className="w-5 h-5 text-white" />
                  <span className="text-[10px] mt-1.5 font-bold tracking-tight">Compartir</span>
                </button>
              </div>

              {/* Close / Recibir button */}
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-gradient-to-r from-[#EDE0F0] to-[#E36DB4]/30 text-white hover:text-white rounded-xl font-bold uppercase tracking-wider text-xs border border-white/20 hover:border-white/40 cursor-pointer shadow-md hover:shadow-xl transition-all"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${themeColor} 0%, #56346F 100%)`
                  }}
                >
                  {isDay3 || isDay5 ? (
                    "Completar y Continuar ➔"
                  ) : isDay4 ? (
                    "Guardar en mis recursos y continuar"
                  ) : (
                    "Guardar Reconocimiento y Finalizar 🎓"
                  )}
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Sparkles, 
  Calendar, 
  Activity, 
  Brain, 
  Wind, 
  Headphones, 
  HeartHandshake, 
  BookOpen, 
  ChevronRight, 
  Award, 
  ShieldCheck, 
  MessageSquare, 
  User, 
  BarChart2, 
  Smile, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Flame,
  ArrowRight,
  Zap,
  TrendingUp,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SevenDaysRoadmap } from "./7DaysRoadmap";
import { BottomNav, NavTab } from "./BottomNav";
import { PremiumDashboard } from "./PremiumDashboard";
import { SoundTherapy } from "./SoundTherapy";
import { PushNotificationManager } from "./PushNotificationManager";
import { InAppNotificationSystem } from "./InAppNotificationSystem";
import { AppDownloadPrompt } from "./AppDownloadPrompt";
import { AnimatedProgressNumber } from "./AnimatedProgressNumber";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface DashboardProps {
  userEmail: string;
  leadInfo: any;
  programProgress: any;
  currentChronoState: any;
  evaluationResult: any;
  selectedDayPreview: number | null;
  setSelectedDayPreview: (day: number | null) => void;
  onStartDayTest: (day: number) => void;
  handleConfirmAppDownloaded: () => void;
  setMilestoneModal: (modal: { isOpen: boolean; daysCount: number }) => void;
  setIsClaraProfileOpen: (open: boolean) => void;
  setIsProfileSettingsOpen: (open: boolean) => void;
  dashboardNotice: string | null;
  activeCardRef?: React.RefObject<HTMLDivElement | null>;
  getUserArchetypeSlug: () => string;
  getUserShortName: (info: any) => string;
  getTimeRemainingForDay: (dayNum: number) => string;
  isAudioPlaying?: boolean;
  onToggleAudioPlay?: () => void;
  activeAudioTitle?: string;
  onOpenPanicButton?: () => void;
  onOpenScanWizard?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userEmail,
  leadInfo,
  programProgress,
  currentChronoState,
  evaluationResult,
  selectedDayPreview,
  setSelectedDayPreview,
  onStartDayTest,
  handleConfirmAppDownloaded,
  setMilestoneModal,
  setIsClaraProfileOpen,
  setIsProfileSettingsOpen,
  dashboardNotice,
  getUserArchetypeSlug,
  getUserShortName,
  getTimeRemainingForDay,
  isAudioPlaying,
  onToggleAudioPlay,
  activeAudioTitle,
  onOpenPanicButton,
  onOpenScanWizard
}) => {
  const [activeNavTab, setActiveNavTab] = useState<NavTab>("home");
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null);

  // Listen for navigation events from top-left compact menu
  useEffect(() => {
    const handleNavEvent = (e: any) => {
      if (e.detail) {
        if (e.detail === "profile") {
          setIsProfileSettingsOpen(true);
        } else {
          setActiveNavTab(e.detail as NavTab);
        }
      }
    };
    window.addEventListener("mapa_nav_tab", handleNavEvent);
    return () => window.removeEventListener("mapa_nav_tab", handleNavEvent);
  }, [setIsProfileSettingsOpen]);

  const userShortName = getUserShortName(leadInfo);
  const archetypeSlug = getUserArchetypeSlug();

  const archetypeInfo = {
    VIGILANTE: { name: "El Vigilante", avatar: "👁️", color: "text-[#36C4D8]", bg: "bg-[#36C4D8]/10 border-[#36C4D8]/20", desc: "Escaneas tu entorno físico, social y emocional buscando señales de tensión." },
    ANTICIPADOR: { name: "El Anticipador", avatar: "🔮", color: "text-[#E36DB4]", bg: "bg-[#E36DB4]/10 border-[#E36DB4]/20", desc: "Creas escenarios de tragedias futuras para ensayar preventivamente tus respuestas." },
    HIPERCONTROLADOR: { name: "El Hipercontrolador", avatar: "⚙️", color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/20", desc: "Sientes que si dejas de supervisar o intervenir todo colapsará a tu alrededor." },
    SOBRECARGADO: { name: "El Sobrecargado", avatar: "🎒", color: "text-sky-600", bg: "bg-sky-500/10 border-sky-500/20", desc: "Cargas inconscientemente con el bienestar y las necesidades de todos los demás." },
    PROTECTOR: { name: "El Protector Silencioso", avatar: "🎭", color: "text-purple-600", bg: "bg-purple-500/10 border-purple-500/20", desc: "Construyes una máscara impecable de optimismo exterior mientras batallas sola." }
  }[archetypeSlug] || { name: "El Hipercontrolador", avatar: "⚙️", color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/20", desc: "Buscando equilibrio y serenidad." };

  // Sample data for chart
  const calmHistoryData = (programProgress.completedDays || []).map((dayNum: number) => ({
    dia: `Día ${dayNum}`,
    calma: 40 + dayNum * 8,
    tension: Math.max(10, 80 - dayNum * 10)
  }));

  if (calmHistoryData.length === 0) {
    calmHistoryData.push(
      { dia: "Inicio", calma: 35, tension: 75 },
      { dia: "Día 1", calma: 50, tension: 60 }
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 text-left animate-fadeIn space-y-6">
      {/* NOTICES AND NOTIFICATION SHIELDS */}
      {dashboardNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-medium flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" />
          <span>{dashboardNotice}</span>
        </div>
      )}

      {userEmail && (
        <AppDownloadPrompt
          userEmail={userEmail}
          hasDownloadedApp={!!programProgress.hasDownloadedApp}
          onConfirmDownloaded={handleConfirmAppDownloaded}
        />
      )}

      <PushNotificationManager 
        userEmail={userEmail} 
        currentDay={programProgress.currentDay}
        isDayLocked={currentChronoState.isLocked}
        completionTimestamps={programProgress.completionTimestamps}
        exerciseLogs={programProgress.exerciseLogs}
        onGoToDay={(dayNum) => {
          setSelectedDayPreview(dayNum);
          setActiveNavTab("program");
        }}
      />

      <InAppNotificationSystem
        userName={userShortName}
        currentDay={programProgress.currentDay}
        isDayLocked={currentChronoState.isLocked}
        onGoToTest={() => {
          setActiveNavTab("program");
        }}
        onOpenTool={(toolId) => {
          setActiveNavTab("tools");
          setActiveToolModal(toolId);
        }}
        onOpenClaraLuzChat={() => {
          window.open(
            `https://wa.me/573207739761?text=${encodeURIComponent("¡Hola, Clara! 😊\nSoy " + userShortName + " y me gustaría conversar contigo.")}`,
            "_blank"
          );
        }}
      />

      {/* DYNAMIC TABBED CONTENT */}
      <AnimatePresence mode="wait">
        {/* ==================== TAB 1: INICIO (HOME) ==================== */}
        {activeNavTab === "home" && (
          <motion.div
            key="tab_home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Elegant Header Card */}
            <div className="bg-white border-2 border-[#6E488A]/12 border-b-[6px] border-b-[#EDE0F0] rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 bg-[#EDE0F0] text-[#6E488A] px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-widest border border-[#6E488A]/15">
                    <Compass className="w-3.5 h-3.5 animate-spin text-[#E86FA3]" style={{ animationDuration: '6s' }} />
                    <span>BRÚJULA DIARIA ACTIVA</span>
                  </div>

                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#6E488A]">
                    ¡Bienvenida, {userShortName}!
                  </h2>
                  <p className="text-[#56346F]/80 text-xs sm:text-sm font-sans max-w-xl leading-relaxed">
                    Tu panel de regulación emocional está activo. Cada día responderás 7 preguntas breves diseñadas para calmar tu mente y reducir la tensión corporal.
                  </p>

                  {/* Archetype Badge */}
                  <div className={`p-3 rounded-2xl border ${archetypeInfo.bg} flex items-center gap-3 max-w-xl`}>
                    <span className="text-2xl shrink-0">{archetypeInfo.avatar}</span>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#6E488A]/60 block font-bold">Arquetipo Predominante:</span>
                      <span className={`text-xs font-black ${archetypeInfo.color} block`}>{archetypeInfo.name}</span>
                      <p className="text-[11px] text-[#56346F]/85 font-medium leading-relaxed">{archetypeInfo.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Progress summary block */}
                <div className="bg-[#FAF7F9] border border-[#6E488A]/10 p-4 rounded-2xl text-center shrink-0 w-full md:w-auto">
                  <span className="block text-[10px] font-mono text-[#56346F]/60 uppercase tracking-wider">PROGRESO GENERAL</span>
                  <span className="font-display font-extrabold text-3xl text-[#36C4D8] block my-1">
                    <AnimatedProgressNumber value={Math.round((programProgress.completedDays.length / 7) * 100)} suffix="%" />
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-500/10 py-1 px-3 rounded-full font-semibold inline-block">
                    {programProgress.completedDays.length} de 7 Días Completados
                  </span>
                </div>
              </div>
            </div>

            {/* QUICK PROGRAM ACTION BANNER */}
            <div className="bg-gradient-to-r from-[#6E488A] via-[#E86FA3] to-[#36C4D8] rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase font-bold text-white/80 tracking-wider block">
                  DÍA {programProgress.currentDay} ACTIVO
                </span>
                <h3 className="font-display font-bold text-lg sm:text-xl">
                  {currentChronoState.isLocked ? "Periodo de Asimilación Neuro-Emocional" : "Continúa con tu Test Diario M.A.P.A.™"}
                </h3>
                <p className="text-xs text-white/90 font-sans">
                  {currentChronoState.isLocked 
                    ? `Siguiente sesión disponible en: ${getTimeRemainingForDay(programProgress.currentDay)}`
                    : "Solo te tomará 2 minutos responder las 7 preguntas de hoy."}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveNavTab("program")}
                className="bg-white text-[#6E488A] font-sans font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md hover:bg-gray-50 shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Ver Mi Programa</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* MODULAR LIST ROWS (INSPIRED BY PANELES.JPG) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-display font-bold text-lg text-[#6E488A]">
                  Herramientas Recomendadas
                </h3>
                <button
                  onClick={() => setActiveNavTab("tools")}
                  className="text-xs font-mono font-bold text-[#E86FA3] hover:underline cursor-pointer"
                >
                  Ver Todas &gt;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* List Row 1: Técnicas de Respiración */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveNavTab("tools");
                    if (onOpenPanicButton) onOpenPanicButton();
                  }}
                  className="bg-white border-2 border-[#6E488A]/10 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#36C4D8]/15 text-[#27A1B2] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Wind className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#6E488A] group-hover:text-[#36C4D8] transition-colors">
                        Técnicas de Respiración
                      </h4>
                      <p className="text-xs text-[#56346F]/70 font-sans">
                        Calma rápida para el nervio vago
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6E488A]/40 group-hover:text-[#36C4D8] group-hover:translate-x-1 transition-all" />
                </motion.div>

                {/* List Row 2: Terapia de Sonido */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveNavTab("tools")}
                  className="bg-white border-2 border-[#6E488A]/10 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#E86FA3]/15 text-[#E86FA3] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#6E488A] group-hover:text-[#E86FA3] transition-colors">
                        Terapia de Sonido & Binaurales
                      </h4>
                      <p className="text-xs text-[#56346F]/70 font-sans">
                        Audios de reconexión profunda
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6E488A]/40 group-hover:text-[#E86FA3] group-hover:translate-x-1 transition-all" />
                </motion.div>

                {/* List Row 3: Jardín de Paz */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveNavTab("tools")}
                  className="bg-white border-2 border-[#6E488A]/10 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#6E488A] group-hover:text-emerald-600 transition-colors">
                        Jardín de Paz Emocional
                      </h4>
                      <p className="text-xs text-[#56346F]/70 font-sans">
                        Visualización y anclaje sereno
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6E488A]/40 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </motion.div>

                {/* List Row 4: Asistente Clara Luz */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsClaraProfileOpen(true)}
                  className="bg-white border-2 border-[#6E488A]/10 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#6E488A] group-hover:text-purple-600 transition-colors">
                        Acompañamiento Clara Luz
                      </h4>
                      <p className="text-xs text-[#56346F]/70 font-sans">
                        Chat directo con tu guía emocional
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6E488A]/40 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== TAB 2: PROGRAMA DE 7 DÍAS ==================== */}
        {activeNavTab === "program" && (
          <motion.div
            key="tab_program"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <SevenDaysRoadmap
              currentDay={programProgress.currentDay}
              completedDays={programProgress.completedDays || []}
              selectedDay={selectedDayPreview || programProgress.currentDay}
              onSelectDay={(day) => setSelectedDayPreview(day)}
              onStartDayTest={(day) => onStartDayTest(day)}
              isLocked={currentChronoState.isLocked}
              timeRemainingText={getTimeRemainingForDay(programProgress.currentDay)}
              userShortName={userShortName}
            />
          </motion.div>
        )}

        {/* ==================== TAB 3: HERRAMIENTAS & AUDIOS ==================== */}
        {activeNavTab === "tools" && (
          <motion.div
            key="tab_tools"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border-2 border-[#6E488A]/12 rounded-3xl p-5 sm:p-7 shadow-sm text-left">
              <span className="text-[10px] font-mono font-black text-[#E86FA3] uppercase tracking-widest block mb-1">
                ESPACIO DE DESACTIVACIÓN SIMPÁTICA
              </span>
              <h3 className="font-display font-bold text-2xl text-[#6E488A] mb-2">
                Panel de Herramientas & Terapia de Sonido
              </h3>
              <p className="text-xs sm:text-sm text-[#56346F]/80 font-sans">
                Accede a todos tus ejercicios de respiración, audios binaurales y módulos de desahogo en cualquier momento.
              </p>
            </div>

            {/* INTEGRATED SOUND THERAPY MODULE */}
            <SoundTherapy unlockedAudios={programProgress.unlockedAudios || []} />

            {/* INTEGRATED PREMIUM DASHBOARD MODULES */}
            <PremiumDashboard 
              userEmail={userEmail} 
              userName={leadInfo.nombre || "Usuaria"} 
              currentDay={programProgress.currentDay}
              completedDays={programProgress.completedDays}
              onTriggerMilestone={(days) => setMilestoneModal({ isOpen: true, daysCount: days })}
              onOpenClaraProfile={() => setIsClaraProfileOpen(true)}
            />
          </motion.div>
        )}

        {/* ==================== TAB 4: MI PERFIL & EVOLUCIÓN ==================== */}
        {activeNavTab === "profile" && (
          <motion.div
            key="tab_profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* USER PROFILE HEADER CARD */}
            <div className="bg-white border-2 border-[#6E488A]/12 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="flex items-center space-x-4">
                <div 
                  onClick={() => setIsProfileSettingsOpen(true)}
                  className="relative w-16 h-16 rounded-full border-2 border-[#E86FA3] bg-[#EDE0F0] flex items-center justify-center text-3xl overflow-hidden cursor-pointer shadow-md hover:scale-105 transition-transform"
                >
                  {programProgress.customAvatar?.type === "image" ? (
                    <img 
                      src={programProgress.customAvatar.value} 
                      alt="Foto de Perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : programProgress.customAvatar?.type === "emoji" ? (
                    <span>{programProgress.customAvatar.value}</span>
                  ) : (
                    <span className="font-black text-xl text-[#6E488A]">
                      {userShortName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display font-bold text-xl text-[#6E488A]">
                    {leadInfo.nombre || "Usuaria M.A.P.A.™"}
                  </h3>
                  <p className="text-xs text-[#56346F]/70 font-mono">
                    {userEmail}
                  </p>
                  <span className="inline-block mt-1 bg-[#36C4D8]/15 text-[#27A1B2] text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    Arquetipo: {archetypeInfo.name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsProfileSettingsOpen(true)}
                className="bg-[#6E488A]/10 hover:bg-[#6E488A]/20 text-[#6E488A] text-xs font-bold py-2 px-4 rounded-xl border border-[#6E488A]/20 transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Settings className="w-4 h-4" />
                <span>Configuración de Perfil</span>
              </button>
            </div>

            {/* EVOLUTION CHART */}
            <div className="bg-white border-2 border-[#6E488A]/12 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-black text-[#36C4D8] uppercase tracking-widest block">
                    MONITOREO AUTÓNOMO
                  </span>
                  <h4 className="font-display font-bold text-lg text-[#6E488A]">
                    Historial de Alivio Emocional
                  </h4>
                </div>
                <BarChart2 className="w-5 h-5 text-[#36C4D8]" />
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={calmHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="dia" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="calma" 
                      stroke="#36C4D8" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "#36C4D8" }} 
                      name="Nivel de Calma %"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tension" 
                      stroke="#E86FA3" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: "#E86FA3" }} 
                      name="Tensión Corporal %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* INTEGRATED FULL PREMIUM DASHBOARD FOR JOURNALS, MILESTONES & DIARY */}
            <PremiumDashboard 
              userEmail={userEmail} 
              userName={leadInfo.nombre || "Usuaria"} 
              currentDay={programProgress.currentDay}
              completedDays={programProgress.completedDays}
              onTriggerMilestone={(days) => setMilestoneModal({ isOpen: true, daysCount: days })}
              onOpenClaraProfile={() => setIsClaraProfileOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

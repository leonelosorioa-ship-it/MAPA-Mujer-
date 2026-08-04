import React from "react";
import { CheckCircle2, Lock, Play, Clock, Sparkles, ChevronRight, HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedProgressNumber } from "./AnimatedProgressNumber";

export interface DayInfo {
  day: number;
  title: string;
  desc: string;
  marcadores: string;
  herramienta: string;
}

export const DAYS_PROGRAM_DATA: DayInfo[] = [
  {
    day: 1,
    title: "Sintomatología Fisiológica y Alerta Corporal",
    desc: "Exploraremos el ritmo de tu latido cardíaco, la tensión involuntaria en tu mandíbula y respiración costal alta.",
    marcadores: "Frecuencia de alerta subcortical, patrón de respiración torácica.",
    herramienta: "Técnica de la interrupción muscular M.A.P.A.™ (2 min)."
  },
  {
    day: 2,
    title: "Desencadenantes y Sensibilidad Ambiental",
    desc: "Sintonizaremos e identificaremos con precisión qué climas sociales y ruidos del entorno activan tu estrés.",
    marcadores: "Saturación sensorial, fatiga simpática ante el desorden.",
    herramienta: "Protocolo de Blindaje de Estímulos e Inmersión Vagal (5 min)."
  },
  {
    day: 3,
    title: "Rumia Mental y Pensamiento Automático Súbito",
    desc: "Mapearemos en detalle los bucles de anticipación futura catastrófica y diálogo obsesivo involuntario.",
    marcadores: "Bucle de rumiación obsesiva recurrente, alteradores fóbicos.",
    herramienta: "Tabla psicoterapéutica de desglose Hecho vs. Fantasía (3 min)."
  },
  {
    day: 4,
    title: "Relaciones de Vínculo e Interacciones Sociales",
    desc: "Analizaremos la complacencia reactiva para evitar confrontaciones y el miedo latente a fallar.",
    marcadores: "Déficit de batería social, fatiga empática agregada.",
    herramienta: "Filtro de contención afectiva de tres capas seguras (4 min)."
  },
  {
    day: 5,
    title: "Hábitos de Control Rígido y Exigencia Personal",
    desc: "Investigaremos las dificultades para delegar responsabilidades y la necesidad de predecir cada variable.",
    marcadores: "Perfeccionismo inercial, intolerancia a desviación de plans.",
    herramienta: "Ancla de asimilación conductual 'Cajón Imperfecto' (3 min)."
  },
  {
    day: 6,
    title: "Estrategias de Evitación y Evasión Silenciosa",
    desc: "Registraremos las técnicas que utilizas para postergar decisiones o escapar inercialmente en redes sociales.",
    marcadores: "Tiempo digital evasivo inercial, postergación fóbica.",
    herramienta: "Activación por acción comprometida de Micro-Segundos (2 min)."
  },
  {
    day: 7,
    title: "Integración, Autocompasión, Regulación y Cierre",
    desc: "Consolidaremos tus 49 marcadores del nervio vago para preparar tu reporte profesional personalizado.",
    marcadores: "Asertividad vegetativa integrativa, optimismo cognitivo basal.",
    herramienta: "Pauta de anclaje de calma definitiva para tu Mapa Diario (5 min)."
  }
];

interface SevenDaysRoadmapProps {
  currentDay: number;
  completedDays: number[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onStartDayTest: (day: number) => void;
  isLocked: boolean;
  timeRemainingText?: string;
  userShortName?: string;
}

export const SevenDaysRoadmap: React.FC<SevenDaysRoadmapProps> = ({
  currentDay,
  completedDays,
  selectedDay,
  onSelectDay,
  onStartDayTest,
  isLocked,
  timeRemainingText,
  userShortName = "Usuaria"
}) => {
  const activeDayData = DAYS_PROGRAM_DATA.find((d) => d.day === selectedDay) || DAYS_PROGRAM_DATA[0];
  const isSelectedCompleted = completedDays.includes(selectedDay);
  const isSelectedActive = selectedDay === currentDay;

  const totalCompleted = completedDays.length;
  const progressPercent = Math.round((totalCompleted / 7) * 100);

  return (
    <div className="space-y-3 sm:space-y-4 text-left w-full min-w-0 max-w-full">
      {/* ROADMAP TIMELINE HORIZONTAL CONTAINER */}
      <div className="bg-white border-2 border-[#6E488A]/12 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm relative w-full min-w-0">
        {/* HEADER & PROGRESS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-0.5 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase font-black text-[#E86FA3] tracking-wider block">
              SECUENCIA DEL PROGRAMA • 7 DÍAS
            </span>
            <h3 className="font-display font-bold text-sm sm:text-xl text-[#6E488A] leading-snug break-words">
              Tu Ruta de Regulación Emocional
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-[#56346F]/60 sm:hidden flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
              Desliza <ArrowRight className="w-3 h-3 text-[#E86FA3] animate-pulse" />
            </span>
            <div className="bg-[#EDE0F0] text-[#6E488A] px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold border border-[#6E488A]/15 shrink-0">
              {progressPercent}% Completo
            </div>
          </div>
        </div>

        {/* Horizontal Node Track - Touch & Mobile Optimized with Snap */}
        <div className="overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x w-full min-w-0">
          <div className="flex items-center space-x-2 sm:space-x-3 w-max px-0.5">
            {DAYS_PROGRAM_DATA.map((item, idx) => {
              const isCompleted = completedDays.includes(item.day);
              const isActive = item.day === currentDay;
              const isSelected = item.day === selectedDay;

              return (
                <div key={item.day} className="flex items-center snap-center shrink-0">
                  {/* Day Node Card */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectDay(item.day)}
                    className={`relative flex flex-col items-center justify-between p-2 sm:p-3 rounded-xl sm:rounded-2xl w-18 sm:w-26 h-20 sm:h-26 border-2 transition-all cursor-pointer select-none touch-manipulation ${
                      isSelected
                        ? "border-[#36C4D8] bg-gradient-to-b from-[#36C4D8]/15 to-white shadow-md ring-2 ring-[#36C4D8]/30"
                        : isCompleted
                        ? "border-emerald-300 bg-emerald-50/60 text-emerald-900"
                        : isActive
                        ? "border-[#E86FA3] bg-[#E86FA3]/10 text-[#6E488A]"
                        : "border-[#6E488A]/15 bg-gray-50/70 text-gray-400"
                    }`}
                  >
                    <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider">
                      Día {item.day}
                    </span>

                    <div className="my-0.5 flex items-center justify-center">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-500 fill-emerald-100" />
                      ) : isActive ? (
                        <div className="relative flex items-center justify-center">
                          <span className="absolute w-6 h-6 bg-[#E86FA3]/30 rounded-full animate-ping" />
                          <span className="w-5 h-5 sm:w-7 sm:h-7 bg-[#E86FA3] text-white rounded-full flex items-center justify-center font-black text-xs shadow-xs">
                            {item.day}
                          </span>
                        </div>
                      ) : (
                        <Lock className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                      )}
                    </div>

                    <span className="text-[8px] sm:text-[9px] font-sans font-bold truncate w-full text-center">
                      {isCompleted ? "Listo" : isActive ? "En curso" : "Bloqueado"}
                    </span>

                    {/* Node connector dot */}
                    {isSelected && (
                      <span className="absolute -bottom-1 w-2.5 h-2.5 bg-[#36C4D8] rounded-full ring-2 ring-white" />
                    )}
                  </motion.button>

                  {/* Connecting Line */}
                  {idx < DAYS_PROGRAM_DATA.length - 1 && (
                    <div
                      className={`w-2 sm:w-4 h-1 rounded-full mx-1 shrink-0 ${
                        completedDays.includes(item.day) ? "bg-emerald-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* UNIFIED ACTIVE / SELECTED DAY DETAIL CARD - FULLY RESPONSIVE */}
      <motion.div
        key={selectedDay}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white border-2 border-[#6E488A]/12 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm text-left relative w-full min-w-0 space-y-3 sm:space-y-4"
      >
        {/* TOP BADGES ROW */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#6E488A]/10 pb-2.5 w-full min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="bg-[#EDE0F0] text-[#6E488A] font-mono font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border border-[#6E488A]/15 shrink-0">
              DÍA {activeDayData.day} DE 7
            </span>
            {isSelectedCompleted ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                Completado
              </span>
            ) : isSelectedActive && isLocked ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-amber-600 animate-spin shrink-0" />
                Asimilación Activa
              </span>
            ) : isSelectedActive ? (
              <span className="bg-[#E86FA3]/15 text-[#E86FA3] text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse shrink-0">
                <Sparkles className="w-3 h-3 text-[#E86FA3] shrink-0" />
                Disponible Ahora
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-500 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <Lock className="w-3 h-3 shrink-0" />
                Próximamente
              </span>
            )}
          </div>

          <span className="text-[10px] sm:text-xs font-mono text-[#56346F]/60 shrink-0">
            M.A.P.A.™ Mujer
          </span>
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="space-y-1 w-full min-w-0">
          <h3 className="font-display font-bold text-base sm:text-xl md:text-2xl text-[#6E488A] leading-tight break-words">
            {activeDayData.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#56346F]/85 leading-relaxed font-sans break-words">
            {activeDayData.desc}
          </p>
        </div>

        {/* MARCADORES & HERRAMIENTA GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 pt-1 w-full min-w-0">
          <div className="bg-[#FAF7F9] border border-[#6E488A]/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl w-full min-w-0">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#E86FA3] uppercase tracking-wider block mb-1">
              MARCADORES BIOLÓGICOS
            </span>
            <p className="text-xs text-[#56346F]/90 font-medium leading-snug break-words">
              {activeDayData.marcadores}
            </p>
          </div>

          <div className="bg-[#36C4D8]/10 border border-[#36C4D8]/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl w-full min-w-0">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#27A1B2] uppercase tracking-wider block mb-1">
              HERRAMIENTA CLAVE
            </span>
            <p className="text-xs text-[#56346F]/90 font-medium leading-snug break-words">
              {activeDayData.herramienta}
            </p>
          </div>
        </div>

        {/* RESPONSIVE ACTION BUTTON OR STATUS BANNER */}
        <div className="pt-2 w-full min-w-0">
          {isSelectedCompleted || completedDays.length >= 7 ? (
            <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-center space-y-1 w-full min-w-0">
              <span className="text-xs font-mono font-bold text-emerald-800 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ¡Excelente trabajo, {userShortName}!
              </span>
              <p className="text-xs text-emerald-900/80 leading-tight break-words">
                {completedDays.length >= 7 
                  ? `Has completado exitosamente la evaluación del Día ${selectedDay} y el programa completo de 7 Días. Todos tus datos, archivos e informes están disponibles en tu expediente.`
                  : `Has completado la evaluación del Día ${selectedDay}. Los resultados se han integrado en tu expediente M.A.P.A.™`}
              </p>
            </div>
          ) : isSelectedActive && !isLocked ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartDayTest(selectedDay)}
              className="w-full bg-gradient-to-r from-[#E86FA3] via-[#6E488A] to-[#36C4D8] text-white font-sans font-bold py-3 px-3.5 sm:py-3.5 sm:px-6 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-base cursor-pointer text-center whitespace-normal leading-snug min-h-[48px] touch-manipulation"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
              <span className="break-words">Iniciar Test Breve de 7 Preguntas • Día {selectedDay}</span>
            </motion.button>
          ) : isSelectedActive && isLocked ? (
            <div className="bg-amber-50/90 border-2 border-amber-300/80 p-4 sm:p-5 rounded-2xl text-center space-y-2 w-full min-w-0 shadow-sm">
              <span className="text-xs sm:text-sm font-mono font-black text-amber-900 flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                ⏳ Periodo de Asimilación Neuro-Emocional Activo
              </span>
              <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed break-words">
                Tu sistema nervioso requiere consolidar los efectos de la sesión anterior. El test del Día {selectedDay} se habilitará automáticamente en:
              </p>
              
              {/* Highlighted Countdown Badge */}
              <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-mono font-black text-lg sm:text-2xl py-2.5 px-6 rounded-2xl shadow-inner inline-flex items-center gap-2 border border-amber-400/50 my-1 tracking-wider">
                <Clock className="w-5 h-5 animate-pulse text-amber-200" />
                <span>
                  {typeof timeRemainingText === "string" && timeRemainingText 
                    ? timeRemainingText 
                    : (typeof timeRemainingText === "object" && (timeRemainingText as any)?.text) 
                    ? (timeRemainingText as any).text 
                    : "Calculando..."}
                </span>
              </div>

              {/* Explicit Disabled Button explaining lock */}
              <button
                disabled
                className="w-full bg-gray-200/90 text-gray-500 font-sans font-bold py-3 px-4 rounded-xl text-xs sm:text-sm border border-gray-300 cursor-not-allowed flex items-center justify-center gap-2 opacity-85 shadow-xs"
              >
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Test Día {selectedDay} Inactivo • Espera a que el contador llegue a cero</span>
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-center space-y-1 w-full min-w-0">
              <span className="text-xs font-mono font-bold text-gray-600 flex items-center justify-center gap-1">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                Día Bloqueado
              </span>
              <p className="text-xs text-gray-500 leading-tight break-words">
                Se desbloqueará secuencialmente tras completar el Día {selectedDay - 1}.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

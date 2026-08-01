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
    marcadores: "Perfeccionismo inercial, intolerancia a desviación de planes.",
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
  const isSelectedLocked = selectedDay > currentDay && !isSelectedCompleted;

  const totalCompleted = completedDays.length;
  const progressPercent = Math.round((totalCompleted / 7) * 100);

  return (
    <div className="space-y-4 text-left">
      {/* ROADMAP TIMELINE HORIZONTAL CONTAINER */}
      <div className="bg-white border-2 border-[#6E488A]/12 rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <span className="text-[10px] font-mono uppercase font-black text-[#E86FA3] tracking-widest block">
              SECUENCIA DEL PROGRAMA • 7 DÍAS
            </span>
            <h3 className="font-display font-bold text-lg sm:text-xl text-[#6E488A]">
              Tu Ruta de Regulación Emotional
            </h3>
          </div>
          <div className="bg-[#EDE0F0] text-[#6E488A] px-3 py-1 rounded-full text-xs font-mono font-bold border border-[#6E488A]/15">
            {progressPercent}% Completo
          </div>
        </div>

        {/* Horizontal Node Track */}
        <div className="overflow-x-auto pb-2 pt-1 no-scrollbar">
          <div className="flex items-center space-x-3 min-w-max px-1">
            {DAYS_PROGRAM_DATA.map((item, idx) => {
              const isCompleted = completedDays.includes(item.day);
              const isActive = item.day === currentDay;
              const isSelected = item.day === selectedDay;
              const isLockedDay = item.day > currentDay && !isCompleted;

              return (
                <div key={item.day} className="flex items-center">
                  {/* Day Node Card */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectDay(item.day)}
                    className={`relative flex flex-col items-center justify-between p-3 rounded-2xl w-24 sm:w-28 h-28 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#36C4D8] bg-gradient-to-b from-[#36C4D8]/10 to-white shadow-md ring-2 ring-[#36C4D8]/30"
                        : isCompleted
                        ? "border-emerald-300 bg-emerald-50/50 text-emerald-900"
                        : isActive
                        ? "border-[#E86FA3] bg-[#E86FA3]/10 text-[#6E488A]"
                        : "border-[#6E488A]/15 bg-gray-50/60 text-gray-400"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider">
                      Día {item.day}
                    </span>

                    <div className="my-1 flex items-center justify-center">
                      {isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100" />
                      ) : isActive ? (
                        <div className="relative flex items-center justify-center">
                          <span className="absolute w-8 h-8 bg-[#E86FA3]/30 rounded-full animate-ping" />
                          <span className="w-7 h-7 bg-[#E86FA3] text-white rounded-full flex items-center justify-center font-black text-xs shadow-sm">
                            {item.day}
                          </span>
                        </div>
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <span className="text-[9px] font-sans font-bold line-clamp-1 text-center w-full">
                      {isCompleted ? "Listo" : isActive ? "En curso" : "Bloqueado"}
                    </span>

                    {/* Node connector dot */}
                    {isSelected && (
                      <span className="absolute -bottom-1.5 w-3 h-3 bg-[#36C4D8] rounded-full ring-2 ring-white" />
                    )}
                  </motion.button>

                  {/* Connecting Line */}
                  {idx < DAYS_PROGRAM_DATA.length - 1 && (
                    <div
                      className={`w-4 sm:w-6 h-1 rounded-full mx-1 ${
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

      {/* UNIFIED ACTIVE / SELECTED DAY DETAIL CARD */}
      <motion.div
        key={selectedDay}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white border-2 border-[#6E488A]/12 rounded-3xl p-5 sm:p-7 shadow-sm text-left relative overflow-hidden space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#6E488A]/10 pb-3">
          <div className="flex items-center space-x-2">
            <span className="bg-[#EDE0F0] text-[#6E488A] font-mono font-black text-xs px-3 py-1 rounded-full border border-[#6E488A]/15">
              DÍA {activeDayData.day} DE 7
            </span>
            {isSelectedCompleted ? (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Completado
              </span>
            ) : isSelectedActive && isLocked ? (
              <span className="bg-amber-100 text-amber-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                Tiempo de Asimilación
              </span>
            ) : isSelectedActive ? (
              <span className="bg-[#E86FA3]/15 text-[#E86FA3] text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-[#E86FA3]" />
                Disponible Ahora
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-500 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Próximamente
              </span>
            )}
          </div>

          <span className="text-xs font-mono text-[#56346F]/60">
            M.A.P.A.™ Mujer
          </span>
        </div>

        <div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-[#6E488A] mb-2">
            {activeDayData.title}
          </h3>
          <p className="text-sm text-[#56346F]/85 leading-relaxed font-sans">
            {activeDayData.desc}
          </p>
        </div>

        {/* Marcadores & Herramienta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-[#FAF7F9] border border-[#6E488A]/10 p-3.5 rounded-2xl">
            <span className="text-[10px] font-mono font-bold text-[#E86FA3] uppercase tracking-wider block mb-1">
              MARCADORES BIOLÓGICOS
            </span>
            <p className="text-xs text-[#56346F]/80 font-medium">
              {activeDayData.marcadores}
            </p>
          </div>

          <div className="bg-[#36C4D8]/10 border border-[#36C4D8]/20 p-3.5 rounded-2xl">
            <span className="text-[10px] font-mono font-bold text-[#27A1B2] uppercase tracking-wider block mb-1">
              HERRAMIENTA CLAVE
            </span>
            <p className="text-xs text-[#56346F]/80 font-medium">
              {activeDayData.herramienta}
            </p>
          </div>
        </div>

        {/* ACTION BUTTON OR LOCK COUNTDOWN */}
        <div className="pt-2">
          {isSelectedActive && !isLocked ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartDayTest(selectedDay)}
              className="w-full bg-gradient-to-r from-[#E86FA3] via-[#6E488A] to-[#36C4D8] text-white font-sans font-bold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar Test Breve de 7 Preguntas • Día {selectedDay}</span>
            </motion.button>
          ) : isSelectedActive && isLocked ? (
            <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl text-center space-y-1">
              <span className="text-xs font-mono font-bold text-amber-800 block">
                ⏳ Periodo de Asimilación Neuro-Emocional Activo
              </span>
              <p className="text-xs text-amber-900/80">
                Tu sistema nervioso requiere consolidar la sesión anterior. El siguiente test se habilitará en:
              </p>
              <span className="font-mono font-black text-lg text-amber-900 block pt-1">
                {timeRemainingText || "Calculando..."}
              </span>
            </div>
          ) : isSelectedCompleted ? (
            <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl text-center space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-800 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ¡Excelente trabajo, {userShortName}!
              </span>
              <p className="text-xs text-emerald-900/80">
                Has completado la evaluación del Día {selectedDay}. Los resultados se han integrado en tu expediente M.A.P.A.™
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-center space-y-1">
              <span className="text-xs font-mono font-bold text-gray-600 flex items-center justify-center gap-1">
                <Lock className="w-4 h-4 text-gray-400" />
                Día Bloqueado
              </span>
              <p className="text-xs text-gray-500">
                Se desbloqueará secuencialmente tras completar el Día {selectedDay - 1}.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

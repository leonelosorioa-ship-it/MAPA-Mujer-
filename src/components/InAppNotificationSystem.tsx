import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Compass, HeartHandshake, MessageCircle, Quote, ChevronRight } from "lucide-react";
import { CLARA_LUZ_PROFILE } from "../data/claraLuzProfile";

export interface InAppNotificationSystemProps {
  userName?: string;
  currentDay?: number;
  isDayLocked?: boolean;
  isProgramCompleted?: boolean;
  onGoToTest?: () => void;
  onOpenTool?: (toolId: string) => void;
  onOpenClaraLuzChat?: () => void;
}

type NotificationType = "clinical" | "practical_tool" | "clara_luz" | "testimonial";

interface NotificationItem {
  id: string;
  type: NotificationType;
  badge: string;
  badgeColor: string;
  title: string;
  message: string;
  ctaText?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBorder: string;
  actionKey?: "test" | "tool" | "clara";
  toolId?: string;
}

const TESTIMONIALS = [
  {
    quote: "Gracias a M.A.P.A. logré desarticular mis ataques de pánico nocturnos y recuperar mi tranquilidad.",
    author: "Mariana R."
  },
  {
    quote: "Comprender la respuesta de mi sistema nervioso cambió por completo la relación que tengo con mi ansiedad.",
    author: "Elena V."
  },
  {
    quote: "El ejercicio de 3 minutos de desactivación me regresó la paz en un momento de sobrecarga laboral.",
    author: "Carla P."
  }
];

export const InAppNotificationSystem: React.FC<InAppNotificationSystemProps> = ({
  userName = "Querida Usuaria",
  currentDay = 1,
  isDayLocked = false,
  isProgramCompleted = false,
  onGoToTest,
  onOpenTool,
  onOpenClaraLuzChat
}) => {
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);

  // Clean user first name for friendly personalization
  const cleanFirstName = (() => {
    if (!userName || !userName.trim()) return "Querida Usuaria";
    const firstWord = userName.trim().split(/\s+/)[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  })();

  useEffect(() => {
    // Session storage limits: Max 2 notifications per active browser session
    const SESSION_COUNT_KEY = "MAPA_INAPP_NOTIF_SESSION_COUNT";
    const SHOWN_IDS_KEY = "MAPA_INAPP_NOTIF_SHOWN_IDS";

    const getSessionCount = (): number => {
      try {
        const val = sessionStorage.getItem(SESSION_COUNT_KEY);
        return val ? parseInt(val, 10) : 0;
      } catch {
        return 0;
      }
    };

    const setSessionCount = (count: number) => {
      try {
        sessionStorage.setItem(SESSION_COUNT_KEY, count.toString());
      } catch (e) {
        console.warn("sessionStorage unaccessible:", e);
      }
    };

    const getShownIds = (): string[] => {
      try {
        const val = sessionStorage.getItem(SHOWN_IDS_KEY);
        return val ? JSON.parse(val) : [];
      } catch {
        return [];
      }
    };

    const addShownId = (id: string) => {
      try {
        const current = getShownIds();
        if (!current.includes(id)) {
          sessionStorage.setItem(SHOWN_IDS_KEY, JSON.stringify([...current, id]));
        }
      } catch (e) {
        console.warn("sessionStorage unaccessible:", e);
      }
    };

    // Build available notification pool based on state
    const buildPool = (): NotificationItem[] => {
      const pool: NotificationItem[] = [];

      // 1. Clinical / Assistance (Test del Día Listo) - if unlocked and program not finished
      if (!isDayLocked && !isProgramCompleted) {
        pool.push({
          id: `test_ready_day_${currentDay}`,
          type: "clinical",
          badge: "EVALUACIÓN DISPONIBLE",
          badgeColor: "bg-[#36C4D8]/15 text-[#208898] border-[#36C4D8]/30",
          title: `¡Hola ${cleanFirstName}! ✨`,
          message: `Tu evaluación del Día ${currentDay} ya está lista para realizar. Tómate 3 minutos para registrar tus avances.`,
          ctaText: "Ir al Test de Hoy ✨",
          icon: Compass,
          accentBorder: "border-l-4 border-l-[#36C4D8] border-[#36C4D8]/30",
          actionKey: "test"
        });
      }

      // 2. Practical Tool / Task
      pool.push({
        id: "practical_tool_garden",
        type: "practical_tool",
        badge: "ACCIÓN PRÁCTICA",
        badgeColor: "bg-emerald-100/80 text-emerald-800 border-emerald-300",
        title: `Regálate un momento 🌸`,
        message: `${cleanFirstName}, es momento de regalarte 3 minutos para tu práctica de hoy en el Jardín de Paz y regular tu sistema nervioso.`,
        ctaText: "Ir a la Herramienta 🌿",
        icon: HeartHandshake,
        accentBorder: "border-l-4 border-l-emerald-500 border-emerald-200",
        actionKey: "tool",
        toolId: "peace_garden"
      });

      // 3. Clara Luz Direct Message
      pool.push({
        id: "clara_luz_message",
        type: "clara_luz",
        badge: "CLARA LUZ • MENTORA M.A.P.A.™ MUJER",
        badgeColor: "bg-[#6E488A]/15 text-[#6E488A] border-[#6E488A]/30",
        title: `Mensaje de Clara Luz 💜`,
        message: `${cleanFirstName}, Clara Luz está aquí. Quiero recordarte lo orgullosa que estoy de tu valentía en este proceso. Eres muy importante para mí y para esta comunidad.`,
        ctaText: "Enviar un Saludo a Clara Luz 💬",
        icon: MessageCircle,
        accentBorder: "border-l-4 border-l-[#6E488A] border-[#6E488A]/30",
        actionKey: "clara"
      });

      // 4. Real Testimonials (Purely Informative, NO CTA Button)
      const randomTestimonial = TESTIMONIALS[Math.floor(Math.random() * TESTIMONIALS.length)];
      pool.push({
        id: `testimonial_${randomTestimonial.author.replace(/\s+/g, "_")}`,
        type: "testimonial",
        badge: "COMUNIDAD M.A.P.A.™",
        badgeColor: "bg-amber-100/80 text-amber-900 border-amber-300",
        title: "Testimonio Real 💬",
        message: `"${randomTestimonial.quote}" — ${randomTestimonial.author}`,
        icon: Quote,
        accentBorder: "border-l-4 border-l-amber-400 border-amber-200"
      });

      return pool;
    };

    let timer1: NodeJS.Timeout | null = null;
    let timer2: NodeJS.Timeout | null = null;
    let autoDismissTimer: NodeJS.Timeout | null = null;

    const initialCount = getSessionCount();
    if (initialCount >= 2) {
      // Session limit reached
      return;
    }

    const shownIds = getShownIds();
    const candidatePool = buildPool().filter(n => !shownIds.includes(n.id));

    if (candidatePool.length === 0) return;

    // Helper to trigger showing a specific notification
    const triggerNotif = (notif: NotificationItem) => {
      setCurrentNotification(notif);
      addShownId(notif.id);
      const newCount = getSessionCount() + 1;
      setSessionCount(newCount);

      // Auto dismiss notification after 14 seconds if user doesn't close or act
      autoDismissTimer = setTimeout(() => {
        setCurrentNotification(null);
      }, 14000);
    };

    // 1st Notification Trigger (After initial 6s delay from page mount)
    if (initialCount === 0) {
      timer1 = setTimeout(() => {
        const notif1 = candidatePool[0];
        if (notif1) triggerNotif(notif1);
      }, 6000);
    } else if (initialCount === 1) {
      // 2nd Notification Trigger (At least 35s delay)
      timer2 = setTimeout(() => {
        const notif2 = candidatePool[0];
        if (notif2) triggerNotif(notif2);
      }, 35000);
    }

    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (autoDismissTimer) clearTimeout(autoDismissTimer);
    };
  }, [userName, currentDay, isDayLocked]);

  const handleDismiss = () => {
    setCurrentNotification(null);
  };

  const handleAction = () => {
    if (!currentNotification) return;

    const actionKey = currentNotification.actionKey;
    const toolId = currentNotification.toolId;

    setCurrentNotification(null);

    if (actionKey === "test" && onGoToTest) {
      onGoToTest();
    } else if (actionKey === "tool" && onOpenTool) {
      onOpenTool(toolId || "peace_garden");
    } else if (actionKey === "clara" && onOpenClaraLuzChat) {
      onOpenClaraLuzChat();
    }
  };

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          key={currentNotification.id}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-96"
        >
          <div className={`relative bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl shadow-purple-950/20 border ${currentNotification.accentBorder} space-y-3 text-left overflow-hidden`}>
            
            {/* Top Row: Badge + Close Button */}
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentNotification.badgeColor} inline-flex items-center gap-1.5`}>
                <currentNotification.icon className="w-3 h-3" />
                {currentNotification.badge}
              </span>

              <button
                onClick={handleDismiss}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Content */}
            <div className="flex items-start gap-3">
              {currentNotification.type === "clara_luz" && (
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#E36DB4] shrink-0 bg-[#56346F] shadow-sm mt-0.5">
                  <img
                    src={CLARA_LUZ_PROFILE.image}
                    alt="Clara Luz Mentora"
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
              )}
              <div className="space-y-1 pr-1 flex-1 min-w-0">
                <h4 className="font-display font-bold text-sm text-[#56346F] flex items-center gap-1.5">
                  {currentNotification.title}
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {currentNotification.message}
                </p>
              </div>
            </div>

            {/* Action CTA Button (If present: NOT for testimonials) */}
            {currentNotification.ctaText && (
              <div className="pt-1">
                <button
                  onClick={handleAction}
                  className="w-full py-2.5 px-3.5 rounded-xl font-display font-bold text-xs bg-[#6E488A] hover:bg-[#56346F] text-white transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>{currentNotification.ctaText}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

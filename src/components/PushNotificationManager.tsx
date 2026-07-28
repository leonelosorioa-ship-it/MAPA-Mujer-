import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Sparkles, 
  X, 
  Sun, 
  Heart, 
  Brain, 
  Info, 
  Check, 
  AlertCircle, 
  Zap, 
  Clock, 
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Activity,
  Shield,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NotificationPermissionManager } from "./NotificationPermissionManager";

interface PushNotice {
  id: string;
  title: string;
  body: string;
  category: "reminder" | "motivational" | "unlocked" | "Alerta Motivacional" | "Guía Rápida de Emergencia" | "Anticipación Pre-Pico";
  receivedAt?: string;
}

const CONSEJOS_MOTIVACIONALES = [
  "La ansiedad no es un defecto. Es un sistema de alerta protegiéndote.",
  "La calma no es vaciar la mente, sino educar tu reacción física.",
  "Respirar con exhalaciones de 6 segundos le dice a tu cuerpo que está seguro.",
  "Soltar el control es confiar en que sabrás guiarte ante lo imprevisto.",
  "Tu tensión disminuye cuando decides no actuar con prisa automática.",
  "Regalarte 5 minutos de silencio vacía el exceso de estímulos del día.",
  "Entender cómo reaccionas es el primer paso hacia la calma profunda.",
  "⭐ Testimonio - Elena R. (38 años): 'El Día 3 de M.A.P.A.™ desactivó mi taquicardia por sobrepensamiento en minutos.'",
  "🏆 Caso de Éxito - Valeria G.: 'Tras completar los 7 días de respiración lenta del M.A.P.A.™, mi tensión cervical bajó un 65%.'",
  "⭐ Testimonio - Natalia S. (45 años): 'El informe de M.A.P.A.™ me ayudó a explicarle a mi familia lo que sentía de forma objetiva.'",
  "🏆 Caso de Éxito - Camila L.: 'Gracias a las anclas de calma del Día 6 logré volver a conducir tranquila y enfocada.'"
];

const SIMULATED_ALERTS: Omit<PushNotice, "id">[] = [
  { title: "⏰ Recordatorio del Día", body: "Es momento de sintonizar tus factores corporales del Día actual en M.A.P.A.™", category: "Guía Rápida de Emergencia" },
  { title: "🍃 Anclaje Corporal de Calma", body: "Sugerencia: Haz 3 ciclos de respiración lenta exhalando de forma sonora y prolongada.", category: "Alerta Motivacional" },
  { title: "🔑 Nuevo Descubrimiento Abierto", body: "Tu análisis evolutivo psicoterapéutico del día anterior está listo.", category: "Alerta Motivacional" },
  { title: "⭐ Testimonio Confortador", body: "Lorena (52 años): 'Comprender mi M.A.P.A.™ me devolvió el sueño reparador en solo 3 días.'", category: "Alerta Motivacional" },
  { title: "🏆 Caso de Éxito de la Comunidad", body: "Claudia V. redujo su rumia de alerta un 70% regulando sus hábitos de control rígidos.", category: "Guía Rápida de Emergencia" }
];

export interface PushNotificationManagerProps {
  userEmail?: string;
  currentDay?: number;
  isDayLocked?: boolean;
  onGoToDay?: (dayNum: number) => void;
  completionTimestamps?: Record<number, string>;
  exerciseLogs?: Array<{ taskName: string; timestamp: string; feeling: string }>;
}

const getActionDetails = (title: string, body: string, currentDay: number = 1, isDayLocked: boolean = false) => {
  const fullText = (title + " " + body).toLowerCase();
  
  const isDailyTestReady = fullText.includes("prueba") || 
                            fullText.includes("test") || 
                            fullText.includes("sintonizar") || 
                            fullText.includes("ejercicio") || 
                            fullText.includes("anclaje") ||
                            fullText.includes("disponible");
                            
  const isDiscoveryReady = fullText.includes("descubrimiento") || 
                            fullText.includes("análisis") || 
                            fullText.includes("evolutivo") || 
                            fullText.includes("resultado") || 
                            fullText.includes("listo") || 
                            fullText.includes("lista");

  if (isDailyTestReady) {
    if (isDayLocked) {
      return {
        label: `⏳ Ver Tiempo para Día ${currentDay}`,
        actionType: "waiting_lock"
      };
    }
    return {
      label: `✨ Realizar Prueba del Día ${currentDay}`,
      actionType: "daily_test"
    };
  } else if (isDiscoveryReady) {
    return {
      label: `🔑 Acceder a mi Descubrimiento`,
      actionType: "discovery"
    };
  }
  
  if (isDayLocked) {
    return {
      label: `📅 Ver Progreso del Viaje`,
      actionType: "waiting_lock"
    };
  }

  return {
    label: `🚀 Iniciar Tarea de Hoy`,
    actionType: "generic"
  };
};

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ 
  userEmail,
  currentDay = 1,
  isDayLocked = false,
  onGoToDay,
  completionTimestamps,
  exerciseLogs
}) => {
  const [activeNotice, setActiveNotice] = useState<PushNotice | null>(null);
  const [activeQuote, setActiveQuote] = useState(CONSEJOS_MOTIVACIONALES[0]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [notificationScheduled, setNotificationScheduled] = useState(false);
  const [hideBox, setHideBox] = useState(false);
  const [historyList, setHistoryList] = useState<PushNotice[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Pre-peak stress push notification state
  const [isPrePeakEnabled, setIsPrePeakEnabled] = useState(() => {
    try {
      return localStorage.getItem("mapa_pre_peak_push_enabled") === "true";
    } catch {
      return true;
    }
  });
  const [prePeakFeedback, setPrePeakFeedback] = useState<string | null>(null);

  // PWA real Web Push double-confirmation and loading states
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Analyze historical activity timestamps to detect peak stress/activity hour
  const analyzePeakActivity = () => {
    const timestamps: Date[] = [];
    if (completionTimestamps) {
      Object.values(completionTimestamps).forEach((ts: string) => {
        if (ts) {
          const d = new Date(ts);
          if (!isNaN(d.getTime())) timestamps.push(d);
        }
      });
    }
    if (exerciseLogs && Array.isArray(exerciseLogs)) {
      exerciseLogs.forEach(log => {
        if (log.timestamp) {
          const d = new Date(log.timestamp);
          if (!isNaN(d.getTime())) timestamps.push(d);
        }
      });
    }
    try {
      const localLogs = localStorage.getItem("MAPA_ACTIVITY_TIMESTAMPS");
      if (localLogs) {
        const parsed: string[] = JSON.parse(localLogs);
        parsed.forEach((ts: string) => {
          const d = new Date(ts);
          if (!isNaN(d.getTime())) timestamps.push(d);
        });
      }
    } catch (e) {
      console.warn("Could not parse local activity timestamps:", e);
    }

    if (timestamps.length === 0) {
      return {
        hasEnoughData: false,
        peakHour: 17,
        peakFormatted: "17:00 hrs (Patrón Promedio Vespertino)",
        prePeakHour: 16,
        prePeakMinute: 15,
        prePeakFormatted: "16:15 hrs",
        suggestedTool: "Respiración Vagofocal de 3 minutos",
        sampleCount: 0
      };
    }

    const hourCounts: Record<number, number> = {};
    timestamps.forEach(d => {
      const hr = d.getHours();
      hourCounts[hr] = (hourCounts[hr] || 0) + 1;
    });

    let maxHr = 17;
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([hr, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        maxHr = parseInt(hr, 10);
      }
    });

    let preHr = maxHr - 1;
    let preMin = 15;
    if (preHr < 0) preHr = 23;

    const formatTime = (h: number, m: number = 0) => {
      const hStr = h.toString().padStart(2, "0");
      const mStr = m.toString().padStart(2, "0");
      return `${hStr}:${mStr} hrs`;
    };

    let tool = "Respiración Vagofocal de 3 min";
    if (maxHr >= 20 || maxHr < 6) {
      tool = "Sonidos Bicuanti y Guía del Sueño";
    } else if (maxHr >= 14) {
      tool = "Descompresión en el Jardín de Paz";
    }

    return {
      hasEnoughData: timestamps.length >= 2,
      peakHour: maxHr,
      peakFormatted: formatTime(maxHr, 0),
      prePeakHour: preHr,
      prePeakMinute: preMin,
      prePeakFormatted: formatTime(preHr, preMin),
      suggestedTool: tool,
      sampleCount: timestamps.length
    };
  };

  const peakAnalysis = analyzePeakActivity();

  const togglePrePeakPush = (enabled: boolean) => {
    setIsPrePeakEnabled(enabled);
    try {
      localStorage.setItem("mapa_pre_peak_push_enabled", enabled ? "true" : "false");
    } catch (e) {
      console.warn(e);
    }
    setPrePeakFeedback(enabled ? "✨ Alerta pre-pico activada exitosamente." : "Alerta pre-pico desactivada.");
    setTimeout(() => setPrePeakFeedback(null), 4000);
  };

  const triggerPrePeakTestPush = () => {
    const notice: PushNotice = {
      id: "pre_peak_" + Date.now(),
      title: "🍃 Anticipación M.A.P.A.™ - Alerta Pre-Pico de Tensión",
      body: `Detectamos que tu pico de actividad/tensión suele ocurrir cerca de las ${peakAnalysis.peakFormatted}. Te sugerimos regalare 3 minutos de ${peakAnalysis.suggestedTool} para mantener tu serenidad.`,
      category: "Anticipación Pre-Pico",
      receivedAt: new Date().toISOString()
    };

    setActiveNotice(notice);
    saveToHistory(notice);

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(notice.title, {
          body: notice.body,
          icon: "/icon-512.png"
        });
      } catch (e) {
        console.warn("Native notification fallback:", e);
      }
    }
  };

  // Load alert history from localStorage
  const loadHistory = () => {
    try {
      const historyStr = localStorage.getItem("mapa_alerts_history");
      if (historyStr) {
        setHistoryList(JSON.parse(historyStr));
      }
    } catch (e) {
      console.error("Error loading alert history:", e);
    }
  };

  // Save received alert to history registry in localStorage
  const saveToHistory = (notice: PushNotice) => {
    try {
      const historyStr = localStorage.getItem("mapa_alerts_history");
      let history: PushNotice[] = historyStr ? JSON.parse(historyStr) : [];
      
      // Prevent duplicates by checking id or title+body combination
      if (!history.some(h => h.id === notice.id || (h.title === notice.title && h.body === notice.body))) {
        const withTimestamp = {
          ...notice,
          receivedAt: notice.receivedAt || new Date().toISOString()
        };
        history = [withTimestamp, ...history].slice(0, 50); // Keep last 50
        localStorage.setItem("mapa_alerts_history", JSON.stringify(history));
        setHistoryList(history);
      }
    } catch (err) {
      console.error("Error saving alert to history:", err);
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem("mapa_alerts_history");
      setHistoryList([]);
    } catch (e) {
      console.error(e);
    }
  };

  // Read initial permission state and history on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
      const isSubscribed = localStorage.getItem("mapa_system_notifications") === "true";
      setNotificationScheduled(isSubscribed);
    }
    const isHidden = localStorage.getItem("mapa_hide_notification_offer") === "true";
    if (isHidden) {
      setHideBox(true);
    }
    loadHistory();
  }, []);

  // Poll real push notifications dispatched by admin from the backend server
  useEffect(() => {
    const fetchRealPushNotifications = async () => {
      try {
        const email = userEmail || localStorage.getItem("MAPA_CURRENT_USER_EMAIL") || "";
        const url = `/api/notifications?email=${encodeURIComponent(email)}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          // Get seen list
          const seenStr = localStorage.getItem("mapa_seen_push_ids");
          const seenIds: string[] = seenStr ? JSON.parse(seenStr) : [];
          
          // Find any unseen push message
          const unseen = data.notifications.filter((p: any) => !seenIds.includes(p.id));
          if (unseen.length > 0) {
            // Process the latest unseen notification
            const latest = unseen[unseen.length - 1];
            
            // Mark as seen
            seenIds.push(latest.id);
            localStorage.setItem("mapa_seen_push_ids", JSON.stringify(seenIds));
            
            // Map the category nicely
            let normCategory: "Alerta Motivacional" | "Guía Rápida de Emergencia" = "Alerta Motivacional";
            if (latest.category === "Guía Rápida de Emergencia" || latest.category === "reminder" || latest.category === "unlocked") {
              normCategory = "Guía Rápida de Emergencia";
            }

            const incomingNotice: PushNotice = {
              id: latest.id,
              title: latest.title,
              body: latest.body,
              category: normCategory,
              receivedAt: new Date().toISOString()
            };

            // Set active notice for in-app floating toast
            setActiveNotice(incomingNotice);

            // Persist received alert in the history local registry
            saveToHistory(incomingNotice);
            
            // Auto-dismiss after 8 seconds (fade-out)
            setTimeout(() => {
              setActiveNotice((current) => {
                if (current && current.id === latest.id) {
                  return null;
                }
                return current;
              });
            }, 8000);

            // Trigger native browser/mobile system notification if granted
            if (typeof window !== "undefined" && "Notification" in window && (Notification as any).permission === "granted") {
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready.then((reg) => {
                  reg.showNotification(latest.title, {
                    body: latest.body,
                    icon: "/icon-512.png",
                    badge: "/icon-512.png",
                    vibrate: [200, 100, 200]
                  } as any);
                }).catch((err) => {
                  console.warn("Service Worker notification failed, using fallback:", err);
                  try {
                    new Notification(latest.title, {
                      body: latest.body,
                      icon: "/icon-512.png"
                    });
                  } catch (e) {
                    console.error("Error showing native notification fallback:", e);
                  }
                });
              } else {
                try {
                  new Notification(latest.title, {
                    body: latest.body,
                    icon: "/icon-512.png"
                  });
                } catch (e) {
                  console.error("Error showing native notification:", e);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error polling real notifications:", err);
      }
    };

    // Poll immediately on mount
    fetchRealPushNotifications();

    // Poll every 25 seconds for responsive live community alerts (gentler on server and battery)!
    const interval = setInterval(fetchRealPushNotifications, 25000);
    return () => clearInterval(interval);
  }, [userEmail]);

  // Helper to subscribe the user to real Web Push on the server
  const subscribeToPushNotifications = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        console.warn("Service Workers not supported on this browser.");
        return;
      }

      // 1. Get public VAPID key from backend
      const keyRes = await fetch("/api/push-public-key");
      if (!keyRes.ok) throw new Error("Failed to load VAPID public key.");
      const { publicKey } = await keyRes.json();
      if (!publicKey) throw new Error("No public VAPID key returned from server.");

      // Helper function to decode URL safe Base64 key
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, "+")
          .replace(/_/g, "/");

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      // 2. Wait until service worker is active
      const registration = await navigator.serviceWorker.ready;
      
      // 3. Subscribe the device using pushManager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      console.log("🎯 Web Push Subscription successful:", subscription);

      // 4. Post the endpoint subscription object to link it to the user's profile
      const currentEmail = userEmail || localStorage.getItem("MAPA_CURRENT_USER_EMAIL") || "anonymous";
      const subscribeRes = await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentEmail.toLowerCase().trim(),
          subscription: subscription
        })
      });

      if (subscribeRes.ok) {
        console.log("💾 Subscription successfully stored in database!");
      } else {
        console.warn("Failed to persist subscription on server.");
      }
    } catch (err) {
      console.error("Error during real Web Push subscription setup:", err);
    }
  };

  // Re-sync user email link automatically if email becomes available
  useEffect(() => {
    const syncExistingSubscription = async () => {
      if (permissionStatus === "granted" && "serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            const currentEmail = userEmail || localStorage.getItem("MAPA_CURRENT_USER_EMAIL") || "anonymous";
            await fetch("/api/push-subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: currentEmail.toLowerCase().trim(),
                subscription: subscription
              })
            });
            console.log("🔄 Re-synced existing push subscription with user profile:", currentEmail);
          }
        } catch (e) {
          console.warn("Could not sync existing subscription:", e);
        }
      }
    };
    syncExistingSubscription();
  }, [userEmail, permissionStatus]);

  // Handle Paso B: Request real permission and register Web Push subscription
  const executeRealPermissionRequest = async () => {
    setShowSoftPrompt(false);
    if (!("Notification" in window)) {
      alert("Tu dispositivo o navegador no soporta notificaciones de sistema.");
      return;
    }

    try {
      setIsSubscribing(true);
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === "granted") {
        localStorage.setItem("mapa_system_notifications", "true");
        setNotificationScheduled(true);
        localStorage.setItem("mapa_hide_notification_offer", "true");
        setHideBox(true);
        
        // Subscribe to real push notifications via service worker
        await subscribeToPushNotifications();
        
        // Show immediate native confirmation on browser
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification("🎯 Alertas de Paz Mental Activas", {
              body: "Configuración exitosa. Recibirás apoyo de la Mentora Clara en tu pantalla.",
              icon: "/icon-512.png",
              badge: "/icon-512.png",
              vibrate: [200, 100, 200]
            } as any);
          }).catch(() => {
            try {
              new Notification("🎯 Alertas de Paz Mental Activas", {
                body: "Configuración exitosa. Recibirás apoyo de Clara Luz • Mentora M.A.P.A.™ Mujer en tu pantalla.",
                icon: "/icon-512.png"
              });
            } catch (e) {
              console.error(e);
            }
          });
        } else {
          try {
            new Notification("🎯 Alertas de Paz Mental Activas", {
              body: "Configuración exitosa. Recibirás apoyo de la Mentora Clara en tu pantalla.",
              icon: "/icon-512.png"
            });
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        alert("Permiso de notificaciones denegado. Puedes cambiarlo en los ajustes de tu navegador.");
      }
    } catch (err) {
      console.error("Error requesting notifications:", err);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Simulated daily push triggers (one time demo for checking)
  const triggerDemoNotification = () => {
    if (permissionStatus === "granted") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification("⏰ ¡Tu prueba M.A.P.A.™ está lista!", {
            body: "Dedica 3 minutos hoy para reducir la tensión de tu mente y cuerpo. (Una alerta al día)",
            icon: "/icon-512.png",
            badge: "/icon-512.png",
            vibrate: [300, 100, 300],
            tag: "mapa-daily"
          } as any);
        }).catch(() => {
          try {
            new Notification("⏰ ¡Tu prueba M.A.P.A.™ está lista!", {
              body: "Dedica 3 minutos hoy para reducir la tensión de tu mente y cuerpo. (Una alerta al día)",
              icon: "/icon-512.png",
              tag: "mapa-daily"
            });
          } catch (e) {
            console.error(e);
          }
        });
      } else {
        try {
          new Notification("⏰ ¡Tu prueba M.A.P.A.™ está lista!", {
            body: "Dedica 3 minutos hoy para reducir la tensión de tu mente y cuerpo. (Una alerta al día)",
            icon: "/icon-512.png",
            tag: "mapa-daily"
          });
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      triggerSimulatedPush();
    }
  };

  // Rotate motivational quotes every 35 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const idx = Math.floor(Math.random() * CONSEJOS_MOTIVACIONALES.length);
      setActiveQuote(CONSEJOS_MOTIVACIONALES[idx]);
    }, 35000);

    return () => clearInterval(timer);
  }, []);

  // We no longer trigger automatic simulated push notifications in the background 
  // to avoid annoying users with constant popups. They can still test manually using the demo button.
  useEffect(() => {
    // No automatic popups for a peaceful user experience
  }, []);

  const triggerSimulatedPush = () => {
    const randomIdx = Math.floor(Math.random() * SIMULATED_ALERTS.length);
    const alertBase = SIMULATED_ALERTS[randomIdx];
    
    // Normalize category
    let normCategory: "Alerta Motivacional" | "Guía Rápida de Emergencia" = "Alerta Motivacional";
    if (alertBase.category === "Guía Rápida de Emergencia" || alertBase.category === "reminder" || alertBase.category === "unlocked") {
      normCategory = "Guía Rápida de Emergencia";
    }

    const newSimNotice: PushNotice = {
      id: "toast_" + Math.random().toString(36).substring(2, 9),
      title: alertBase.title,
      body: alertBase.body,
      category: normCategory,
      receivedAt: new Date().toISOString()
    };

    setActiveNotice(newSimNotice);
    saveToHistory(newSimNotice);

    // Auto dismiss toast after 8 seconds of ambient display (fade-out)
    setTimeout(() => {
      setActiveNotice((current) => {
        if (current && current.id === newSimNotice.id) {
          return null;
        }
        return current;
      });
    }, 8000);
  };

  // Get category specific info (labels, colors, icons)
  const getCategoryTheme = (category: string) => {
    if (category === "Anticipación Pre-Pico") {
      return {
        label: "Anticipación Inteligente Pre-Pico",
        themeColor: "#6E488A", // Purple / Indigo
        icon: (
          <div className="relative shrink-0 flex items-center justify-center w-10 h-10 bg-[#6E488A]/10 rounded-full">
            <Activity className="w-6 h-6 text-[#6E488A] animate-pulse" />
          </div>
        )
      };
    } else if (category === "Alerta Motivacional" || category === "motivational") {
      return {
        label: "Alerta Motivacional M.A.P.A.",
        themeColor: "#45B2B6", // Turquoise
        icon: (
          <div className="relative shrink-0 flex items-center justify-center w-10 h-10 bg-[#45B2B6]/10 rounded-full">
            <Heart className="w-8 h-8 text-[#45B2B6] fill-[#45B2B6] animate-pulse" />
          </div>
        )
      };
    } else {
      return {
        label: "Guía Rápida de Emergencia",
        themeColor: "#E86FA3", // Neon Magenta / Rose
        icon: (
          <div className="relative shrink-0 flex items-center justify-center w-10 h-10 bg-[#E86FA3]/10 rounded-full animate-bounce">
            <Zap className="w-8 h-8 text-[#E86FA3] fill-[#E86FA3]" />
          </div>
        )
      };
    }
  };

  return (
    <div className="space-y-4" id="push_notices_manager">

      {/* Interactive Permission & Diagnostic Manager */}
      <NotificationPermissionManager 
        userEmail={userEmail}
        onStatusChange={(status) => {
          setPermissionStatus(status);
          if (status === "granted") {
            setNotificationScheduled(true);
          }
        }}
      />
      
      {/* NOTIFICACIONES PREVENTIVAS PRE-PICO DE TENSIÓN (BASADAS EN HISTÓRICO) */}
      <div className="bg-gradient-to-br from-[#56346F]/5 via-white to-[#36C4D8]/5 border border-[#56346F]/15 rounded-2xl p-5 sm:p-6 text-left relative overflow-hidden shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#56346F]/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#56346F]/10 text-[#56346F] rounded-xl shrink-0">
              <Activity className="w-5 h-5 text-[#56346F] animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-[#E36DB4] uppercase tracking-wider block">
                DETECCIÓN INTELIGENTE DE PATRÓN HISTÓRICO
              </span>
              <h4 className="font-display font-extrabold text-base sm:text-lg text-[#56346F]">
                Alertas Preventivas Pre-Pico de Tensión
              </h4>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
            <span className="text-xs font-mono text-[#56346F]/70 font-semibold">
              {isPrePeakEnabled ? "ACTIVADA" : "DESACTIVADA"}
            </span>
            <button
              onClick={() => togglePrePeakPush(!isPrePeakEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer border-none outline-none ${
                isPrePeakEnabled ? "bg-[#36C4D8]" : "bg-slate-300"
              }`}
              aria-label="Conmutar alertas pre-pico de tensión"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isPrePeakEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#56346F]/85 leading-relaxed font-normal">
          M.A.P.A.™ analiza el histórico de tus horarios de evaluación y prácticas para identificar tu ventana biológica de mayor sensibilidad. Enviamos una sugerencia de calma <strong className="text-[#6E488A]">45 minutos antes</strong> de tu pico de estrés habitual para prevenir la sobrecarga antes de que comience.
        </p>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-[#56346F]/10 space-y-1">
            <div className="flex items-center justify-between text-[#56346F]/60 text-[10px] font-mono font-bold uppercase">
              <span>Hora de Mayor Actividad</span>
              <Clock className="w-3.5 h-3.5 text-[#E86FA3]" />
            </div>
            <div className="font-display font-black text-sm text-[#56346F]">
              {peakAnalysis.peakFormatted}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {peakAnalysis.hasEnoughData ? `Basado en ${peakAnalysis.sampleCount} registros` : "Patrón estimado inicial"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
            <div className="flex items-center justify-between text-emerald-800 text-[10px] font-mono font-bold uppercase">
              <span>Alerta Pre-Pico Sugerida</span>
              <Bell className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="font-display font-black text-sm text-emerald-900">
              {peakAnalysis.prePeakFormatted}
            </div>
            <span className="text-[10px] text-emerald-700 block font-medium">
              45 min antes de tu ventana de sobrecarga
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#EDE0F0]/50 border border-[#6E488A]/20 space-y-1">
            <div className="flex items-center justify-between text-[#6E488A] text-[10px] font-mono font-bold uppercase">
              <span>Herramienta Recomendada</span>
              <Sparkles className="w-3.5 h-3.5 text-[#6E488A]" />
            </div>
            <div className="font-display font-bold text-xs text-[#56346F] truncate">
              {peakAnalysis.suggestedTool}
            </div>
            <span className="text-[10px] text-[#6E488A]/80 block">
              Sugerida según la hora del día
            </span>
          </div>
        </div>

        {prePeakFeedback && (
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold text-center border border-emerald-300">
            {prePeakFeedback}
          </div>
        )}

        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#56346F]/10">
          <span className="text-[11px] text-[#56346F]/70 font-sans flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#36C4D8]" />
            Paz mental garantizada: máximo 1 notificación preventiva al día.
          </span>

          <button
            onClick={triggerPrePeakTestPush}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#56346F]/20 text-[#56346F] font-sans font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[#E86FA3]" />
            <span>Probar Notificación Pre-Pico Ahora</span>
          </button>
        </div>
      </div>
      
      {/* NATIVE SYSTEM NOTIFICATION CONFIGURATOR (PWA ALARM ENABLER) */}
      {!hideBox && (
        <div className="bg-white border border-[#6E488A]/12 rounded-2xl p-5 text-left relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#36C4D8]/5 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={() => {
              localStorage.setItem("mapa_hide_notification_offer", "true");
              setHideBox(true);
            }}
            className="absolute top-4 right-4 text-[#56346F]/50 hover:text-[#56346F] transition-colors cursor-pointer p-1 rounded-lg hover:bg-[#EDE0F0]/50 z-10 border-none bg-transparent outline-none"
            title="No volver a mostrar esta sección"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#E36DB4] font-bold uppercase tracking-wider block">
                NOTIFICACIÓN DIARIA FUERA DE LÍNEA
              </span>
              <h4 className="font-display font-semibold text-base sm:text-lg text-[#6E488A]">
                ¿Deseas recibir alertas en tu móvil u ordenador?
              </h4>
              <p className="text-sm text-[#56346F]/80 max-w-xl leading-relaxed">
                Te avisaremos <strong className="text-[#E36DB4]">una vez al día</strong> cuando la prueba diaria esté habilitada, <strong className="text-[#6E488A]">incluso si tienes la App cerrada</strong>.
              </p>
            </div>

            <div className="shrink-0">
              {notificationScheduled && permissionStatus === "granted" ? (
                <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-emerald-800">
                  <Check className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-semibold uppercase font-mono">ALERTAS ACTIVAS</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowSoftPrompt(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#36C4D8] hover:bg-[#2DB3C7] text-white font-display font-semibold text-sm transition-all shadow-sm hover:scale-[1.03] active:scale-[0.98] cursor-pointer block text-center border-none font-bold"
                >
                  🔔 ACTIVAR EN MI DISPOSITIVO
                </button>
              )}
            </div>
          </div>

          {/* Demo trigger helper */}
          <div className="mt-3 pt-3 border-t border-[#6E488A]/10 flex items-center justify-between">
            <p className="text-xs text-[#56346F]/60 font-sans flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#36C4D8]" />
              Solo recibirás 1 notificación local al día para no saturar tu sistema nervioso.
            </p>
            <button
              onClick={triggerDemoNotification}
              className="text-xs text-[#36C4D8] hover:text-[#2DB3C7] underline font-mono cursor-pointer bg-transparent border-none py-0 font-medium outline-none"
            >
              Probar alerta ahora
            </button>
          </div>
        </div>
      )}

      {/* COMPACT STYLISH DAILY FOCUS MOTIVATIONAL QUOTE ROW */}
      <div className="bg-[#EDE0F0]/30 border border-[#6E488A]/12 rounded-2xl p-5 flex items-start space-x-3 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#36C4D8]/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="p-2 bg-[#EDE0F0] border border-[#6E488A]/15 rounded-xl text-[#E36DB4] shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#6E488A] tracking-widest font-black uppercase">
            REFLEXIÓN Y CASOS DE ÉXITO DE LA COMUNIDAD M.A.P.A.™
          </span>
          <p className="text-sm text-[#56346F]/90 font-serif leading-relaxed tracking-wide italic font-medium">
            "{activeQuote}"
          </p>
        </div>
      </div>

      {/* BUZÓN / REGISTRO HISTÓRICO DE ALERTAS RECIBIDAS (Persistencia local) */}
      <div className="bg-[#56346F]/5 border border-[#56346F]/10 rounded-2xl p-5 text-left space-y-3 shadow-sm">
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex items-center justify-between bg-transparent border-none p-0 cursor-pointer text-left outline-none"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#E86FA3]" />
            <h4 className="font-display font-black text-sm text-[#56346F] uppercase tracking-wider flex items-center gap-1.5">
              <span>Buzón de Consejos y Alertas</span>
              {historyList.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-[#E86FA3] text-white rounded-full font-sans font-bold">
                  {historyList.length}
                </span>
              )}
            </h4>
          </div>
          <div className="text-[#56346F]/60">
            {isHistoryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isHistoryOpen && (
          <div className="pt-2 border-t border-[#56346F]/10 space-y-3 animate-slideDown">
            {historyList.length === 0 ? (
              <p className="text-xs text-[#56346F]/60 italic font-mono py-4 text-center">
                Aún no has recibido alertas motivacionales o de emergencia. Aparecerán aquí en tiempo real para que las consultes.
              </p>
            ) : (
              <>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[9px] font-mono text-[#56346F]/50">
                    Registro acumulado (Móvil y Escritorio local)
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-[10px] text-red-500 hover:text-red-700 font-mono flex items-center gap-1 cursor-pointer bg-transparent border-none py-0.5 outline-none"
                    title="Vaciar buzón de consejos recibidos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar buzón</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                  {historyList.map((alertItem) => {
                    const theme = getCategoryTheme(alertItem.category);
                    return (
                      <div 
                        key={alertItem.id} 
                        className="p-3.5 rounded-xl bg-white border border-[#56346F]/10 space-y-1 text-left relative overflow-hidden shadow-sm"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span 
                            className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                            style={{ color: theme.themeColor, backgroundColor: `${theme.themeColor}12` }}
                          >
                            {theme.label}
                          </span>
                          {alertItem.receivedAt && (
                            <span className="text-[9px] font-mono text-[#56346F]/50">
                              {new Date(alertItem.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <h5 className="font-display font-bold text-xs sm:text-sm text-[#56346F]">
                          {alertItem.title}
                        </h5>
                        <p className="text-xs text-[#0B152B]/85 leading-normal">
                          {alertItem.body}
                        </p>
                        {onGoToDay && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                onGoToDay(currentDay);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDE0F0] hover:bg-[#EDE0F0]/80 text-[#6E488A] font-sans font-extrabold text-[10px] tracking-wide transition-all cursor-pointer border-none shadow-xs"
                            >
                              <span>{getActionDetails(alertItem.title, alertItem.body, currentDay, isDayLocked).label}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#6E488A]" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* DIRECT IN-APP RETRACTABLE TOAST NOTIFICATION - Floating premium glassmorphism top banner */}
      <AnimatePresence>
        {activeNotice && (() => {
          const theme = getCategoryTheme(activeNotice.category);
          return (
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -80, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md p-5 rounded-2xl bg-white/80 backdrop-blur-md border-[1.5px] border-[#E86FA3] text-left shadow-2xl flex items-start gap-4"
              id="premium_floating_toast"
              style={{ boxShadow: "0 20px 45px -5px rgba(232, 111, 163, 0.18)" }}
            >
              {/* Left Column: Beating/bouncing 32px Icon based on category */}
              {theme.icon}

              {/* Center Column: Title in bold (#56346F) and Message in ultra legible dark text (#0B152B) */}
              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#E86FA3] font-black block">
                  {theme.label}
                </span>
                <h5 className="font-display font-black text-sm sm:text-base text-[#56346F] leading-snug">
                  {activeNotice.title}
                </h5>
                <p className="text-xs sm:text-sm text-[#0B152B] leading-relaxed font-medium">
                  {activeNotice.body}
                </p>

                {/* Botón de Llamado a la Acción Directo */}
                {onGoToDay && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onGoToDay(currentDay);
                        setActiveNotice(null); // Close toast on click
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E36DB4] to-[#6E488A] hover:opacity-95 text-white font-sans font-extrabold text-[11px] tracking-wide shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-none"
                    >
                      <span>{getActionDetails(activeNotice.title, activeNotice.body, currentDay, isDayLocked).label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white animate-pulse" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Close manual trigger button */}
              <button
                onClick={() => setActiveNotice(null)}
                className="text-[#56346F]/40 hover:text-[#56346F] hover:bg-[#56346F]/5 transition-all p-1.5 rounded-lg shrink-0 border-none bg-transparent cursor-pointer outline-none"
                title="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* SOFT PROMPT DOUBLE-CONFIRMATION MODAL (PASO A) */}
      <AnimatePresence>
        {showSoftPrompt && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSoftPrompt(false)}
              className="absolute inset-0 bg-[#0B152B]/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 relative overflow-hidden border-2 border-[#36C4D8] shadow-2xl space-y-5 text-center z-10"
            >
              {/* Elegant glow effect */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#36C4D8] to-[#E86FA3]" />
              
              {/* Glowing Bell icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-[#36C4D8]/10 flex items-center justify-center text-[#36C4D8]">
                <Bell className="w-8 h-8 animate-bounce text-[#36C4D8]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display font-black text-xl sm:text-2xl text-[#6E488A] tracking-tight leading-tight">
                  Activar Alertas de Paz Mental
                </h3>
                <p className="text-[#56346F]/90 text-sm leading-relaxed font-medium">
                  Clara Luz • Mentora M.A.P.A.™ Mujer te enviará recordatorios diarios de bienestar, consejos sintonizados y guías rápidas de emergencia para la ansiedad directamente a tu pantalla (móvil, PC o tablet), incluso si tienes la aplicación cerrada o el dispositivo bloqueado.
                </p>
              </div>

              {/* Security and privacy note */}
              <div className="bg-[#FAF7F9] border border-[#6E488A]/10 rounded-2xl p-3.5 text-[11px] text-[#56346F]/70 text-left space-y-1">
                <p className="font-bold text-[#6E488A] uppercase tracking-wider text-[10px] flex items-center gap-1">
                  🔒 Privacidad y Paz Garantizada
                </p>
                <p>
                  Utilizamos cifrado criptográfico de extremo a extremo. Recibirás únicamente 1 alerta de bienestar al día para proteger tu sistema nervioso.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={executeRealPermissionRequest}
                  disabled={isSubscribing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#36C4D8] to-[#E36DB4] text-white font-display font-bold tracking-wider hover:opacity-95 transition-all cursor-pointer shadow-md inline-flex items-center justify-center space-x-2 text-sm border-none"
                >
                  {isSubscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>CONFIGURANDO...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 text-white" />
                      <span>PERMITIR ALERTAS 🔔</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowSoftPrompt(false)}
                  disabled={isSubscribing}
                  className="w-full py-3 text-xs font-mono font-bold text-[#56346F]/60 hover:text-[#56346F] transition-colors bg-transparent border-none cursor-pointer outline-none"
                >
                  Quizás más tarde
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

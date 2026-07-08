import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Chrome, 
  Smartphone, 
  Laptop, 
  Info,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PermissionManagerProps {
  userEmail?: string;
  onStatusChange?: (status: NotificationPermission) => void;
}

export const NotificationPermissionManager: React.FC<PermissionManagerProps> = ({ 
  userEmail, 
  onStatusChange 
}) => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [swSupported, setSwSupported] = useState<boolean>(false);
  const [pushSupported, setPushSupported] = useState<boolean>(false);
  const [swActive, setSwActive] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [expandedBrowser, setExpandedBrowser] = useState<"chrome" | "safari" | "firefox" | null>(null);

  // Diagnostic check of SW and permission status
  const runDiagnostics = async () => {
    setIsChecking(true);
    
    // 1. Check if Notifications are supported
    const hasNotification = typeof window !== "undefined" && "Notification" in window;
    if (hasNotification) {
      setPermission(Notification.permission);
      if (onStatusChange) {
        onStatusChange(Notification.permission);
      }
    }

    // 2. Check if Service Worker is supported
    const hasSW = typeof navigator !== "undefined" && "serviceWorker" in navigator;
    setSwSupported(hasSW);

    if (hasSW) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        setSwActive(!!registration);
        
        // 3. Check if Push Manager is supported
        if (registration && "pushManager" in registration) {
          setPushSupported(true);
        } else {
          setPushSupported("PushManager" in window);
        }
      } catch (err) {
        console.warn("[Diagnostics] Error checking SW state:", err);
      }
    }

    setTimeout(() => {
      setIsChecking(false);
    }, 600);
  };

  useEffect(() => {
    runDiagnostics();
    
    // Listen for window visibility change to refresh permission automatically
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runDiagnostics();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Request browser permission for notifications
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Tu dispositivo o navegador no soporta notificaciones nativas.");
      return;
    }

    try {
      setIsChecking(true);
      const res = await Notification.requestPermission();
      setPermission(res);
      if (onStatusChange) {
        onStatusChange(res);
      }
      
      if (res === "granted") {
        // Trigger a nice diagnostic notification if service worker is active
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification("🔔 ¡Notificaciones de Paz Mental Activas!", {
            body: "Has configurado exitosamente tus recordatorios cotidianos en M.A.P.A.™ Mujer.",
            icon: "/icon-512.png",
            badge: "/icon-512.png"
          });
        }
      }
    } catch (err) {
      console.error("Error requesting notifications:", err);
    } finally {
      setIsChecking(false);
    }
  };

  const toggleBrowserInstructions = (browser: "chrome" | "safari" | "firefox") => {
    setExpandedBrowser(prev => prev === browser ? null : browser);
  };

  return (
    <div 
      id="notification_permission_manager_panel"
      className="bg-white border border-[#6E488A]/12 rounded-3xl p-6 text-left space-y-6 shadow-sm overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#36C4D8]/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#6E488A]/8 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDE0F0] flex items-center justify-center text-[#6E488A]">
            <Settings className="w-5 h-5 text-[#6E488A]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[#411F66] tracking-tight">
              Gestión de Alertas y Paz Mental
            </h3>
            <p className="text-xs text-[#56346F]/70 font-sans mt-0.5">
              Estado de sincronización y recepción de avisos PWA
            </p>
          </div>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={isChecking}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-[#6E488A]/20 hover:bg-[#EDE0F0]/50 text-[#6E488A] font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          title="Re-comprobar permisos en tiempo real"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6E488A] ${isChecking ? 'animate-spin' : ''}`} />
          <span>Sincronizar Estado</span>
        </button>
      </div>

      {/* Permission Status Alert Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-8 flex flex-col justify-between space-y-4">
          
          {/* Diagnostic status indicators */}
          <div className="space-y-3">
            {permission === "granted" && (
              <div className="flex items-start space-x-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-950 font-display">
                    Permiso Autorizado (Alerta Activa)
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    El sistema de notificaciones está correctamente vinculado con tu navegador. Recibirás apoyo diario y reflexiones sintonizadas por la Mentora Clara en tu pantalla.
                  </p>
                </div>
              </div>
            )}

            {permission === "default" && (
              <div className="flex items-start space-x-3 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                <Bell className="w-5 h-5 text-blue-500 mt-0.5 shrink-0 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-blue-950 font-display">
                    Permiso Pendiente de Configuración
                  </h4>
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    Aún no has activado las notificaciones. Habilítalas para recibir recordatorios puntuales sobre tu asimilación de los tests del M.A.P.A.™ sin tener que abrir la app constantemente.
                  </p>
                </div>
              </div>
            )}

            {permission === "denied" && (
              <div className="flex items-start space-x-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                <XCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-950 font-display">
                    Permiso Bloqueado por el Navegador
                  </h4>
                  <p className="text-xs text-rose-800 leading-relaxed font-medium">
                    Las alertas de bienestar han sido rechazadas. Por seguridad de tu navegador, la aplicación no puede pedirte permiso de nuevo. Sigue las instrucciones de abajo para desbloquearlas.
                  </p>
                </div>
              </div>
            )}

            {/* Technical Diagnostic indicators */}
            <div className="bg-[#FAF7F9] border border-[#6E488A]/8 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              <div>
                <span className="block text-[9px] font-mono text-[#56346F]/60 uppercase tracking-wider">Service Worker</span>
                <span className={`text-[11px] font-bold font-mono ${swSupported ? (swActive ? 'text-emerald-700' : 'text-amber-700') : 'text-rose-600'}`}>
                  {swSupported ? (swActive ? "● ACTIVO" : "● DISPONIBLE") : "✕ NO ADMITIDO"}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-mono text-[#56346F]/60 uppercase tracking-wider">Notificaciones Push</span>
                <span className={`text-[11px] font-bold font-mono ${pushSupported ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {pushSupported ? "● DISPONIBLES" : "✕ BLOQUEADO / NO"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-[9px] font-mono text-[#56346F]/60 uppercase tracking-wider">Ubicación Actual</span>
                <span className="text-[11px] font-bold font-mono text-[#6E488A] truncate block">
                  {userEmail ? userEmail.split("@")[0] : "Invitada"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Call for 'Default' */}
          {permission === "default" && (
            <button
              onClick={requestPermission}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#36C4D8] to-[#6E488A] hover:scale-[1.02] active:scale-[0.98] transition-all text-white font-display font-bold text-sm shadow-md cursor-pointer flex items-center justify-center space-x-2 border-none"
            >
              <Bell className="w-4 h-4 text-white animate-bounce" />
              <span>ACTIVAR ALERTAS DE PAZ MENTAL 🔔</span>
            </button>
          )}

          {/* Action Call for 'Granted' */}
          {permission === "granted" && (
            <div className="text-xs text-slate-500 italic font-medium flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Para cambiar los permisos, puedes pulsar el icono de ajustes/candado en la barra de direcciones de tu navegador.</span>
            </div>
          )}
        </div>

        {/* Informative Side Card */}
        <div className="md:col-span-4 bg-[#EDE0F0]/20 border border-[#6E488A]/10 rounded-2xl p-4 flex flex-col justify-between text-left space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#E36DB4] font-bold uppercase tracking-widest block">
              💡 MÉTODO DE CONTENCIÓN
            </span>
            <h5 className="font-display font-semibold text-sm text-[#411F66] leading-snug">
              ¿Por qué activar alertas?
            </h5>
            <p className="text-xs text-[#56346F]/85 leading-relaxed">
              La asimilación de la ansiedad toma tiempo. Al habilitar alertas diarias, tu mente recibe un anclaje físico oportuno en el momento justo del día, garantizando el éxito de tu proceso neuro-cognitivo de 7 días.
            </p>
          </div>
          
          <div className="text-[10px] text-[#56346F]/60 font-mono italic text-right">
            M.A.P.A.™ • Por Leonel Osorio Andrade
          </div>
        </div>
      </div>

      {/* Browser Step-by-Step Instructions when DENIED or optionally for any status */}
      <div className="space-y-4 pt-3 border-t border-[#6E488A]/10">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-[#E36DB4]" />
          <h4 className="font-display font-bold text-sm text-[#56346F] uppercase tracking-wider">
            ¿Cómo activar las notificaciones en tu Navegador?
          </h4>
        </div>
        
        <p className="text-xs text-[#56346F]/80 leading-normal max-w-2xl">
          Si bloqueaste las alertas anteriormente o no te aparece la ventana flotante de confirmación, sigue estos sencillos pasos para habilitarlas según tu navegador actual:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* CHROME / EDGE */}
          <div className="border border-[#6E488A]/10 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleBrowserInstructions("chrome")}
              className="w-full p-3.5 flex items-center justify-between text-left bg-[#FAF7F9]/50 hover:bg-[#FAF7F9] transition-colors border-none cursor-pointer outline-none"
            >
              <div className="flex items-center space-x-2">
                <Chrome className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-[#411F66] font-display">Chrome / Edge</span>
              </div>
              {expandedBrowser === "chrome" ? <ChevronUp className="w-3.5 h-3.5 text-[#6E488A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#6E488A]" />}
            </button>
            
            <AnimatePresence>
              {expandedBrowser === "chrome" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 pt-2 border-t border-[#6E488A]/8 text-left space-y-3"
                >
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-[#6E488A] uppercase font-mono tracking-wider flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-[#6E488A]" /> Desktop:
                    </p>
                    <ol className="list-decimal list-inside text-xs text-[#56346F]/80 space-y-1 pl-1 font-medium leading-relaxed">
                      <li>Haz clic en el icono del <strong>candado</strong> o de <strong>configuración de sitio</strong> a la izquierda de la URL (barra de direcciones).</li>
                      <li>Busca la opción de <strong>"Notificaciones"</strong>.</li>
                      <li>Cambia el interruptor a <strong>"Permitir"</strong> o <strong>"Activar"</strong>.</li>
                    </ol>
                  </div>
                  
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-[#6E488A] uppercase font-mono tracking-wider flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-[#6E488A]" /> Móvil (Android/Chrome):
                    </p>
                    <ol className="list-decimal list-inside text-xs text-[#56346F]/80 space-y-1 pl-1 font-medium leading-relaxed">
                      <li>Toca el botón de tres puntos (menú) arriba a la derecha y luego el icono de <strong>Información (i)</strong> o el candado.</li>
                      <li>Ingresa a <strong>"Permisos"</strong> o <strong>"Ajustes de Sitio"</strong>.</li>
                      <li>Presiona <strong>"Notificaciones"</strong> y cámbialo a <strong>"Permitido"</strong>.</li>
                    </ol>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SAFARI (iOS / macOS) */}
          <div className="border border-[#6E488A]/10 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleBrowserInstructions("safari")}
              className="w-full p-3.5 flex items-center justify-between text-left bg-[#FAF7F9]/50 hover:bg-[#FAF7F9] transition-colors border-none cursor-pointer outline-none"
            >
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-xs font-bold text-[#411F66] font-display">Safari (Apple)</span>
              </div>
              {expandedBrowser === "safari" ? <ChevronUp className="w-3.5 h-3.5 text-[#6E488A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#6E488A]" />}
            </button>
            
            <AnimatePresence>
              {expandedBrowser === "safari" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 pt-2 border-t border-[#6E488A]/8 text-left space-y-3"
                >
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-[#6E488A] uppercase font-mono tracking-wider flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-[#6E488A]" /> iPhone / iPad (iOS 16.4+):
                    </p>
                    <ol className="list-decimal list-inside text-xs text-[#56346F]/80 space-y-1 pl-1 font-medium leading-relaxed">
                      <li>Asegúrate de haber añadido esta app a tu pantalla de inicio (<strong>Compartir ➔ Añadir a pantalla de inicio</strong>).</li>
                      <li>Abre la aplicación desde el icono de tu pantalla de inicio.</li>
                      <li>Ve a los <strong>Ajustes generales de tu iPhone</strong> ➔ <strong>Notificaciones</strong> ➔ busca <strong>M.A.P.A.™</strong> y activa <strong>Permitir notificaciones</strong>.</li>
                    </ol>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-[#6E488A] uppercase font-mono tracking-wider flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-[#6E488A]" /> macOS (Mac):
                    </p>
                    <ol className="list-decimal list-inside text-xs text-[#56346F]/80 space-y-1 pl-1 font-medium leading-relaxed">
                      <li>Abre Safari y ve a <strong>Ajustes/Preferencias</strong> (Cmd + ,).</li>
                      <li>Haz clic en la pestaña <strong>Sitios Web</strong> y luego en <strong>Notificaciones</strong>.</li>
                      <li>Busca esta aplicación en la lista y cámbiala a <strong>Permitir</strong>.</li>
                    </ol>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MOZILLA FIREFOX */}
          <div className="border border-[#6E488A]/10 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleBrowserInstructions("firefox")}
              className="w-full p-3.5 flex items-center justify-between text-left bg-[#FAF7F9]/50 hover:bg-[#FAF7F9] transition-colors border-none cursor-pointer outline-none"
            >
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-xs font-bold text-[#411F66] font-display">Firefox</span>
              </div>
              {expandedBrowser === "firefox" ? <ChevronUp className="w-3.5 h-3.5 text-[#6E488A]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#6E488A]" />}
            </button>
            
            <AnimatePresence>
              {expandedBrowser === "firefox" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 pt-2 border-t border-[#6E488A]/8 text-left space-y-3"
                >
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-[#6E488A] uppercase font-mono tracking-wider flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-[#6E488A]" /> Escritorio y Móvil:
                    </p>
                    <ol className="list-decimal list-inside text-xs text-[#56346F]/80 space-y-1 pl-1 font-medium leading-relaxed">
                      <li>Haz clic en el icono del <strong>escudo o del candado</strong> que aparece a la izquierda de la URL en la barra superior.</li>
                      <li>Junto a "Permitido temporalmente" o "Bloqueado", presiona la <strong>X</strong> para eliminar el estado actual.</li>
                      <li>Recarga la página e intenta de nuevo haciendo clic en <strong>Activar Alertas</strong> arriba, para dar consentimiento formal.</li>
                    </ol>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

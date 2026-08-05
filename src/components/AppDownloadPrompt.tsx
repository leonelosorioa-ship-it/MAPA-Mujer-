import React, { useState, useEffect } from "react";
import { Download, Check, Smartphone, Monitor, X, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { CLARA_LUZ_PROFILE } from "../data/claraLuzProfile";

interface AppDownloadPromptProps {
  userEmail: string;
  hasDownloadedApp: boolean;
  onConfirmDownloaded: () => void;
}

type DeviceTab = "mobile" | "pc";

export const AppDownloadPrompt: React.FC<AppDownloadPromptProps> = ({
  userEmail,
  hasDownloadedApp,
  onConfirmDownloaded
}) => {
  const [isDismissedToday, setIsDismissedToday] = useState(false);
  const [isDismissedPermanently, setIsDismissedPermanently] = useState(() => {
    return localStorage.getItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT") === "true" ||
           localStorage.getItem("mapa_downloaded_pwa") === "true";
  });
  const [activeTab, setActiveTab] = useState<DeviceTab>("mobile");
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstallSuccess, setShowInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if dismissed for today
    const dismissedDate = localStorage.getItem("mapa_download_prompt_dismissed_date");
    const todayStr = new Date().toDateString();
    if (dismissedDate === todayStr) {
      setIsDismissedToday(true);
    }

    // Check if dismissed permanently
    const isPerm = localStorage.getItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT") === "true" ||
                   localStorage.getItem("mapa_downloaded_pwa") === "true";
    if (isPerm) {
      setIsDismissedPermanently(true);
    }

    // Capture standard PWA installation event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (hasDownloadedApp || isDismissedToday || showInstallSuccess || isDismissedPermanently) {
    if (showInstallSuccess) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-3xl p-6 text-center space-y-3 relative overflow-hidden"
          id="app_install_success_banner"
        >
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="inline-flex p-3 bg-emerald-500/20 rounded-2xl border border-emerald-400/30">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="font-display font-medium text-lg text-white">¡Gracias por instalar M.A.P.A.™!</h3>
          <p className="text-xs text-gray-300 max-w-lg mx-auto">
            La aplicación ha sido añadida a la base de registros. Ya no recibirás más recordatorios de descarga. ¡Disfruta de una experiencia ininterrumpida!
          </p>
        </motion.div>
      );
    }
    return null;
  }

  const handleDismissToday = () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem("mapa_download_prompt_dismissed_date", todayStr);
    setIsDismissedToday(true);
  };

  const handleNativeInstall = async () => {
    if (!installPromptEvent) {
      alert("Para instalar el sistema de forma directa, pulsa el botón de instalación o de menú (tres puntos) en tu navegador y selecciona 'Instalar aplicación' o 'Guardar en pantalla de inicio'.");
      return;
    }

    setIsInstalling(true);
    installPromptEvent.prompt();
    
    try {
      const choiceResult = await installPromptEvent.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("El usuario aceptó la instalación de la aplicación");
        handleConfirmSuccess();
      } else {
        console.log("El usuario rechazó la instalación de la aplicación");
      }
    } catch (err) {
      console.error("Error al ejecutar instalador nativo PWA:", err);
    } finally {
      setIsInstalling(false);
      setInstallPromptEvent(null);
    }
  };

  const handleConfirmSuccess = () => {
    setShowInstallSuccess(true);
    localStorage.setItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT", "true");
    localStorage.setItem("mapa_downloaded_pwa", "true");
    onConfirmDownloaded();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="p-[3px] rounded-3xl overflow-hidden shadow-[0_0_25px_rgba(69,179,183,0.75)] relative"
      id="app_download_daily_prompt"
    >
      {/* MOVING GLOWING BORDER / BORDE CON BRILLO GIRATORIO */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,#F38FBA,#FFFFFF,#7BE3EC,#FFE58F,#F38FBA)] opacity-100"
      />

      {/* INNER CONTAINER WITH BACKGROUND #45B3B7 */}
      <div className="relative bg-[#45B3B7] rounded-[21px] p-6 text-left space-y-6 shadow-inner text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Alert Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white bg-[#56346F] shrink-0 shadow-lg relative group">
              <img
                src={CLARA_LUZ_PROFILE.image}
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
                alt="Clara Luz - Mentora M.A.P.A.™"
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#E346A1] text-white border border-white/60 text-[9px] font-mono font-bold uppercase tracking-wider mb-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-white" />
                <span>Instalación Recomendada</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">Instala la App de M.A.P.A.™ en tu dispositivo</h3>
            </div>
          </div>
          
          {/* Dismiss trigger */}
          <button 
            onClick={handleDismissToday}
            className="p-1.5 bg-[#E346A1] hover:bg-[#c9368a] text-white rounded-full transition-all cursor-pointer border border-white/60 shadow-md"
            title="Ocultar esta sugerencia por hoy"
            id="btn_dismiss_download_today"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <p className="text-xs text-white/95 leading-relaxed font-sans max-w-2xl font-bold">
          Descarga la App para llevar mejor tu proceso de 7 días.
        </p>

      {/* Selector Tabs */}
      <div className="flex space-x-2 border-b border-[#6E488A]/10 pb-3">
        <button
          onClick={() => setActiveTab("mobile")}
          className={`flex items-center space-x-1.5 py-1.5 px-3.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border-none outline-none ${
            activeTab === "mobile" 
              ? "bg-[#EDE0F0] text-[#6E488A] border border-[#6E488A]/15" 
              : "text-[#56346F]/60 hover:text-[#56346F] hover:bg-[#FAF7F9]/50 bg-transparent"
          }`}
          id="btn_select_mobile_instructions"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Celular / Tablet</span>
        </button>
        <button
          onClick={() => setActiveTab("pc")}
          className={`flex items-center space-x-1.5 py-1.5 px-3.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border-none outline-none ${
            activeTab === "pc" 
              ? "bg-[#EDE0F0] text-[#6E488A] border border-[#6E488A]/15" 
              : "text-[#56346F]/60 hover:text-[#56346F] hover:bg-[#FAF7F9]/50 bg-transparent"
          }`}
          id="btn_select_pc_instructions"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>PC / Portátil</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-[#FAF7F9] border border-[#6E488A]/10 p-4 rounded-2xl text-xs space-y-3 font-sans leading-relaxed text-[#56346F]">
        {activeTab === "mobile" ? (
          <div className="space-y-2">
            <p className="font-semibold text-[#6E488A]">Instrucciones para Celular o Tablet (iOS & Android):</p>
            <ul className="list-decimal list-inside space-y-1 text-[#56346F]/80">
              <li>
                <span className="font-medium text-[#36C4D8]">Para iPhone / iPad (Safari)</span>: Toca el icono de <strong>Compartir</strong> <span className="text-base">📤</span> en la barra del navegador y luego selecciona <strong className="text-[#6E488A]">"Añadir a pantalla de inicio"</strong> <span className="text-base">➕</span>.
              </li>
              <li>
                <span className="font-medium text-[#36C4D8]">Para Android (Chrome)</span>: Toca los tres puntos de menú en la parte superior derecha y selecciona <strong className="text-[#6E488A]">"Instalar aplicación"</strong> o <strong className="text-[#6E488A]">"Añadir a la pantalla principal"</strong>.
              </li>
            </ul>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-semibold text-[#6E488A]">Instrucciones para PC o Computadora Portátil:</p>
            <ul className="list-decimal list-inside space-y-1 text-[#56346F]/80">
              <li>
                Haz clic en el icono de <strong className="text-[#6E488A]">Instalación</strong> 🖥️ que aparece en la parte de la derecha de tu barra de direcciones del navegador web (Chrome, Edge o Brave).
              </li>
              <li>
                O abre el menú de tres puntos de tu navegador web y selecciona la opción <strong className="text-[#36C4D8]">"Instalar M.A.P.A."</strong>.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Confirm and Download Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#EDE0F0]/30 border border-[#6E488A]/12 p-4 rounded-2xl">
        <div className="text-left">
          <p className="text-[11px] font-mono text-[#36C4D8] font-bold uppercase tracking-wider">¿Ya realizaste la descarga?</p>
          <p className="text-[10px] text-[#56346F]/60">Presiona confirmar para registrar la instalación y desactivar los recordatorios.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={installPromptEvent ? handleNativeInstall : () => handleDismissToday()}
            className="px-6 py-3 bg-gradient-to-r from-[#E346A1] via-[#FF5CB8] to-[#E346A1] hover:from-[#c9368a] hover:to-[#c9368a] text-white font-mono font-black text-sm sm:text-base rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-[0_4px_20px_rgba(227,70,161,0.6)] hover:shadow-[0_6px_28px_rgba(255,92,184,0.85)] hover:scale-[1.03] active:scale-[0.97] border-2 border-white group relative overflow-hidden"
            id="btn_trigger_pwa_install"
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
            />
            <Download className="w-5 h-5 text-white group-hover:bounce transition-transform shrink-0" />
            <span className="font-extrabold uppercase tracking-wider">{isInstalling ? "Instalando..." : "Descarga Aquí Tu App de M.A.P.A"}</span>
          </button>
          
          <button
            onClick={handleConfirmSuccess}
            className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-mono font-bold rounded-2xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] border border-white/60"
            id="btn_confirm_downloaded_action"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Confirmar Descarga</span>
          </button>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

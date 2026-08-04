import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, X, Bell, Share, PlusSquare, CheckCircle2 } from "lucide-react";

interface PWAInstallBannerProps {
  currentUserEmail?: string;
  hasDownloadedApp?: boolean;
  onConfirmDownloaded?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  currentUserEmail,
  hasDownloadedApp = false,
  onConfirmDownloaded
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [isDismissedPermanently, setIsDismissedPermanently] = useState(() => {
    return (
      localStorage.getItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT") === "true" ||
      localStorage.getItem("mapa_downloaded_pwa") === "true"
    );
  });

  // Load progress dynamically when currentUserEmail changes to see if downloaded
  useEffect(() => {
    if (currentUserEmail) {
      const emailKey = currentUserEmail.toLowerCase().trim();
      const savedProgress = localStorage.getItem(`MAPA_USER_PROGRESS_${emailKey}`);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          if (parsed && parsed.hasDownloadedApp) {
            setIsDismissedPermanently(true);
          }
        } catch (e) {
          console.error("[PWA] Error parsing user progress", e);
        }
      }
    }
  }, [currentUserEmail]);

  useEffect(() => {
    // 1. Check standalone mode (already installed & opened as standalone app)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();

    // 2. Listen for Chromium's native PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. Set EXACT 8-second delay (8000ms) before making banner visible
    const isDismissedThisSession = sessionStorage.getItem("MAPA_PWA_BANNER_DISMISSED") === "true";
    const isAlreadyDownloaded = hasDownloadedApp || isDismissedPermanently;

    let timer: NodeJS.Timeout | null = null;

    if (!standalone && !isAlreadyDownloaded && !isDismissedThisSession) {
      timer = setTimeout(() => {
        const isDismissedNow = sessionStorage.getItem("MAPA_PWA_BANNER_DISMISSED") === "true";
        const isDownloadedNow =
          localStorage.getItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT") === "true" ||
          localStorage.getItem("mapa_downloaded_pwa") === "true";

        if (!isDismissedNow && !isDownloadedNow) {
          setIsVisible(true);
        }
      }, 8000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isStandalone, hasDownloadedApp, isDismissedPermanently]);

  // Listen for successful installations
  useEffect(() => {
    const handleAppInstalled = () => {
      console.log("[PWA] App successfully installed!");
      setIsStandalone(true);
      setIsVisible(false);
      setShowGuideModal(false);
      localStorage.setItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT", "true");
      localStorage.setItem("mapa_downloaded_pwa", "true");
      setIsDismissedPermanently(true);
      if (onConfirmDownloaded) {
        onConfirmDownloaded();
      }
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [onConfirmDownloaded]);

  // Request Notification Permissions & Trigger PWA Install Flow
  const handleInstallClick = async () => {
    // 1. Ask for notification permission automatically
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      try {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          setNotificationGranted(true);
        }
      } catch (err) {
        console.log("[PWA] Notification permission error", err);
      }
    }

    // 2. Ensure Service Worker is registered
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (e) {
        console.log("[SW] Registration check", e);
      }
    }

    // 3. Trigger native install prompt or guide modal
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setIsVisible(false);
          setShowGuideModal(false);
          localStorage.setItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT", "true");
          localStorage.setItem("mapa_downloaded_pwa", "true");
          setIsDismissedPermanently(true);
          if (onConfirmDownloaded) {
            onConfirmDownloaded();
          }
        }
      } catch (err) {
        console.error("Error executing prompt", err);
        setShowGuideModal(true);
      }
    } else {
      // iOS / Desktop / Non-Chromium Fallback
      setShowGuideModal(true);
    }
  };

  const handleConfirmManualInstall = () => {
    localStorage.setItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT", "true");
    localStorage.setItem("mapa_downloaded_pwa", "true");
    setIsDismissedPermanently(true);
    setIsVisible(false);
    setShowGuideModal(false);
    if (onConfirmDownloaded) {
      onConfirmDownloaded();
    }
  };

  const handleDismiss = () => {
    sessionStorage.getItem("MAPA_PWA_BANNER_DISMISSED") || sessionStorage.setItem("MAPA_PWA_BANNER_DISMISSED", "true");
    localStorage.setItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT", "true");
    setIsDismissedPermanently(true);
    setIsVisible(false);
  };

  if (isStandalone || hasDownloadedApp || isDismissedPermanently) return null;

  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id="pwa_install_banner"
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.95 }}
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md p-[3px] rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(69,179,183,0.75)] backdrop-blur-md text-left transition-all duration-300 hover:shadow-[0_0_35px_rgba(243,143,186,0.9)]"
          >
            {/* MOVING GLOWING BORDER / BORDE CON BRILLO GIRATORIO */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,#F38FBA,#FFFFFF,#7BE3EC,#FFE58F,#F38FBA)] opacity-100"
            />

            {/* INNER CONTAINER WITH BACKGROUND #45B3B7 */}
            <div className="relative bg-[#45B3B7] rounded-[13px] p-2.5 sm:p-3.5 text-left text-white overflow-hidden shadow-inner">
              {/* Close button top-right */}
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 z-10 p-1 bg-[#F38FBA] hover:bg-[#e47ba6] text-white border border-white/60 rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center"
                title="Cerrar"
                id="pwa_banner_close_button"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>

              <div className="flex items-center gap-2.5 pr-7">
                {/* Clara Luz Profile Avatar */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-white/90 bg-white shrink-0 shadow-md">
                  <img
                    src="/clara-luz-profile.jpg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('/clara-luz-profile.jpg')) {
                        target.src = '/clara_luz.jpg';
                      } else if (target.src.includes('/clara_luz.jpg')) {
                        target.src = '/assets/clara-luz-profile.jpg';
                      }
                    }}
                    alt="Clara Luz - Mentora M.A.P.A.™"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-display font-black text-xs sm:text-sm text-white leading-tight">
                      M.A.P.A.™ Mujer
                    </h4>
                    <span className="bg-[#E346A1] text-white border border-white/60 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider shadow-sm">
                      RECOMENDADO
                    </span>
                  </div>
                  <p className="text-white/95 text-[11px] sm:text-xs leading-tight font-bold">
                    Descarga la App para llevar mejor tu proceso de 7 días.
                  </p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/20 flex justify-end">
                <button
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto py-2.5 px-5 bg-[#E346A1] hover:bg-[#c9368a] text-white font-mono font-black text-xs sm:text-sm rounded-xl tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg border-2 border-white/80"
                >
                  <Smartphone className="w-4 h-4 text-white" />
                  <span className="text-white font-bold">Descarga Aquí Tu App de M.A.P.A</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Installation Step-By-Step Guidance Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#FFF5F9] border-2 border-black rounded-3xl p-5 sm:p-6 max-w-sm w-full text-left shadow-2xl text-[#1C0630] relative overflow-hidden"
            >
              <button
                onClick={() => setShowGuideModal(false)}
                className="absolute top-3 right-3 p-1.5 bg-[#F38FBA] text-white border border-black rounded-full hover:bg-[#e47ba6] transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-black bg-white shrink-0 shadow-md">
                  <img
                    src="/clara-luz-profile.jpg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('/clara-luz-profile.jpg')) {
                        target.src = '/clara_luz.jpg';
                      } else if (target.src.includes('/clara_luz.jpg')) {
                        target.src = '/assets/clara-luz-profile.jpg';
                      }
                    }}
                    alt="Clara Luz - Mentora M.A.P.A.™"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-[#1C0630]">
                    Instalar M.A.P.A.™ Mujer
                  </h3>
                  <p className="text-xs font-bold text-[#E346A1]">
                    {isIOS ? "Para iPhone / iPad (Safari)" : "Para Móvil, Tablet o PC"}
                  </p>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-3 text-xs font-medium text-[#411F66] bg-white/80 p-3.5 rounded-2xl border border-black/15">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#F38FBA] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-black">1</div>
                    <p className="pt-0.5">Toca el botón <strong className="text-[#1C0630]">Compartir</strong> <Share className="w-3.5 h-3.5 inline text-[#F38FBA]" /> en la barra de tu navegador Safari.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#F38FBA] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-black">2</div>
                    <p className="pt-0.5">Desplázate hacia abajo y selecciona <strong className="text-[#1C0630]">Añadir a la pantalla de inicio</strong> <PlusSquare className="w-3.5 h-3.5 inline text-[#F38FBA]" />.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#F38FBA] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-black">3</div>
                    <p className="pt-0.5">Pulsa <strong className="text-[#1C0630]">Añadir</strong> en la esquina superior derecha para finalizar.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs font-medium text-[#411F66] bg-white/80 p-3.5 rounded-2xl border border-black/15">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#F38FBA] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-black">1</div>
                    <p className="pt-0.5">Abre el menú de tu navegador (los <strong className="text-[#1C0630]">tres puntos ⋮</strong> o la barra de direcciones).</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#F38FBA] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-black">2</div>
                    <p className="pt-0.5">Selecciona <strong className="text-[#1C0630]">"Instalar aplicación"</strong> o <strong className="text-[#1C0630]">"Guardar en pantalla principal"</strong>.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#F38FBA] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-black">3</div>
                    <p className="pt-0.5">Confirma la instalación para disfrutar de tu acceso directo y notificaciones.</p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-black/10 flex flex-col gap-2">
                <button
                  onClick={handleConfirmManualInstall}
                  className="w-full py-3 px-4 bg-[#E346A1] hover:bg-[#c9368a] text-white font-mono font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-lg border-2 border-black flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>¡Ya la Instalé! Entendido</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};


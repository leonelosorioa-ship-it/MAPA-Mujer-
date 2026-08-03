import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, X, Download } from "lucide-react";

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

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setIsVisible(false);
          localStorage.setItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT", "true");
          localStorage.setItem("mapa_downloaded_pwa", "true");
          setIsDismissedPermanently(true);
          if (onConfirmDownloaded) {
            onConfirmDownloaded();
          }
        }
      } catch (err) {
        console.error("Error executing prompt", err);
      }
    } else {
      alert("Para instalar M.A.P.A.™ en tu dispositivo, abre el menú de tu navegador (tres puntos u opción de compartir) y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
    }
  };

  const handleDismiss = () => {
    sessionStorage.getItem("MAPA_PWA_BANNER_DISMISSED") || sessionStorage.setItem("MAPA_PWA_BANNER_DISMISSED", "true");
    localStorage.setItem("MAPA_PWA_BANNER_DISMISSED_PERMANENT", "true");
    setIsDismissedPermanently(true);
    setIsVisible(false);
  };

  if (isStandalone || hasDownloadedApp || isDismissedPermanently) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="pwa_install_banner"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-lg bg-gradient-to-br from-[#FFF5F9] via-white to-[#FAF0F6] border-2 border-[#F0A5CB] rounded-3xl p-4 sm:p-5 shadow-2xl shadow-[#411F66]/15 backdrop-blur-xl text-left"
        >
          {/* Close button top-right */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-[#F0A5CB]/20 border border-[#F0A5CB]/40 text-[#411F66] rounded-full transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title="Cerrar"
            id="pwa_banner_close_button"
          >
            <X className="w-4 h-4 text-[#411F66]" />
          </button>

          <div className="flex items-center gap-3.5 pr-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F0A5CB]/20 border border-[#F0A5CB]/50 flex items-center justify-center shrink-0 shadow-sm text-[#E86FA3]">
              <Download className="w-6 h-6 text-[#E86FA3] animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-extrabold text-sm sm:text-base text-[#411F66]">
                  Descarga M.A.P.A.™ Mujer
                </h4>
                <span className="bg-[#E86FA3]/15 text-[#E86FA3] border border-[#E86FA3]/30 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
                  Recomendado
                </span>
              </div>
              <p className="text-[#56346F] text-xs sm:text-sm leading-snug font-medium">
                Descarga la App para llevar mejor tu proceso de 7 días.
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-[#F0A5CB]/25 flex justify-end">
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-[#E86FA3] via-[#F0A5CB] to-[#E36DB4] hover:opacity-95 text-white font-mono font-bold text-xs rounded-xl tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md border border-white/30"
            >
              <Smartphone className="w-4 h-4 text-white" />
              <span>DESCARGAR APP</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

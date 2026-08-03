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
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.95 }}
          whileHover={{ scale: 1.015 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-[#B0DCE2] border-2 border-black rounded-2xl p-2.5 sm:p-3.5 shadow-xl backdrop-blur-md text-left text-[#1C0630] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(243,143,186,0.6)]"
        >
          {/* Close button top-right */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 z-10 p-1 bg-[#F38FBA] hover:bg-[#e47ba6] text-white border border-black rounded-full transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title="Cerrar"
            id="pwa_banner_close_button"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>

          <div className="flex items-center gap-2.5 pr-7">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F38FBA] border border-black flex items-center justify-center shrink-0 shadow-sm text-white">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-display font-black text-xs sm:text-sm text-[#1C0630] leading-tight">
                  M.A.P.A.™ Mujer
                </h4>
                <span className="bg-[#F38FBA] text-white border border-black rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider shadow-sm">
                  RECOMENDADO
                </span>
              </div>
              <p className="text-[#1C0630] text-[11px] sm:text-xs leading-tight font-bold">
                Descarga la App para llevar mejor tu proceso de 7 días.
              </p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-black/15 flex justify-end">
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto py-2 px-4 bg-[#F38FBA] hover:bg-[#e47ba6] text-white font-mono font-black text-xs rounded-xl tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md border-2 border-black"
            >
              <Smartphone className="w-3.5 h-3.5 text-white" />
              <span className="text-white">Descarga Aquí Tu App de M.A.P.A</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

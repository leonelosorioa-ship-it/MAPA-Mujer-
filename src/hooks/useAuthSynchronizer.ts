import React, { useState, useEffect, useRef } from "react";
import { LeadInfo } from "../types";

export interface ProgramProgress {
  activationDate: string;
  currentDay: number;
  completedDays: number[];
  responses: Record<number, any[]>;
  leadInfo: LeadInfo;
  leadCaptured: boolean;
  completionTimestamps?: Record<number, string>;
  hasDownloadedApp?: boolean;
  unlockedAudios?: string[];
  dailyConclusionText?: Record<number, string>;
  onboardingCompletado?: boolean;
}

interface UseAuthSynchronizerProps {
  programProgress: ProgramProgress;
  setProgramProgress: React.Dispatch<React.SetStateAction<ProgramProgress>>;
  leadInfo: LeadInfo;
  setLeadInfo: React.Dispatch<React.SetStateAction<LeadInfo>>;
  leadCaptured: boolean;
  setLeadCaptured: React.Dispatch<React.SetStateAction<boolean>>;
  currentUserEmail: string;
  setCurrentUserEmail: React.Dispatch<React.SetStateAction<string>>;
  setPhase: (phase: string) => void;
  setDashboardNotice?: (notice: string | null) => void;
}

export function useAuthSynchronizer({
  programProgress,
  setProgramProgress,
  leadInfo,
  setLeadInfo,
  leadCaptured,
  setLeadCaptured,
  currentUserEmail,
  setCurrentUserEmail,
  setPhase,
  setDashboardNotice
}: UseAuthSynchronizerProps) {
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  
  const isSyncingFromServerRef = useRef<boolean>(false);
  const lastFetchedDataRef = useRef<string>("");

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      console.log("[M.A.P.A. Sync] Device came online. Triggering automatic sync.");
      // Auto sync when coming back online
      const userEmail = currentUserEmail || leadInfo.email;
      if (userEmail && programProgress.activationDate) {
        forceFetchProgress().then(() => {
          // Push any local changes to the cloud
          syncProgressToCloud(programProgress, userEmail);
        });
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      console.warn("[M.A.P.A. Sync] Device went offline. Falling back to local storage caching.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [currentUserEmail, leadInfo.email, programProgress]);

  // Deep comparison of two progress objects to avoid unnecessary React state updates
  const isProgressEqual = (p1: ProgramProgress, p2: ProgramProgress) => {
    if (!p1 || !p2) return false;
    return (
      p1.currentDay === p2.currentDay &&
      JSON.stringify(p1.completedDays) === JSON.stringify(p2.completedDays) &&
      JSON.stringify(p1.unlockedAudios || []) === JSON.stringify(p2.unlockedAudios || []) &&
      JSON.stringify(p1.responses) === JSON.stringify(p2.responses) &&
      p1.hasDownloadedApp === p2.hasDownloadedApp &&
      p1.onboardingCompletado === p2.onboardingCompletado
    );
  };

  // Centralized progression fetch (GET) logic to check and fetch latest server state
  const forceFetchProgress = async () => {
    const userEmail = currentUserEmail || leadInfo.email;
    const token = localStorage.getItem("MAPA_ACCESS_TOKEN");

    if (!userEmail || !token || isOffline) return;

    try {
      setSyncing(true);
      const res = await fetch("/api/get-user-progress", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        handleSessionExpiration();
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch user progress. Status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.userProgress) {
        const serverProgress: ProgramProgress = data.userProgress;
        
        // Ensure standard structure is met
        if (!serverProgress.leadInfo) {
          serverProgress.leadInfo = { nombre: "", email: userEmail, whatsapp: "" };
        }

        const serialized = JSON.stringify(serverProgress);
        
        // Only update states if server actually has different, updated values
        if (serialized !== lastFetchedDataRef.current && !isProgressEqual(programProgress, serverProgress)) {
          console.log("[M.A.P.A. Sync] Server state has changed or newer progress found. Hydrating state seamlessly.");
          lastFetchedDataRef.current = serialized;
          isSyncingFromServerRef.current = true;

          setProgramProgress(serverProgress);
          setLeadInfo(serverProgress.leadInfo);
          setLeadCaptured(true);
          
          // Save locally in cache and storage
          localStorage.setItem(`MAPA_USER_PROGRESS_${userEmail.toLowerCase().trim()}`, serialized);
          localStorage.setItem("MAPA_7DAY_PROGRESS_V2", serialized);

          if (setDashboardNotice) {
            setDashboardNotice("🔄 Tus datos se han sincronizado con tus otros dispositivos.");
            setTimeout(() => setDashboardNotice(null), 4000);
          }
        }
        setSyncError(null);
      }
    } catch (err: any) {
      console.warn("[M.A.P.A. Sync] Error fetching progress from server:", err);
      setSyncError("Error de sincronización con el servidor.");
    } finally {
      setSyncing(false);
    }
  };

  // Centralized progress upload (POST) logic
  const syncProgressToCloud = async (currentProgress: ProgramProgress, userEmail: string) => {
    if (!userEmail) return;
    
    const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
    
    // Save to local storage cache immediately for local durability / offline support
    const payloadString = JSON.stringify(currentProgress);
    localStorage.setItem(`MAPA_USER_PROGRESS_${userEmail.toLowerCase().trim()}`, payloadString);
    localStorage.setItem("MAPA_7DAY_PROGRESS_V2", payloadString);

    if (isOffline || !token) {
      console.log("[M.A.P.A. Sync] Device offline or unauthenticated. Cached progress locally.");
      return;
    }

    // Skip cloud syncing if this state update was actually triggered by a fetch from the server!
    if (isSyncingFromServerRef.current) {
      isSyncingFromServerRef.current = false;
      return;
    }

    const startTime = performance.now();
    let toastTimer: any = null;
    let didShowToast = false;

    if (setDashboardNotice) {
      toastTimer = setTimeout(() => {
        didShowToast = true;
        setDashboardNotice("⏳ Sincronizando con el servidor...");
      }, 2000);
    }

    try {
      setSyncing(true);
      const res = await fetch("/api/update-user-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: userEmail,
          programProgress: currentProgress
        })
      });

      if (res.status === 401 || res.status === 403) {
        handleSessionExpiration();
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to save progress. Status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setSyncError(null);
        lastFetchedDataRef.current = JSON.stringify(currentProgress);
      }
    } catch (err: any) {
      console.warn("[M.A.P.A. Sync] Cloud syncing failed, progress is safely saved locally:", err);
      setSyncError("Error al guardar cambios en la nube. Se guardaron de forma local.");
    } finally {
      if (toastTimer) {
        clearTimeout(toastTimer);
      }
      setSyncing(false);
      const endTime = performance.now();
      const elapsedMs = endTime - startTime;
      
      // Métrica de performance: Calcular el tiempo total de la petición de red
      console.log(`[M.A.P.A. Performance Metric] Tiempo total de petición de red: ${elapsedMs.toFixed(2)} ms`);
      
      // Si el tiempo supera los 2 segundos, garantizamos que se dispara o consolida el toast informativo
      if (elapsedMs > 2000) {
        console.warn(`[M.A.P.A. Performance Alert] La petición de red excedió el umbral de 2 segundos: ${elapsedMs.toFixed(2)} ms`);
        if (setDashboardNotice && !didShowToast) {
          setDashboardNotice("⏳ Sincronizando con el servidor...");
          didShowToast = true;
        }
      }
      
      if (didShowToast && setDashboardNotice) {
        setTimeout(() => {
          setDashboardNotice("🔄 ¡Sincronizado con éxito!");
          setTimeout(() => {
            setDashboardNotice(null);
          }, 2000);
        }, 500);
      }
    }
  };

  const handleSessionExpiration = () => {
    console.warn("[M.A.P.A. Sync] Access token expired or unauthorized. Logging out session.");
    localStorage.removeItem("MAPA_CURRENT_USER_EMAIL");
    localStorage.removeItem("MAPA_ACCESS_TOKEN");
    setCurrentUserEmail("");
    setPhase("LOGIN");
    
    if (setDashboardNotice) {
      setDashboardNotice("⚠️ Tu sesión de seguridad ha expirado. Por favor, inicia sesión de nuevo.");
      setTimeout(() => setDashboardNotice(null), 5000);
    } else {
      alert("Tu sesión ha expirado o acceso no autorizado. Por favor ingresa tus datos nuevamente.");
    }
  };

  // Sync state whenever programProgress changes locally (User-driven changes)
  useEffect(() => {
    if (programProgress.activationDate) {
      const userEmail = leadInfo.email || currentUserEmail;
      if (userEmail) {
        const payload: ProgramProgress = {
          ...programProgress,
          leadInfo,
          leadCaptured
        };
        syncProgressToCloud(payload, userEmail);
      }
    }
  }, [programProgress, leadInfo, leadCaptured, currentUserEmail]);

  // Setup periodic background checks and window focus event tracking
  useEffect(() => {
    const userEmail = currentUserEmail || leadInfo.email;
    if (!userEmail) return;

    // Check for changes on window/tab focus
    const handleWindowFocus = () => {
      if (document.visibilityState === "visible") {
        console.log("[M.A.P.A. Sync] Tab became active. Checking for device transitions.");
        forceFetchProgress();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleWindowFocus);

    // Periodic polling (every 30 seconds) in case of background updates
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        forceFetchProgress();
      }
    }, 30000);

    // Initial check on load
    forceFetchProgress();

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleWindowFocus);
      clearInterval(interval);
    };
  }, [currentUserEmail, leadInfo.email]);

  return {
    syncing,
    syncError,
    isOffline,
    syncProgressToCloud,
    forceFetchProgress
  };
}

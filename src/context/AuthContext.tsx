import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProgramProgress } from "../hooks/useAuthSynchronizer";

interface AuthContextType {
  token: string | null;
  currentUserEmail: string;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  isAdmin: boolean;
  userProgress: ProgramProgress | null;
  loginSession: (token: string, email: string, progress: ProgramProgress, isAdmin?: boolean) => void;
  logoutSession: () => void;
  verifySession: () => Promise<boolean>;
  updateLocalProgress: (progress: ProgramProgress) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem("MAPA_ACCESS_TOKEN") : null;
  });
  
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return typeof window !== "undefined" ? (localStorage.getItem("MAPA_CURRENT_USER_EMAIL") || "") : "";
  });
  
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const email = typeof window !== "undefined" ? (localStorage.getItem("MAPA_CURRENT_USER_EMAIL") || "") : "";
    return email.toLowerCase().trim() === "contacto@tupodermental.club";
  });

  const [userProgress, setUserProgress] = useState<ProgramProgress | null>(() => {
    if (typeof window === "undefined") return null;
    const email = localStorage.getItem("MAPA_CURRENT_USER_EMAIL") || "";
    if (email) {
      const saved = localStorage.getItem(`MAPA_USER_PROGRESS_${email.toLowerCase().trim()}`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error("Error parsing userProgress in AuthContext", e); }
      }
    }
    const legacy = localStorage.getItem("MAPA_7DAY_PROGRESS_V2");
    if (legacy) {
      try { return JSON.parse(legacy); } catch (e) { console.error("Error parsing legacy in AuthContext", e); }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const savedToken = localStorage.getItem("MAPA_ACCESS_TOKEN");
    const savedEmail = localStorage.getItem("MAPA_CURRENT_USER_EMAIL");
    return !!(savedToken && savedEmail);
  });

  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);

  const loginSession = (newToken: string, newEmail: string, progress: ProgramProgress, newIsAdmin = false) => {
    const cleanEmail = newEmail.toLowerCase().trim();
    localStorage.setItem("MAPA_ACCESS_TOKEN", newToken);
    localStorage.setItem("MAPA_CURRENT_USER_EMAIL", cleanEmail);
    if (progress) {
      localStorage.setItem(`MAPA_USER_PROGRESS_${cleanEmail}`, JSON.stringify(progress));
      localStorage.setItem("MAPA_7DAY_PROGRESS_V2", JSON.stringify(progress));
    }

    setToken(newToken);
    setCurrentUserEmail(cleanEmail);
    setUserProgress(progress);
    setIsAdmin(newIsAdmin || cleanEmail === "contacto@tupodermental.club");
    setIsAuthenticated(true);
  };

  const logoutSession = () => {
    console.log("[AuthContext] Revocando y limpiando credenciales de sesión local");
    const email = currentUserEmail || localStorage.getItem("MAPA_CURRENT_USER_EMAIL") || "";
    localStorage.removeItem("MAPA_ACCESS_TOKEN");
    localStorage.removeItem("MAPA_CURRENT_USER_EMAIL");
    if (email) {
      localStorage.removeItem(`MAPA_USER_PROGRESS_${email.toLowerCase().trim()}`);
    }
    localStorage.removeItem("MAPA_7DAY_PROGRESS_V2");

    setToken(null);
    setCurrentUserEmail("");
    setUserProgress(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
  };

  const updateLocalProgress = (newProg: ProgramProgress) => {
    setUserProgress(newProg);
    const email = currentUserEmail || (typeof window !== "undefined" ? localStorage.getItem("MAPA_CURRENT_USER_EMAIL") : "") || "";
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      localStorage.setItem(`MAPA_USER_PROGRESS_${cleanEmail}`, JSON.stringify(newProg));
      localStorage.setItem("MAPA_7DAY_PROGRESS_V2", JSON.stringify(newProg));
    }
  };

  const verifySession = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    const savedToken = localStorage.getItem("MAPA_ACCESS_TOKEN");
    const savedEmail = localStorage.getItem("MAPA_CURRENT_USER_EMAIL");

    if (!savedToken || !savedEmail) {
      setIsLoadingSession(false);
      setIsAuthenticated(false);
      return false;
    }

    try {
      console.log("[AuthContext] Verificando y auto-renovando sesión activa de 30 días con el servidor...");
      const res = await fetch("/api/user/verify-session", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${savedToken}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          console.log("✅ [AuthContext] Sesión verificada y token auto-renovado (30d):", data.email);
          const cleanEmail = (data.email || savedEmail).toLowerCase().trim();
          
          if (data.token) {
            localStorage.setItem("MAPA_ACCESS_TOKEN", data.token);
            setToken(data.token);
          }
          localStorage.setItem("MAPA_CURRENT_USER_EMAIL", cleanEmail);
          setCurrentUserEmail(cleanEmail);

          if (data.userProgress) {
            setUserProgress(data.userProgress);
            localStorage.setItem(`MAPA_USER_PROGRESS_${cleanEmail}`, JSON.stringify(data.userProgress));
            localStorage.setItem("MAPA_7DAY_PROGRESS_V2", JSON.stringify(data.userProgress));
          }

          setIsAdmin(!!data.isAdmin || cleanEmail === "contacto@tupodermental.club");
          setIsAuthenticated(true);
          setIsLoadingSession(false);
          return true;
        }
      } else if (res.status === 401 || res.status === 403) {
        console.warn("⚠️ [AuthContext] Servidor revocó la sesión (401/403). Limpiando token local.");
        logoutSession();
        setIsLoadingSession(false);
        return false;
      }
    } catch (err) {
      console.warn("⚠️ [AuthContext] Error de conexión al verificar token en el servidor. Preservando estado en caché de localStorage.", err);
      const cachedProgress = localStorage.getItem(`MAPA_USER_PROGRESS_${savedEmail.toLowerCase().trim()}`);
      if (cachedProgress) {
        try {
          setUserProgress(JSON.parse(cachedProgress));
        } catch (e) {
          console.error(e);
        }
      }
      setIsAuthenticated(true);
      setIsLoadingSession(false);
      return true;
    }

    setIsLoadingSession(false);
    return isAuthenticated;
  };

  useEffect(() => {
    verifySession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUserEmail,
        isAuthenticated,
        isLoadingSession,
        isAdmin,
        userProgress,
        loginSession,
        logoutSession,
        verifySession,
        updateLocalProgress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};

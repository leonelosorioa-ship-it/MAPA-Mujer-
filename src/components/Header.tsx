import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu,
  Camera, 
  User, 
  X, 
  Compass, 
  Sparkles,
  Home,
  Calendar,
  Layers,
  Heart,
  ChevronRight,
  Shield,
  Edit2,
  Check
} from "lucide-react";

export interface HeaderProps {
  currentUserEmail: string | null;
  leadInfo: { nombre?: string; email?: string; [key: string]: any };
  programProgress: {
    customAvatar?: { type: "image" | "emoji"; value: string } | null;
    completedDays?: number[];
    [key: string]: any;
  };
  saveCustomAvatar: (avatar: { type: "image" | "emoji"; value: string }) => void;
  setIsProfileSettingsOpen?: (open: boolean) => void;
  setIsSupportDrawerOpen?: (open: boolean) => void;
  onOpenNotifications?: () => void;
  handleUserLogout?: () => void;
  setPhase?: (phase: string) => void;
  setLoginEmail?: (email: string) => void;
  setLeadInfo?: (info: any) => void;
  setProgramProgress?: (updater: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUserEmail,
  leadInfo,
  programProgress,
  saveCustomAvatar,
  setIsSupportDrawerOpen,
  setPhase,
  setLoginEmail,
  setLeadInfo,
  setProgramProgress
}) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(leadInfo?.nombre || "");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    if (leadInfo?.nombre) {
      setTempName(leadInfo.nombre);
    }
  }, [leadInfo?.nombre]);

  // Track window scroll position to shrink/expand header interactively
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper to trigger tab change in Dashboard
  const triggerTabChange = (tab: "home" | "program" | "tools" | "profile") => {
    if (setPhase) {
      setPhase("DASHBOARD");
    }
    window.dispatchEvent(new CustomEvent("mapa_nav_tab", { detail: tab }));
    setIsSideMenuOpen(false);
  };

  // Handle image upload and compression (PNG, JPG, WEBP <= 5MB)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert("Por favor selecciona un archivo de imagen válido (PNG, JPG o WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5 MB.");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const TARGET_SIZE = 360;
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.88);

          // 1. Immediately update local state
          saveCustomAvatar({ type: "image", value: compressedBase64 });

          // 2. Sync to backend API (/api/user/profile-picture & /api/user/update-profile-picture)
          if (currentUserEmail) {
            const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const payload = {
              email: currentUserEmail,
              profilePicture: compressedBase64,
              customAvatar: { type: "image", value: compressedBase64 }
            };

            fetch("/api/user/profile-picture", {
              method: "PATCH",
              headers,
              body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
              console.log("📸 [Header] Profile picture synced successfully via PATCH:", data);
            })
            .catch(() => {
              fetch("/api/user/update-profile-picture", {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
              }).catch((err) => console.error("Error syncing profile picture:", err));
            });
          }

          setUploading(false);
          setUploadSuccessToast(true);

          setTimeout(() => {
            setUploadSuccessToast(false);
          }, 3500);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = tempName.trim();
    if (cleanName && setLeadInfo) {
      const updatedLead = { ...leadInfo, nombre: cleanName };
      setLeadInfo(updatedLead);
      if (setProgramProgress) {
        setProgramProgress((prev: any) => ({
          ...prev,
          leadInfo: updatedLead
        }));
      }
    }
    setIsEditingName(false);
  };

  const userName = leadInfo?.nombre || "Usuaria";
  const userInitials = userName.slice(0, 2).toUpperCase();
  const completedCount = programProgress?.completedDays?.length || 0;
  const isAdmin = currentUserEmail?.toLowerCase() === "contacto@tupodermental.club";

  return (
    <>
      {/* FIXED / STICKY INTERACTIVE HEADER WITH DYNAMIC COLOR - #FBC2E7 WHEN MENU IS OPEN */}
      <header 
        id="app_header" 
        className={`sticky top-0 z-50 w-full text-white shadow-md border-b border-white/30 transition-all duration-300 ${
          isSideMenuOpen ? "bg-[#FBC2E7]" : "bg-[#F0A5CB]"
        } ${
          isScrolled ? "px-3 py-1.5 sm:px-5 sm:py-2" : "px-4 py-3.5 sm:px-6 sm:py-4.5"
        }`}
      >
        {/* HIDDEN INPUT FOR PROFILE PICTURE UPLOAD */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageFileChange}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
        />

        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center relative">
          
          {/* HAMBURGER MENU BUTTON (TOP-LEFT CORNER WITH HIGH VISIBILITY & REPRESENTATION) */}
          <button
            type="button"
            onClick={() => setIsSideMenuOpen(true)}
            className={`absolute left-0 bg-white text-[#3E1B5A] hover:bg-[#FAF0FB] active:scale-95 border-2 border-white shadow-md rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer focus:outline-none z-10 ${
              isScrolled 
                ? "top-0.5 px-2.5 py-1 text-[11px] sm:text-xs font-black" 
                : "top-0.5 sm:top-1 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-black"
            }`}
            title="Abrir Menú Principal M.A.P.A.™"
            aria-label="Abrir Menú de Navegación"
          >
            <Menu className={isScrolled ? "w-4 h-4 text-[#3E1B5A] stroke-[2.8]" : "w-4.5 h-4.5 text-[#3E1B5A] stroke-[2.8]"} />
            <span className="font-display font-black text-[#3E1B5A] tracking-wide">Menú</span>
          </button>

          {/* TOP CENTER MAIN HERO USER PROFILE PHOTO (PROTAGONIST AVATAR WITH DOUBLE ANIMATED RINGS & BREATHING ROOM) */}
          <motion.div 
            onClick={() => {
              if (!currentUserEmail) {
                setLoginEmail?.("");
                setPhase?.("LOGIN");
              } else {
                fileInputRef.current?.click();
              }
            }}
            className={`relative rounded-full bg-white flex items-center justify-center shadow-md shadow-black/15 cursor-pointer group select-none shrink-0 transition-all duration-300 ${
              isScrolled 
                ? "w-8 h-8 sm:w-9 sm:h-9 my-0" 
                : "w-14 h-14 sm:w-16 sm:h-16 mt-0.5 mb-2"
            }`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            title="Haz clic para cambiar tu foto de perfil de usuaria"
          >
            {/* Outer Spinning Ring */}
            <div className="absolute -inset-1 rounded-full border-2 border-dashed border-white/90 animate-spin" style={{ animationDuration: '14s' }} />
            {/* Inner Reverse Spinning Ring */}
            <div className="absolute -inset-0.5 rounded-full border border-dotted border-[#36C4D8] animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />

            {/* USER PHOTO / EMOJI / PRETTY WOMAN DEFAULT EMOJI */}
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#FFF0F5] relative">
              {programProgress?.customAvatar?.type === "image" && programProgress.customAvatar.value ? (
                <img
                  src={programProgress.customAvatar.value}
                  alt={`Foto de ${userName}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : programProgress?.customAvatar?.type === "emoji" && programProgress.customAvatar.value ? (
                <span className={isScrolled ? "text-base sm:text-lg select-none" : "text-2xl sm:text-3xl select-none group-hover:scale-110 transition-transform"}>
                  {programProgress.customAvatar.value}
                </span>
              ) : (
                /* DEFAULT UNCHANGED AVATAR: PRETTY WOMAN EMOJI 👩🏻 */
                <span className={isScrolled ? "text-base sm:text-lg select-none leading-none" : "text-2xl sm:text-3xl select-none group-hover:scale-110 transition-transform leading-none"} role="img" aria-label="Usuaria M.A.P.A.">
                  👩🏻
                </span>
              )}

              {/* Camera Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
                <Camera className={isScrolled ? "w-3 h-3 text-white drop-shadow" : "w-4 h-4 text-white drop-shadow"} />
              </div>
            </div>

            {/* Active Dot indicator */}
            <span className={`absolute bottom-0 right-0 bg-emerald-500 rounded-full ring-2 ring-white shadow-xs z-10 ${isScrolled ? "w-2.5 h-2.5" : "w-3.5 h-3.5"}`} title="Usuaria Activa">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
          </motion.div>

          {/* MAIN BRAND TITLE & SUBTITLE */}
          <div className={isScrolled ? "flex items-center justify-center gap-2 my-0.5" : "flex flex-col items-center justify-center my-1"}>
            <h1 className={isScrolled ? "font-display font-black text-sm sm:text-base tracking-wider text-white drop-shadow-xs leading-none" : "font-display font-black text-lg sm:text-xl md:text-2xl tracking-wider text-white drop-shadow-xs leading-none"}>
              M.A.P.A. <span className="text-[#3E1B5A] font-extrabold">Mujer</span>
            </h1>
            {!isScrolled && (
              <span className="text-[9px] sm:text-[10px] text-white/95 font-mono tracking-widest uppercase font-black drop-shadow-xs mt-1">
                MAPA DE ACTIVACIÓN Y PROTECCIÓN EMOCIONAL
              </span>
            )}
          </div>

          {/* BOTTOM INTERACTIVE PILLS RAIL */}
          <div className={isScrolled ? "flex flex-wrap items-center justify-center gap-1.5 w-full max-w-lg mt-0.5" : "flex flex-wrap items-center justify-center gap-2.5 w-full max-w-lg mt-1.5 pb-0.5"}>
            
            {/* PILL 1: USER NAME & COMPASS BADGE */}
            <div className={`inline-flex items-center gap-1.5 bg-white text-[#411F66] rounded-full font-bold shadow-sm border border-white/60 ${
              isScrolled ? "py-0.5 px-2.5 text-[10px] sm:text-xs" : "py-1 px-3 text-xs"
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Usuaria Activa" />
              
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="border-b border-[#da5ef2] text-[#411F66] bg-transparent font-sans font-black text-xs focus:outline-none max-w-[90px] px-0.5 py-0"
                    autoFocus
                    maxLength={30}
                  />
                  <button type="submit" className="text-emerald-600 font-bold text-xs p-0.5">
                    <Check className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => setIsEditingName(false)} className="text-red-500 font-bold text-xs p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1">
                  <span 
                    onClick={() => {
                      setTempName(userName);
                      setIsEditingName(true);
                    }}
                    className={`font-black text-[#411F66] truncate max-w-[90px] sm:max-w-[130px] cursor-pointer hover:underline flex items-center gap-0.5 ${
                      isScrolled ? "text-[10px] sm:text-xs" : "text-xs"
                    }`}
                    title="Haz clic para editar tu nombre"
                  >
                    <span>{userName}</span>
                    <Edit2 className="w-2.5 h-2.5 text-[#da5ef2] opacity-75 shrink-0" />
                  </span>

                  {/* Completed days badge */}
                  <span className="bg-[#36C4D8]/15 text-[#27A1B2] px-1.5 py-0.2 rounded-full font-mono text-[9px] font-black flex items-center gap-0.5 shrink-0" title="Días completados">
                    <span>{completedCount}</span>
                    <span>✓</span>
                  </span>
                </div>
              )}

              {/* INTERACTIVE COMPASS AVATAR BADGE IN PILL */}
              <div 
                onClick={() => setPhase?.("DASHBOARD")}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#36C4D8]/20 flex items-center justify-center cursor-pointer text-[#27A1B2] hover:bg-[#36C4D8]/30 transition-colors shrink-0 ml-0.5"
                title="Brújula M.A.P.A.™"
              >
                <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
            </div>

            {/* PILL 2: ANIMATED "SISTEMA ACTIVO" BADGE */}
            <motion.span 
              animate={{ 
                boxShadow: [
                  "0px 2px 6px rgba(255,255,255,0.4), 0 0 0 1px rgba(255,255,255,0.3)",
                  "0px 4px 14px rgba(255,255,255,0.85), 0 0 0 2px rgba(255,255,255,0.5)",
                  "0px 2px 6px rgba(255,255,255,0.4), 0 0 0 1px rgba(255,255,255,0.3)"
                ],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "rgba(255, 255, 255, 1)",
                boxShadow: "0px 6px 18px rgba(255,255,255,0.95), 0 0 0 3px rgba(255,255,255,0.6)"
              }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center space-x-1.5 bg-white text-[#411F66] rounded-full font-mono font-black shadow-sm border border-white/60 cursor-pointer select-none transition-all shrink-0 ${
                isScrolled ? "py-0.5 px-2.5 text-[9px] sm:text-[10px]" : "py-1 px-3 text-[10px] sm:text-xs"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="tracking-widest uppercase font-black">
                SISTEMA ACTIVO
              </span>
            </motion.span>

          </div>
        </div>
      </header>

      {/* COMPACT LEFT SIDE MENU DRAWER (SLIDE-OUT FROM LEFT) */}
      <AnimatePresence>
        {isSideMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex">
            {/* BACKDROP OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSideMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            />

            {/* SIDE DRAWER CONTENT PANEL */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-80 max-w-[85vw] bg-white text-[#411F66] h-full shadow-2xl flex flex-col z-10 overflow-y-auto"
            >
              {/* DRAWER HEADER WITH #FBC2E7 COLOR */}
              <div className="bg-[#FBC2E7] p-5 text-white flex items-center justify-between border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
                    <Compass className="w-6 h-6 text-white animate-spin" style={{ animationDuration: "16s" }} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-display font-black text-xl tracking-wider text-white">
                      M.A.P.A.™
                    </span>
                    <span className="text-[10px] text-white/90 font-mono font-bold tracking-widest uppercase">
                      Navegación Principal
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSideMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* USER PROFILE SUMMARY CARD IN DRAWER */}
              {currentUserEmail && (
                <div 
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-[#FFF0F5] via-[#FAF0FB] to-[#F0FBFC] border border-[#E86FA3]/30 shadow-xs flex items-center gap-3 cursor-pointer hover:border-[#E86FA3] transition-colors group"
                  title="Haz clic para cambiar tu foto de perfil"
                >
                  <div className="relative w-12 h-12 rounded-full border-2 border-[#E86FA3] shrink-0 bg-white overflow-hidden flex items-center justify-center">
                    {programProgress?.customAvatar?.type === "image" ? (
                      <img
                        src={programProgress.customAvatar.value}
                        alt={`Avatar de ${userName}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : programProgress?.customAvatar?.type === "emoji" ? (
                      <span className="text-2xl">{programProgress.customAvatar.value}</span>
                    ) : (
                      <span className="font-display font-black text-base text-[#E86FA3] uppercase">
                        {userInitials}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-1 ring-white" />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <span className="font-black text-sm text-[#411F66] truncate">
                      {userName}
                    </span>
                    <span className="text-[11px] text-[#56346F]/80 font-mono truncate">
                      {currentUserEmail}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                        Usuaria Activa
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* MAIN NAVIGATION LINKS */}
              <div className="p-4 space-y-1.5 flex-1 text-left">
                <span className="text-[10px] font-mono font-bold text-[#E86FA3] uppercase tracking-wider px-3 mb-1 block">
                  Secciones del Sistema
                </span>

                {/* 1. INICIO (HOME) */}
                <button
                  type="button"
                  onClick={() => triggerTabChange("home")}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-[#411F66] hover:bg-[#FFF0F5] hover:text-[#E86FA3] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF0F5] text-[#E86FA3] group-hover:bg-[#E86FA3] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <span>Inicio / Panel Principal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#E86FA3] transition-colors" />
                </button>

                {/* 2. PROGRAMA DE 7 DIAS */}
                <button
                  type="button"
                  onClick={() => triggerTabChange("program")}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-[#411F66] hover:bg-[#FFF0F5] hover:text-[#E86FA3] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF0F5] text-[#E86FA3] group-hover:bg-[#E86FA3] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span>Programa de 7 Días</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Ruta Diaria de Regulación
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#E86FA3] transition-colors" />
                </button>

                {/* 3. HERRAMIENTAS Y AUDIOS DE SINTONIA */}
                <button
                  type="button"
                  onClick={() => triggerTabChange("tools")}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-[#411F66] hover:bg-[#F0FBFC] hover:text-[#27A1B2] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F0FBFC] text-[#27A1B2] group-hover:bg-[#27A1B2] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span>Herramientas & Audios</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Batería de Descompresión
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#27A1B2] transition-colors" />
                </button>

                {/* 4. CAMBIAR FOTO DE PERFIL */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-[#411F66] hover:bg-[#FFF0F5] hover:text-[#E86FA3] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF0F5] text-[#E86FA3] group-hover:bg-[#E86FA3] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span>Cambiar Foto de Perfil</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Subir imagen PNG, JPG o WEBP
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#E86FA3] transition-colors" />
                </button>

                <div className="my-3 border-t border-slate-100" />

                <span className="text-[10px] font-mono font-bold text-[#E86FA3] uppercase tracking-wider px-3 mb-1 block">
                  Acompañamiento & Ayuda
                </span>

                {/* 5. MENTORA CLARA LUZ & SOPORTE */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    setIsSupportDrawerOpen?.(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-[#411F66] hover:bg-[#FFF0F5] hover:text-[#E86FA3] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF0F5] text-[#E86FA3] group-hover:bg-[#E86FA3] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span>Mentora Clara Luz & Soporte</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Guías, Mensajes y WhatsApp Directo
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#E86FA3] transition-colors" />
                </button>

                {/* ADMIN PANEL BUTTON IF ADMIN */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSideMenuOpen(false);
                      setPhase?.("ADMIN");
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-[#27A1B2] bg-[#36C4D8]/10 hover:bg-[#36C4D8]/20 transition-colors cursor-pointer mt-2"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-[#27A1B2]" />
                      <span>Panel de Administrador</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#27A1B2]" />
                  </button>
                )}
              </div>

              {/* DRAWER FOOTER */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
                <div className="text-center pt-1">
                  <p className="text-[10px] text-slate-400 font-mono">
                    M.A.P.A.™ Mujer v2.5 • PWA
                  </p>
                  <p className="text-[10px] text-[#E86FA3] font-sans font-bold">
                    Clara Luz: Creadora, Fundadora y Mentora de M.A.P.A.™
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST ON UPLOAD */}
      <AnimatePresence>
        {uploadSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed left-1/2 -translate-x-1/2 top-20 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 z-50 border border-emerald-400"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>¡Foto de perfil actualizada con éxito!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

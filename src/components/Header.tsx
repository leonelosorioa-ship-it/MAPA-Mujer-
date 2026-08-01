import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Search, 
  Camera, 
  User, 
  Settings, 
  Headphones, 
  LogOut, 
  Shield, 
  Check, 
  X, 
  Compass, 
  Sparkles,
  Edit2
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
  setIsProfileSettingsOpen,
  setIsSupportDrawerOpen,
  onOpenNotifications,
  handleUserLogout,
  setPhase,
  setLoginEmail,
  setLeadInfo,
  setProgramProgress
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(leadInfo?.nombre || "");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync tempName when leadInfo changes
  useEffect(() => {
    if (leadInfo?.nombre) {
      setTempName(leadInfo.nombre);
    }
  }, [leadInfo?.nombre]);

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
        const TARGET_SIZE = 360; // Clean crisp square avatar
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          // Crop center square
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

            // Call PATCH endpoint as specified
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
              // Fallback to POST if needed
              fetch("/api/user/update-profile-picture", {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
              }).catch((err) => console.error("Error syncing profile picture:", err));
            });
          }

          setUploading(false);
          setUploadSuccessToast(true);
          setIsDropdownOpen(false);

          setTimeout(() => {
            setUploadSuccessToast(false);
          }, 3500);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset file input
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
    <header 
      id="app_header" 
      className="relative z-30 w-full border-b border-[#6E488A]/20 bg-gradient-to-r from-[#E86FA3] via-[#E36DB4] to-[#8A2B68] shadow-lg shadow-[#8A2B68]/15 px-4 py-3 sm:px-6 sm:py-4 transition-all"
    >
      {/* HIDDEN INPUT FOR PROFILE PICTURE UPLOAD */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* LEFT: BRAND & LOGO */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div 
            onClick={() => setPhase?.("DASHBOARD")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-spin" style={{ animationDuration: "16s" }} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl sm:text-2xl tracking-wider text-white drop-shadow-sm">
                  M.A.P.A.™
                </span>
                <span className="bg-white/20 text-white font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/30 tracking-wider uppercase">
                  Mujer
                </span>
              </div>
              <span className="text-[9px] sm:text-[11px] text-white/85 font-mono font-medium tracking-wide hidden xs:block">
                Mapa de Activación y Protección Emocional
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: TOP BAR ACTIONS (NOTIFICATIONS, SEARCH, AVATAR WITH ACTIVE STATUS BADGE) */}
        <div className="flex items-center gap-2 sm:gap-3.5 relative" ref={dropdownRef}>
          
          {/* SEARCH / COMPASS QUICK ICON */}
          <button
            type="button"
            onClick={() => setIsSupportDrawerOpen?.(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 flex items-center justify-center text-white transition-all shadow-sm cursor-pointer"
            title="Soporte y Guías de Ayuda"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* NOTIFICATION BELL ICON */}
          <button
            type="button"
            onClick={() => {
              if (onOpenNotifications) {
                onOpenNotifications();
              } else {
                setIsSupportDrawerOpen?.(true);
              }
            }}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 border border-white/25 flex items-center justify-center text-white transition-all shadow-sm cursor-pointer"
            title="Notificaciones y Avisos de Sintonía"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#36C4D8] ring-2 ring-[#8A2B68] animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#36C4D8] ring-2 ring-[#8A2B68]" />
          </button>

          {/* INTERACTIVE AVATAR CONTAINER WITH ONLINE ACTIVE GREEN BADGE */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!currentUserEmail) {
                  setLoginEmail?.("");
                  setPhase?.("LOGIN");
                } else {
                  setIsDropdownOpen(!isDropdownOpen);
                }
              }}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white/90 bg-gradient-to-tr from-[#EDE0F0] via-white to-[#36C4D8]/30 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer overflow-hidden group shrink-0 focus:outline-none"
              title={currentUserEmail ? `Cuenta de ${userName} • Haz clic para opciones` : "Iniciar Sesión"}
            >
              {currentUserEmail && programProgress?.customAvatar?.type === "image" ? (
                <img
                  src={programProgress.customAvatar.value}
                  alt={`Perfil de ${userName}`}
                  className="w-full h-full object-cover object-center rounded-full transition-transform duration-300 group-hover:scale-110"
                />
              ) : currentUserEmail && programProgress?.customAvatar?.type === "emoji" ? (
                <span className="text-lg sm:text-xl select-none transition-transform group-hover:scale-110">
                  {programProgress.customAvatar.value}
                </span>
              ) : currentUserEmail ? (
                <span className="font-display font-black text-xs sm:text-sm text-[#6E488A] tracking-wider uppercase">
                  {userInitials}
                </span>
              ) : (
                <User className="w-5 h-5 text-[#36C4D8]" />
              )}

              {/* OVERLAY ON HOVER FOR LOGGED IN USER */}
              {currentUserEmail && (
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
                  <Camera className="w-3.5 h-3.5 text-white drop-shadow" />
                </div>
              )}
            </button>

            {/* GREEN ACTIVE STATUS BADGE ("Usuaria Activa / En Sintonía") */}
            <span 
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white shadow-sm pointer-events-none z-10" 
              title="Usuaria Activa / En Sintonía"
            >
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
          </div>

          {/* FLOATING DROPDOWN POPOVER MENU */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 top-12 sm:top-13 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-[#6E488A]/15 p-4 z-50 text-left overflow-hidden"
              >
                {/* USER PROFILE HEADER IN DROPDOWN */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#FFF0F5] to-[#F3E8F5] border border-[#E86FA3]/20 mb-3">
                  <div className="relative w-12 h-12 rounded-full border-2 border-[#E36DB4] shadow-sm shrink-0 bg-white overflow-hidden flex items-center justify-center">
                    {programProgress?.customAvatar?.type === "image" ? (
                      <img
                        src={programProgress.customAvatar.value}
                        alt={`Avatar de ${userName}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : programProgress?.customAvatar?.type === "emoji" ? (
                      <span className="text-2xl">{programProgress.customAvatar.value}</span>
                    ) : (
                      <span className="font-display font-black text-base text-[#6E488A] uppercase">
                        {userInitials}
                      </span>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-1 ring-white" />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    {isEditingName ? (
                      <form onSubmit={handleSaveName} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="w-full text-xs font-bold text-[#6E488A] bg-white border border-[#E86FA3] rounded px-1.5 py-0.5 focus:outline-none"
                          autoFocus
                          maxLength={30}
                        />
                        <button type="submit" className="text-emerald-600 font-bold text-xs p-1">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setIsEditingName(false)} className="text-red-500 font-bold text-xs p-1">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-[#411F66] truncate">
                          {userName}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTempName(userName);
                            setIsEditingName(true);
                          }}
                          className="text-[#E86FA3] hover:text-[#8A2B68] p-0.5 cursor-pointer"
                          title="Editar nombre"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <span className="text-[11px] text-[#6E488A]/80 font-mono truncate">
                      {currentUserEmail}
                    </span>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        En Sintonía
                      </span>
                      <span className="text-[10px] font-mono text-[#6E488A] bg-white/80 px-1.5 py-0.5 rounded border border-[#6E488A]/10 font-bold">
                        {completedCount} Días ✓
                      </span>
                    </div>
                  </div>
                </div>

                {/* DROPDOWN MENU OPTIONS */}
                <div className="space-y-1">
                  {/* OPTION 1: CHANGE PROFILE PICTURE */}
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-[#411F66] hover:bg-[#FFF0F5] hover:text-[#E86FA3] transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FFF0F5] text-[#E86FA3] group-hover:bg-[#E86FA3] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>Cambiar foto de perfil</span>
                      <span className="text-[10px] text-[#6E488A]/70 font-normal">PNG, JPG o WEBP (Máx 5MB)</span>
                    </div>
                  </button>

                  {/* OPTION 2: ACCOUNT SETTINGS */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProfileSettingsOpen?.(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-[#411F66] hover:bg-[#FFF0F5] hover:text-[#E86FA3] transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F3E8F5] text-[#6E488A] group-hover:bg-[#6E488A] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>Configuración de mi cuenta</span>
                      <span className="text-[10px] text-[#6E488A]/70 font-normal">Avatar, datos y preferencias</span>
                    </div>
                  </button>

                  {/* OPTION 3: DIRECT ATTENTION / MENTOR SUPPORT */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsSupportDrawerOpen?.(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-[#411F66] hover:bg-[#FFF0F5] hover:text-[#E86FA3] transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#36C4D8]/15 text-[#27A1B2] group-hover:bg-[#27A1B2] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>Atención Directa & Soporte</span>
                      <span className="text-[10px] text-[#6E488A]/70 font-normal">Guías y contacto con Clara Luz</span>
                    </div>
                  </button>

                  {/* ADMIN PANEL IF APPLICABLE */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setPhase?.("ADMIN");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-[#36C4D8] hover:bg-[#36C4D8]/10 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#36C4D8]/20 text-[#27A1B2] flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span>Panel de Administrador</span>
                        <span className="text-[10px] text-[#27A1B2]/80 font-normal">Gestión global de usuarias</span>
                      </div>
                    </button>
                  )}

                  <div className="my-1 border-t border-[#6E488A]/10" />

                  {/* LOGOUT BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (handleUserLogout) {
                        handleUserLogout();
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* TOAST NOTIFICATION ON UPLOAD SUCCESS */}
      <AnimatePresence>
        {uploadSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 border border-emerald-400"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>¡Foto de perfil actualizada con éxito!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

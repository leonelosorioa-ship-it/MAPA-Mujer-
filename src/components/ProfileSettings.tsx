import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, Edit3, Upload, Trash2, Check, AlertCircle, LogOut, ShieldCheck, User, Smile, Sparkles } from "lucide-react";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  currentProfilePicture?: string | null;
  customAvatar?: { type: "emoji" | "image"; value: string } | null;
  defaultEmoji?: string;
  onProfileUpdated: (updatedData: { profilePicture?: string; customAvatar?: { type: "emoji" | "image"; value: string } }) => void;
  onLogout: () => void;
}

const PRESET_EMOJIS = [
  "🧘", "🌺", "☀️", "🦉", "🦁", "🦊", "🛡️", "🎨", "🚀", 
  "🦄", "🌻", "🌈", "💎", "🌟", "✨", "❤️", "🔮", "💡"
];

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName,
  currentProfilePicture,
  customAvatar,
  defaultEmoji = "🧘",
  onProfileUpdated,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<"photo" | "emoji">("photo");
  const [previewImage, setPreviewImage] = useState<string | null>(
    currentProfilePicture || (customAvatar?.type === "image" ? customAvatar.value : null)
  );
  const [selectedEmoji, setSelectedEmoji] = useState<string>(
    customAvatar?.type === "emoji" ? customAvatar.value : defaultEmoji
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // File Selection and Canvas Compression/Crop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setSaveSuccess(false);

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setFileError("Por favor selecciona una imagen válida (PNG, JPG o WEBP).");
      return;
    }

    // Validate size (Max 5 MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setFileError("La imagen seleccionada supera el límite máximo de 5 MB. Elige una foto más liviana.");
      return;
    }

    // Process & compress image via Canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const TARGET_SIZE = 350; // Square 350x350 crop
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Calculate center crop
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          // Draw crop to canvas
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE);

          // Get compressed Base64 Data URL
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setPreviewImage(compressedDataUrl);
          setActiveTab("photo");
        }
      };
      img.onerror = () => {
        setFileError("No se pudo procesar el archivo de imagen. Por favor intenta con otra foto.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save changes to backend
  const handleSaveProfilePicture = async () => {
    setIsSaving(true);
    setFileError(null);
    setSaveSuccess(false);

    const newAvatar = activeTab === "photo" && previewImage
      ? { type: "image" as const, value: previewImage }
      : { type: "emoji" as const, value: selectedEmoji };

    const payload = {
      email: userEmail,
      profilePicture: newAvatar.type === "image" ? newAvatar.value : null,
      customAvatar: newAvatar
    };

    try {
      const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/user/update-profile-picture", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo actualizar la foto de perfil en el servidor.");
      }

      // Update parent global state
      onProfileUpdated({
        profilePicture: newAvatar.type === "image" ? newAvatar.value : undefined,
        customAvatar: newAvatar
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error updating profile picture:", err);
      setFileError(err.message || "Error al conectar con el servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  // Clear uploaded picture
  const handleRemovePhoto = () => {
    setPreviewImage(null);
    setActiveTab("emoji");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white border border-[#6E488A]/20 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative text-left font-sans flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="h-2 bg-gradient-to-r from-[#6E488A] via-[#E86FA3] to-[#36C4D8]" />

          <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 bg-[#FAF7F9]">
            <div>
              <div className="flex items-center gap-2 text-[#E86FA3] text-xs font-bold uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plan de 7 Días M.A.P.A.™</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-display text-[#56346F]">
                Configuración de Perfil
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-[#56346F] hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1">
            {/* SECCIÓN 1: PERSONALIZACIÓN DE FOTO Y AVATAR (EN LA PARTE SUPERIOR) */}
            <div className="bg-[#FAF4FC] border border-[#E36DB4]/20 rounded-2xl p-6 text-center space-y-6 shadow-2xs relative overflow-hidden">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-[#56346F]">
                  Foto de Perfil & Avatar
                </h3>
                <p className="text-xs text-[#56346F]/70 max-w-sm mx-auto">
                  Personaliza la imagen con la que interactúas en tus sesiones y avances diarios.
                </p>
              </div>

              {/* Avatar Container with Characteristic M.A.P.A.™ Gradient Border */}
              <div className="relative inline-block mx-auto group">
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#6E488A] via-[#E86FA3] to-[#36C4D8] opacity-90 blur-xs group-hover:opacity-100 transition-opacity" />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-32 h-32 md:w-36 md:h-36 rounded-full bg-white border-2 border-white flex items-center justify-center text-5xl shadow-md overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform"
                  title="Haz clic para cambiar tu foto"
                >
                  {activeTab === "photo" && previewImage ? (
                    <img
                      src={previewImage}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span role="img" aria-label="Avatar emoji" className="animate-pulse">
                      {selectedEmoji}
                    </span>
                  )}

                  {/* Hover Camera Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                    <Camera className="w-6 h-6 animate-bounce" />
                    <span>Cambiar Foto</span>
                  </div>
                </div>

                {/* Corner Edit Button Badge */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-gradient-to-r from-[#6E488A] to-[#E86FA3] text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer"
                  title="Subir foto desde dispositivo"
                  aria-label="Subir foto desde dispositivo"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Native Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Mode Toggle Tabs */}
              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto bg-white/80 p-1 rounded-xl border border-[#6E488A]/10">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "photo" && previewImage
                      ? "bg-[#6E488A] text-white shadow-xs"
                      : "text-[#56346F]/70 hover:bg-slate-100"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("emoji")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "emoji" || !previewImage
                      ? "bg-[#6E488A] text-white shadow-xs"
                      : "text-[#56346F]/70 hover:bg-slate-100"
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Seleccionar Emoji</span>
                </button>
              </div>

              {/* Emoji Selector Grid if Emoji Tab Active */}
              {(activeTab === "emoji" || !previewImage) && (
                <div className="bg-white p-3 rounded-xl border border-[#6E488A]/10 max-w-sm mx-auto space-y-2">
                  <p className="text-[11px] text-[#56346F]/60 font-medium">Elige un emoji como avatar alternativo:</p>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setSelectedEmoji(emoji);
                          setActiveTab("emoji");
                        }}
                        className={`text-2xl p-2 rounded-xl transition-all cursor-pointer hover:bg-[#FAF4FC] ${
                          selectedEmoji === emoji && activeTab === "emoji"
                            ? "bg-[#E86FA3]/20 border border-[#E86FA3] scale-110 shadow-xs"
                            : "border border-transparent"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* File Error Alert */}
              {fileError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 text-left animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Save Success Alert */}
              {saveSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 text-left">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">¡Foto de perfil actualizada con éxito en tu cuenta!</span>
                </div>
              )}

              {/* Action Buttons for Avatar */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveProfilePicture}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#6E488A] via-[#E86FA3] to-[#36C4D8] text-white font-bold text-xs py-2.5 px-6 rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Guardando cambios...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar Foto de Perfil</span>
                    </>
                  )}
                </button>

                {previewImage && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-slate-500 hover:text-rose-600 hover:underline py-2 px-3 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar foto actual</span>
                  </button>
                )}
              </div>
            </div>

            {/* SECCIÓN 2: INFORMACIÓN DE LA CUENTA */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-[#56346F] font-bold text-sm">
                <User className="w-4 h-4 text-[#36C4D8]" />
                <span>Información de la Usuaria</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-slate-400 font-medium">Nombre:</span>
                  <p className="font-bold text-[#56346F] text-sm">{userName || "Usuaria M.A.P.A.™"}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-slate-400 font-medium">Correo Electrónico:</span>
                  <p className="font-bold text-[#56346F] text-sm truncate">{userEmail || "No registrado"}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-slate-400 font-medium">Estado de Acceso:</span>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Plan Activo 7 Días</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
                  <span className="text-slate-400 font-medium">Creadora & Mentora del Sistema:</span>
                  <p className="font-semibold text-[#E86FA3]">Clara Luz: Creadora, Fundadora y Mentora de M.A.P.A.™</p>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: AISLAMIENTO TOTAL Y SEGURIDAD - CERRAR SESIÓN EN LA PARTE INFERIOR */}
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center space-y-2">
              <p className="text-[11px] text-slate-400 text-center max-w-xs">
                Ubicación segura de cierre de sesión para evitar clics accidentales mientras personalizas tu avatar.
              </p>

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold text-xs py-3 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión Segura</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN (PROTECCIÓN UX) */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border-2 border-rose-100 w-full max-w-sm rounded-3xl p-6 text-center space-y-5 shadow-2xl relative font-sans"
              >
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                  <LogOut className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-lg text-[#56346F]">
                    ¿Cerrar sesión de la cuenta?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tu avance y foto de perfil quedará guardado y protegido. Podrás volver a entrar en cualquier momento con tu correo registrado.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      onClose();
                      onLogout();
                    }}
                    className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Sí, Cerrar Sesión
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

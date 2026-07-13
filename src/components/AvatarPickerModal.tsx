import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, Upload, Smile, Loader2, Check, RefreshCw } from "lucide-react";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatar: { type: "emoji" | "image"; value: string }) => void;
  currentAvatar?: { type: "emoji" | "image"; value: string } | null;
  defaultEmoji?: string;
}

const PRESET_EMOJIS = [
  "🧠", "🦉", "🦊", "🦁", "🛡️", "🧘", "🌺", "☀️", "🎨", "🚀", 
  "💻", "🦄", "🐱", "🐶", "🍀", "🐳", "🦅", "🐼", "🐨", "🐝", 
  "🌻", "🌈", "💫", "💎", "🌟", "✨", "❤️", "🎈", "🔮", "💡"
];

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentAvatar,
  defaultEmoji = "🧘"
}) => {
  const [activeTab, setActiveTab] = useState<"emoji" | "camera" | "upload">("emoji");
  const [selectedEmoji, setSelectedEmoji] = useState<string>(
    currentAvatar?.type === "emoji" ? currentAvatar.value : defaultEmoji
  );
  
  // Camera States
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(
    currentAvatar?.type === "image" ? currentAvatar.value : null
  );
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  
  // Upload States
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    currentAvatar?.type === "image" ? currentAvatar.value : null
  );
  const [dragActive, setDragActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Clean up camera stream on unmount or tab change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    } else {
      // Re-initialize values based on current state
      if (currentAvatar?.type === "emoji") {
        setSelectedEmoji(currentAvatar.value);
        setActiveTab("emoji");
      } else if (currentAvatar?.type === "image") {
        setCapturedPhoto(currentAvatar.value);
        setUploadedImage(currentAvatar.value);
        setActiveTab("upload");
      }
    }
  }, [isOpen, currentAvatar]);

  // Handle Tab Change
  const handleTabChange = (tab: "emoji" | "camera" | "upload") => {
    setActiveTab(tab);
    if (tab !== "camera") {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraLoading(true);
    setCameraError(null);
    setCapturedPhoto(null);
    stopCamera();

    try {
      const constraints = {
        video: {
          width: { ideal: 480 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Permiso de cámara denegado. Por favor, habilita el acceso en tu navegador o sube una imagen.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No se detectó ninguna cámara disponible en tu dispositivo.");
      } else {
        setCameraError("Error al iniciar la cámara. Te sugerimos subir una foto directamente.");
      }
    } finally {
      setCameraLoading(false);
    }
  };

  // Capture Photo
  const capturePhoto = () => {
    if (videoRef.current) {
      setIsCapturing(true);
      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      
      // Force square crop
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw centered square crop from video stream
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
      setIsCapturing(false);
    }
  };

  // Recapture Photo
  const recapture = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  // Image File Upload Helper
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Save changes
  const handleSave = () => {
    if (activeTab === "emoji") {
      onSave({ type: "emoji", value: selectedEmoji });
    } else if (activeTab === "camera" && capturedPhoto) {
      onSave({ type: "image", value: capturedPhoto });
    } else if (activeTab === "upload" && uploadedImage) {
      onSave({ type: "image", value: uploadedImage });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        {/* Backdrop cover click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-white rounded-3xl shadow-2xl border border-[#6E488A]/12 w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh] text-left"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#6E488A]/10 flex items-center justify-between bg-[#FAF7F9]">
            <div>
              <h3 className="font-display font-bold text-xl text-[#6E488A]">Personaliza tu Avatar</h3>
              <p className="text-xs text-[#56346F]/70">Elige un emoji, tómate una foto o sube una imagen de perfil</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EDE0F0] text-[#56346F]/60 hover:text-[#6E488A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#6E488A]/10 bg-white p-1">
            <button
              onClick={() => handleTabChange("emoji")}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                activeTab === "emoji"
                  ? "text-[#E36DB4] border-b-2 border-[#E36DB4] bg-[#EDE0F0]/15"
                  : "text-[#56346F]/60 hover:text-[#6E488A] hover:bg-[#FAF7F9]"
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>Emojis</span>
            </button>
            <button
              onClick={() => handleTabChange("camera")}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                activeTab === "camera"
                  ? "text-[#E36DB4] border-b-2 border-[#E36DB4] bg-[#EDE0F0]/15"
                  : "text-[#56346F]/60 hover:text-[#6E488A] hover:bg-[#FAF7F9]"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Tomar Foto</span>
            </button>
            <button
              onClick={() => handleTabChange("upload")}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                activeTab === "upload"
                  ? "text-[#E36DB4] border-b-2 border-[#E36DB4] bg-[#EDE0F0]/15"
                  : "text-[#56346F]/60 hover:text-[#6E488A] hover:bg-[#FAF7F9]"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Subir Foto</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 flex-1 overflow-y-auto min-h-[260px] max-h-[450px]">
            {/* EMOJI SELECTOR TAB */}
            {activeTab === "emoji" && (
              <div className="space-y-4">
                <div className="flex justify-center py-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#EDE0F0] to-[#FAF7F9] border-2 border-[#E36DB4] flex items-center justify-center text-5xl shadow-md">
                    {selectedEmoji}
                  </div>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 pt-2">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-3xl p-2.5 rounded-xl hover:scale-110 transition-transform flex items-center justify-center cursor-pointer ${
                        selectedEmoji === emoji
                          ? "bg-[#EDE0F0] border border-[#E36DB4] scale-105"
                          : "hover:bg-[#FAF7F9] border border-transparent"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CAMERA SNAPSHOT TAB */}
            {activeTab === "camera" && (
              <div className="space-y-4 flex flex-col items-center">
                {cameraLoading && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-8 h-8 text-[#6E488A] animate-spin" />
                    <p className="text-sm text-[#56346F]/70">Iniciando cámara...</p>
                  </div>
                )}

                {cameraError && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center text-xs space-y-3 max-w-sm">
                    <p>{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-3.5 py-1.5 bg-[#EDE0F0] hover:bg-[#E3D1E6] text-[#6E488A] font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 mx-auto"
                    >
                      <RefreshCw className="w-3 h-3" /> Reintentar cámara
                    </button>
                  </div>
                )}

                {/* Video / Photo Preview container */}
                {!cameraLoading && !cameraError && (
                  <div className="relative w-52 h-52 rounded-2xl bg-black overflow-hidden border-2 border-[#6E488A]/20 shadow-inner flex items-center justify-center">
                    {capturedPhoto ? (
                      <img
                        src={capturedPhoto}
                        alt="Foto capturada"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    )}

                    {/* Guidelines circle overlay */}
                    {!capturedPhoto && (
                      <div className="absolute inset-4 rounded-full border-2 border-dashed border-white/40 pointer-events-none" />
                    )}
                  </div>
                )}

                {/* Control Buttons */}
                {!cameraLoading && !cameraError && (
                  <div className="flex gap-3 justify-center w-full">
                    {capturedPhoto ? (
                      <button
                        onClick={recapture}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Volver a Tomar
                      </button>
                    ) : (
                      <button
                        onClick={capturePhoto}
                        disabled={!cameraStream}
                        className="px-5 py-2.5 bg-[#E36DB4] hover:bg-[#D0569F] text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Camera className="w-4 h-4" /> Capturar Foto
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* UPLOAD IMAGE FILE TAB */}
            {activeTab === "upload" && (
              <div className="space-y-4">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                    dragActive
                      ? "border-[#E36DB4] bg-[#EDE0F0]/20"
                      : "border-[#6E488A]/20 hover:border-[#E36DB4] hover:bg-[#FAF7F9]"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {uploadedImage ? (
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#E36DB4] shadow-md mb-2">
                      <img
                        src={uploadedImage}
                        alt="Subida preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#EDE0F0] flex items-center justify-center text-[#E36DB4] mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                  )}

                  <p className="font-semibold text-sm text-[#56346F]">
                    {uploadedImage ? "Cambiar archivo de imagen" : "Arrastra tu foto aquí o haz clic"}
                  </p>
                  <p className="text-xs text-[#56346F]/60 mt-1">Soporta PNG, JPG, GIF (máx. 5MB)</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="p-6 border-t border-[#6E488A]/10 bg-[#FAF7F9] flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={
                (activeTab === "camera" && !capturedPhoto) ||
                (activeTab === "upload" && !uploadedImage)
              }
              className="px-5 py-2.5 bg-[#6E488A] hover:bg-[#583770] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Guardar Cambios
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

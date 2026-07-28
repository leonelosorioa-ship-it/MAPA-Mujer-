import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Shield, Sparkles, MessageCircle, Award, Star, CheckCircle2 } from "lucide-react";
import { CLARA_LUZ_PROFILE } from "../data/claraLuzProfile";

interface ClaraLuzProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userFirstName?: string;
}

export const ClaraLuzProfileModal: React.FC<ClaraLuzProfileModalProps> = ({
  isOpen,
  onClose,
  userFirstName,
}) => {
  if (!isOpen) return null;

  const whatsappMessage = encodeURIComponent(
    `¡Hola, Clara Luz! 🌸\nSoy ${userFirstName || "usuaria de M.A.P.A."} y me gustaría saludarte y conversar contigo sobre mi proceso.`
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#140822] border border-purple-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden my-auto"
        >
          {/* Ambient Glow background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B5179E]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#36C4D8]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Bar with Badge and Close button */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
            <div className="inline-flex items-center space-x-2 bg-purple-500/15 border border-purple-400/30 px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#E86FA3] animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-200">
                Fundadora & Mentora
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-all cursor-pointer border border-white/15"
              title="Cerrar perfil"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Card Body */}
          <div className="space-y-6 pt-5 text-center relative z-10">
            {/* Circular Profile Avatar with Glowing Ring */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#36C4D8] via-[#B5179E] to-[#E86FA3] rounded-full blur-xl opacity-70 animate-pulse" />
              
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-tr from-[#36C4D8] via-[#B5179E] to-[#E86FA3] shadow-[0_0_25px_rgba(181,23,158,0.5)]">
                <img
                  src={CLARA_LUZ_PROFILE.image}
                  alt={CLARA_LUZ_PROFILE.fullTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full border-2 border-[#140822]"
                />
              </div>

              {/* Verified Heart Badge */}
              <div className="absolute -bottom-2 right-2 bg-gradient-to-r from-[#E86FA3] to-[#B5179E] p-2 rounded-full border-2 border-[#140822] shadow-lg">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
            </div>

            {/* Title & Signature */}
            <div className="space-y-1">
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Clara Luz
              </h3>
              <p className="text-xs sm:text-sm font-mono font-bold text-[#36C4D8] uppercase tracking-wider">
                {CLARA_LUZ_PROFILE.signature}
              </p>
              <p className="text-[11px] text-purple-200/80 font-sans italic">
                {CLARA_LUZ_PROFILE.roleTitle}
              </p>
            </div>

            {/* Founder Message Box */}
            <div className="bg-white/5 border border-purple-300/20 rounded-2xl p-4 text-left relative overflow-hidden">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-xl text-purple-300 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-pink-300 uppercase tracking-widest block">
                    Mensaje de Clara Luz a las Usuarias
                  </span>
                  <p className="text-xs text-purple-100/90 font-sans italic leading-relaxed">
                    "{CLARA_LUZ_PROFILE.founderMessage}"
                  </p>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="text-left text-xs text-purple-100/80 font-sans leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">
              <p>{CLARA_LUZ_PROFILE.bio}</p>
            </div>

            {/* Key Pillars */}
            <div className="text-left space-y-2">
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest block">
                Trayectoria y Metodología
              </span>
              <div className="grid grid-cols-1 gap-2">
                {CLARA_LUZ_PROFILE.pillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs text-purple-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#36C4D8] shrink-0" />
                    <span>{pillar}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button: WhatsApp Conversation */}
            <div className="pt-2">
              <a
                href={`https://wa.me/573207739761?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0e7569] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 border border-emerald-400/30"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Conversar con Clara Luz en WhatsApp</span>
              </a>
              <p className="text-[10px] text-purple-300/60 font-mono mt-2">
                Atención directa con Clara Luz • Mentora M.A.P.A.™ Mujer
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

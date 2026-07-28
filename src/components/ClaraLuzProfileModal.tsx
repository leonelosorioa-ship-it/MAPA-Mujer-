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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#FDF9FC] border-2 border-[#EADDF0] rounded-3xl p-6 sm:p-8 text-[#1C0630] shadow-2xl overflow-hidden my-auto"
        >
          {/* Ambient soft glow background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E86FA3]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#36C4D8]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Bar with Badge and Close button */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EADDF0] relative z-10">
            <div className="inline-flex items-center space-x-2 bg-[#E36DB4]/10 border border-[#E36DB4]/30 px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#E86FA3] animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E86FA3]">
                Fundadora & Mentora M.A.P.A.™
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-[#E86FA3] hover:bg-[#d85f93] text-white rounded-full transition-all cursor-pointer shadow-xs border border-white/20 hover:scale-105 active:scale-95"
              title="Cerrar perfil"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Profile Card Body */}
          <div className="space-y-5 pt-4 text-center relative z-10">
            {/* Circular Profile Avatar with Glowing Ring */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#36C4D8] via-[#E86FA3] to-[#6E488A] rounded-full blur-lg opacity-40 animate-pulse" />
              
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-[#36C4D8] via-[#E86FA3] to-[#6E488A] shadow-md">
                <img
                  src={CLARA_LUZ_PROFILE.image}
                  alt={CLARA_LUZ_PROFILE.fullTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full border-2 border-white shadow-sm"
                />
              </div>

              {/* Verified Heart Badge */}
              <div className="absolute -bottom-1 right-1 bg-gradient-to-r from-[#E86FA3] to-[#B5179E] p-2 rounded-full border-2 border-white shadow-md">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
            </div>

            {/* Title & Signature */}
            <div className="space-y-1">
              <h3 className="font-display font-black text-2xl sm:text-3xl text-[#3A185C] tracking-tight">
                Clara Luz
              </h3>
              <p className="text-xs sm:text-sm font-mono font-bold text-[#8A519E] uppercase tracking-wider">
                {CLARA_LUZ_PROFILE.signature}
              </p>
              <p className="text-[11px] text-[#56346F]/80 font-sans italic font-medium">
                {CLARA_LUZ_PROFILE.roleTitle}
              </p>
            </div>

            {/* Founder Message Box */}
            <div className="bg-white border border-[#E36DB4]/30 rounded-2xl p-4 text-left relative overflow-hidden shadow-xs">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-[#E36DB4]/10 rounded-xl text-[#E36DB4] shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#E36DB4] uppercase tracking-widest block">
                    Mensaje de Clara Luz a las Usuarias
                  </span>
                  <p className="text-xs text-[#3A185C] font-sans italic leading-relaxed font-medium">
                    "{CLARA_LUZ_PROFILE.founderMessage}"
                  </p>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="text-left text-xs text-[#56346F] font-sans leading-relaxed bg-[#FAF2FA] p-4 rounded-2xl border border-[#EAE0F0]">
              <p className="font-medium">{CLARA_LUZ_PROFILE.bio}</p>
            </div>

            {/* Key Pillars */}
            <div className="text-left space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#36C4D8] uppercase tracking-widest block">
                Trayectoria y Metodología
              </span>
              <div className="grid grid-cols-1 gap-2">
                {CLARA_LUZ_PROFILE.pillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2.5 bg-white p-2.5 rounded-xl border border-[#EAE0F0] text-xs text-[#3A185C] font-medium shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#36C4D8] shrink-0" />
                    <span>{pillar}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button: WhatsApp Conversation */}
            <div className="pt-1">
              <a
                href={`https://wa.me/573207739761?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0e7569] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 border border-emerald-400/30 hover:scale-[1.01] active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Conversar con Clara Luz en WhatsApp</span>
              </a>
              <p className="text-[10px] text-[#56346F]/70 font-mono mt-2 font-medium">
                Atención directa con Clara Luz • Mentora M.A.P.A.™ Mujer
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

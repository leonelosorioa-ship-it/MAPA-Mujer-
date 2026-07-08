import React from "react";
import { MessageCircle, Check } from "lucide-react";

interface ShareCardProps {
  title: string;
  text: string;
  index: number;
  isCopied: boolean;
  onCopy: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  title,
  text,
  index,
  isCopied,
  onCopy,
}) => {
  // Dynamically generate a highly persuasive CTA based on the achievement category
  const getWhatsAppCTA = (titleStr: string) => {
    const titleLower = titleStr.toLowerCase();
    if (titleLower.includes("desafío") || titleLower.includes("logro")) {
      return "Enviar Logro a WhatsApp 🚀";
    }
    if (titleLower.includes("rescate") || titleLower.includes("pánico")) {
      return "Compartir Rescate en WhatsApp 🚨";
    }
    if (titleLower.includes("hábito") || titleLower.includes("conexión")) {
      return "Compartir Victoria por WhatsApp ✨";
    }
    return "Enviar a WhatsApp 🚀";
  };

  const whatsappCTA = getWhatsAppCTA(title);

  return (
    <div 
      className="bg-white p-6 rounded-2xl border-2 border-[#6E488A]/15 border-b-4 border-b-[#6E488A]/25 flex flex-col justify-between space-y-5 shadow-[0_4px_12px_rgba(110,72,138,0.02)] text-left hover:scale-[1.01] transition-all duration-300 ease-out hover:border-[#6E488A]/30"
      id={`share-card-${index}`}
    >
      <div>
        <h5 className="font-extrabold text-sm uppercase tracking-wider text-[#6E488A] mb-3 font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#E36DB4]" />
          {title}
        </h5>
        <div className="text-xs text-[#56346F]/90 italic line-clamp-6 leading-relaxed bg-[#EDE0F0]/15 p-3.5 rounded-xl border border-[#6E488A]/10 font-medium select-all relative group">
          "{text}"
          <span className="absolute right-2 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-[#6E488A] font-mono not-italic bg-white/95 px-1.5 py-0.5 rounded border border-[#6E488A]/10">
            Haz clic para copiar
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Copiar para Compartir Button - Standardized Premium Button */}
        <button
          onClick={onCopy}
          id={`btn-copy-share-${index}`}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold font-mono transition-all duration-300 ease-in-out flex items-center justify-center gap-2 cursor-pointer border-2 hover:scale-[1.03] active:scale-[0.98] ${
            isCopied
              ? "bg-[#36C4D8] text-white border-[#53E0F2] shadow-[0_0_15px_rgba(54,196,216,0.3)]"
              : "bg-gradient-to-r from-[#6E488A] to-[#E36DB4] text-white border-[#8D65AA] hover:shadow-[0_0_15px_rgba(110,72,138,0.4)]"
          }`}
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 shrink-0" /> ¡Copiado con Éxito!
            </>
          ) : (
            <>
              Copiar para Compartir 📋
            </>
          )}
        </button>

        {/* WhatsApp Share Button - Standardized Official Active Green Button */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
          id={`btn-whatsapp-share-${index}`}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#25D366] to-[#1EBE57] hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] hover:scale-[1.03] active:scale-[0.98] border-2 border-[#52F08B] text-white rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ease-in-out"
        >
          <MessageCircle className="w-4.5 h-4.5 text-white animate-pulse" />
          <span>{whatsappCTA}</span>
        </a>
      </div>
    </div>
  );
};

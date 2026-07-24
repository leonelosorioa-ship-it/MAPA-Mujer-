import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  X,
  MessageCircle,
  BookOpen,
  Key,
  Smartphone,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  LifeBuoy,
  Heart,
  ArrowLeft
} from "lucide-react";

export interface TechnicalSupportDrawerProps {
  userEmail?: string;
  isOpen?: boolean;
  onClose?: () => void;
  triggerClassName?: string;
}

interface TutorialItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  steps: string[];
}

const TUTORIALS: TutorialItem[] = [
  {
    id: "login_code",
    title: "¿Cómo ingresar con tu Código de Acceso?",
    icon: Key,
    badge: "Acceso e Inicio de Sesión",
    steps: [
      "Ingresa el correo electrónico con el que realizaste tu compra o registro en M.A.P.A.™.",
      "Haz clic en 'Solicitar Código por Correo / WhatsApp' o revisa tu bandeja de entrada y spam.",
      "Copia el código único de 6 dígitos que recibiste e ingrésalo en el campo correspondiente.",
      "¡Listo! Tu progreso y datos se sincronizarán automáticamente de forma privada."
    ]
  },
  {
    id: "program_navigation",
    title: "¿Cómo funciona el Programa de 7 Días?",
    icon: Sparkles,
    badge: "Guía de Uso",
    steps: [
      "Cada día activa un nuevo pilar de regulación psicofisiológica y test de evaluación.",
      "Por recomendación clínica, entre cada día habilitado deben transcurrir al menos 24 horas para procesar las técnicas de integración.",
      "Al completar los test diarios desbloquearás herramientas de audio Bicuanti™ y sorpresas exclusivas."
    ]
  },
  {
    id: "install_pwa",
    title: "¿Cómo instalar la App en mi celular sin tiendas?",
    icon: Smartphone,
    badge: "Instalación PWA",
    steps: [
      "En iPhone (Safari): Toca el botón 'Compartir' (icono de cuadrado con flecha hacia arriba) y selecciona 'Agregar a Inicio'.",
      "En Android (Chrome): Toca el menú de tres puntos verticales arriba a la derecha y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.",
      "Esto te permitirá acceder a M.A.P.A.™ como una App nativa sin ocupar almacenamiento."
    ]
  },
  {
    id: "privacy_sync",
    title: "¿Tus datos y avance están seguros?",
    icon: ShieldCheck,
    badge: "Privacidad & Resguardo",
    steps: [
      "Tus datos personales y de respuestas están cifrados y resguardados con los más altos estándares de seguridad.",
      "Solo tú y el sistema de seguimiento de tu Mentora Clara tienen acceso a la evolución de tus métricas de calma.",
      "Puedes consultar o solicitar la gestión de tus datos en cualquier momento desde esta sección."
    ]
  }
];

export const TechnicalSupportDrawer: React.FC<TechnicalSupportDrawerProps> = ({
  userEmail = "",
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  triggerClassName
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<string | null>("login_code");

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleOpen = () => {
    setInternalIsOpen(true);
  };

  const supportWhatsAppUrl = `https://wa.me/573207739761?text=${encodeURIComponent(
    `¡Hola, Clara! 🫶\nNecesito ayuda técnica con mi acceso a M.A.P.A.™ Mujer.\nMi correo de registro es: ${userEmail || ""}`
  )}`;

  return (
    <>
      {/* Default Floating Trigger Button aligned at bottom left (matching the horizontal baseline of the right buttons) */}
      {externalIsOpen === undefined && (
        <button
          onClick={handleOpen}
          className={
            triggerClassName ||
            "fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[998] px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-white/95 backdrop-blur-md border border-[#6E488A]/30 text-[#56346F] font-display font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:bg-[#56346F] hover:text-white transition-all duration-200 flex items-center gap-2 group cursor-pointer hover:scale-105 active:scale-95"
          }
          aria-label="Abrir centro de ayuda técnica y soporte"
        >
          <div className="w-6 h-6 rounded-full bg-[#6E488A]/10 text-[#6E488A] group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors">
            <LifeBuoy className="w-3.5 h-3.5" />
          </div>
          <span className="hidden xs:inline">Ayuda Técnica & Soporte</span>
          <span className="xs:hidden">Ayuda</span>
        </button>
      )}

      {/* Full-Screen Technical Support Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] bg-[#1E092B]/95 backdrop-blur-xl flex flex-col text-slate-800 overflow-hidden"
          >
            {/* STICKY TOP HEADER WITH PROMINENT CLOSE BUTTON */}
            <div className="sticky top-0 z-20 bg-gradient-to-r from-[#4A2466] via-[#6E488A] to-[#4A2466] text-white p-4 sm:p-6 shadow-xl border-b border-purple-400/20 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-cyan-300 shrink-0">
                  <LifeBuoy className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-cyan-300 block">
                    CENTRO DE ASISTENCIA TÉCNICA
                  </span>
                  <h3 className="font-display font-extrabold text-base sm:text-xl text-white leading-tight">
                    Soporte Directo & Guías Rápidas
                  </h3>
                </div>
              </div>

              {/* HIGHLY VISIBLE & HIGHLIGHTED CLOSE BUTTON */}
              <button
                onClick={handleClose}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-rose-500/25 hover:bg-rose-500 text-rose-100 hover:text-white border-2 border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all flex items-center gap-2 text-xs sm:text-sm font-bold font-mono tracking-wider hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                aria-label="Cerrar panel de ayuda y volver a la app"
              >
                <span className="hidden xs:inline">VOLVER A LA APP</span>
                <span>CERRAR</span>
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                  <X className="w-4 h-4 stroke-[3]" />
                </div>
              </button>
            </div>

            {/* TOP REASSURANCE BANNER FOR EASY CLOSING */}
            <div className="bg-[#6E488A]/30 border-b border-[#6E488A]/30 py-2 px-4 text-center text-xs text-purple-200 font-mono flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>
                Para salir de esta ventana en cualquier momento, toca en <strong className="text-rose-300 underline cursor-pointer" onClick={handleClose}>CERRAR [X]</strong> arriba a la derecha.
              </span>
            </div>

            {/* FULL-SCREEN SCROLLABLE CONTENT BODY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#FAF7F9]">
              <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                
                {/* HERO ASSISTANCE BANNER WITH MENTORA CLARA LUZ */}
                <div className="bg-gradient-to-br from-[#411F66] via-[#56346F] to-[#6E488A] rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-purple-400/20">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-xl text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-300/30 text-cyan-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                        <Heart className="w-3 h-3 text-pink-300 fill-pink-300" />
                        <span>Fundadora & Creadora del Proyecto</span>
                      </div>
                      <h4 className="font-display font-black text-xl sm:text-2xl text-white">
                        Atención Personalizada con Nuestra Mentora Clara Luz
                      </h4>
                      <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
                        Clara Luz, creadora y líder de M.A.P.A.™ Mujer, está disponible para acompañarte personalmente en cualquier dificultad técnica, de acceso o duda con tu programa.
                      </p>
                    </div>

                    <a
                      href={supportWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto py-3.5 px-6 rounded-2xl font-display font-extrabold text-sm bg-[#25D366] hover:bg-[#20ba5a] text-white transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 shrink-0 group cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <MessageCircle className="w-5 h-5 text-white fill-white" />
                      <span>Escribir a Clara Luz en WhatsApp</span>
                      <ExternalLink className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>

                {/* TUTORIALS AND FREQUENT GUIDES */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-display font-extrabold text-lg sm:text-xl text-[#411F66] flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#36C4D8]" />
                        <span>Guías Rápidas & Solución de Inquietudes</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Haz clic en cada opción para desplegar las instrucciones paso a paso.
                      </p>
                    </div>
                    <span className="hidden sm:inline-block text-xs font-mono text-purple-800 bg-purple-100 px-3 py-1 rounded-full font-bold">
                      4 Guías Disponibles
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TUTORIALS.map((tutorial) => {
                      const isExpanded = activeTutorial === tutorial.id;
                      const IconComponent = tutorial.icon;

                      return (
                        <div
                          key={tutorial.id}
                          className={`rounded-2xl border transition-all overflow-hidden bg-white shadow-sm ${
                            isExpanded
                              ? "border-[#6E488A] ring-2 ring-[#6E488A]/20"
                              : "border-slate-200 hover:border-[#6E488A]/40"
                          }`}
                        >
                          <button
                            onClick={() => setActiveTutorial(isExpanded ? null : tutorial.id)}
                            className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2.5 rounded-xl text-sm font-bold ${
                                  isExpanded
                                    ? "bg-[#6E488A] text-white"
                                    : "bg-[#EDE0F0] text-[#56346F]"
                                }`}
                              >
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[9px] font-mono font-bold text-[#36C4D8] uppercase tracking-wider block">
                                  {tutorial.badge}
                                </span>
                                <h5 className="font-display font-bold text-sm text-slate-800 leading-snug">
                                  {tutorial.title}
                                </h5>
                              </div>
                            </div>

                            <div className="text-slate-400 shrink-0">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-[#6E488A]" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </div>
                          </button>

                          {/* Tutorial Steps Expansion */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-4 pb-4 pt-2 space-y-2.5 border-t border-slate-100 bg-purple-50/30"
                              >
                                {tutorial.steps.map((step, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start space-x-3 text-xs text-slate-700 leading-relaxed"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-[#36C4D8] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                      {idx + 1}
                                    </div>
                                    <p>{step}</p>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* EXTRA BOTTOM CLOSE CTA CARD */}
                <div className="bg-white border-2 border-dashed border-[#6E488A]/30 rounded-2xl p-6 text-center space-y-3">
                  <h5 className="font-display font-bold text-slate-800 text-sm">
                    ¿Terminaste de revisar el Centro de Ayuda?
                  </h5>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Puedes regresar en cualquier momento a tu programa de autorregulación haciendo clic en el botón a continuación.
                  </p>
                  <button
                    onClick={handleClose}
                    className="py-3 px-8 rounded-full bg-[#56346F] hover:bg-[#411F66] text-white font-display font-bold text-xs shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver y Continuar en la App</span>
                  </button>
                </div>

              </div>
            </div>

            {/* MODAL FOOTER WITH MENTORA CLARA LUZ CREDITS */}
            <div className="p-4 bg-[#1E092B] border-t border-purple-950/80 text-center space-y-1 text-white">
              <p className="text-xs font-mono font-bold text-purple-200">
                M.A.P.A.™ Mujer • Sistema de Autorregulación Emocional y Sanación Somática
              </p>
              <p className="text-[11px] text-purple-300/80 font-medium">
                Clara Luz • Creadora, Fundadora y Mentora de M.A.P.A.™ Mujer
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

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
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  LifeBuoy
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
      {/* Default Floating Trigger Button if no external control is active */}
      {externalIsOpen === undefined && (
        <button
          onClick={handleOpen}
          className={
            triggerClassName ||
            "fixed bottom-24 left-4 sm:bottom-6 sm:left-6 z-40 px-3.5 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-[#6E488A]/25 text-[#56346F] font-display font-bold text-xs shadow-lg hover:shadow-xl hover:bg-[#56346F] hover:text-white transition-all duration-200 flex items-center gap-2 group cursor-pointer"
          }
          aria-label="Abrir panel de ayuda técnica y soporte"
        >
          <div className="w-6 h-6 rounded-full bg-[#6E488A]/10 text-[#6E488A] group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors">
            <LifeBuoy className="w-3.5 h-3.5" />
          </div>
          <span className="hidden xs:inline">Ayuda Técnica & Soporte</span>
          <span className="xs:hidden">Ayuda</span>
        </button>
      )}

      {/* Slide-over Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handleClose}
              className="absolute inset-0 bg-purple-950/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Side Drawer Container */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-screen max-w-md bg-white shadow-2xl border-l border-[#6E488A]/15 flex flex-col justify-between text-left relative z-10"
              >
                {/* Drawer Header */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-[#56346F] to-[#6E488A] text-white flex items-center justify-between border-b border-purple-400/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-cyan-300">
                      <LifeBuoy className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-cyan-300 block">
                        CENTRO DE ASISTENCIA TÉCNICA
                      </span>
                      <h3 className="font-display font-extrabold text-lg text-white">
                        Soporte & Guías Rápidas
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                    aria-label="Cerrar panel de soporte"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                  {/* Direct WhatsApp Support Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200/80 space-y-3.5 shadow-sm">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2.5 bg-emerald-500 text-white rounded-xl shrink-0 shadow-xs">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-black text-emerald-800 uppercase tracking-wider block">
                          SOPORTE HUMANO EN TIEMPO REAL
                        </span>
                        <h4 className="font-display font-bold text-base text-slate-800">
                          ¿Problemas de Inicio o Código?
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Si tienes inconvenientes para ingresar, no recibiste tu código de acceso o necesitas resolver alguna duda con tu membresía, nuestra Mentora Clara te atenderá directamente.
                    </p>

                    <a
                      href={supportWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl font-display font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-200" />
                      <span>Contactar Soporte en WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Atención prioritaria y confidencial garantizada.</span>
                    </div>
                  </div>

                  {/* App Usage Tutorials Accordion */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-display font-bold text-sm text-[#56346F] flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#36C4D8]" />
                        <span>Tutoriales Básicos de la App</span>
                      </h4>
                      <span className="text-[10px] font-mono text-slate-600 font-semibold">
                        3 Guías Frecuentes
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {TUTORIALS.map((tutorial) => {
                        const isExpanded = activeTutorial === tutorial.id;
                        const IconComponent = tutorial.icon;

                        return (
                          <div
                            key={tutorial.id}
                            className={`rounded-2xl border transition-all overflow-hidden ${
                              isExpanded
                                ? "border-[#6E488A]/30 bg-[#56346F]/5 shadow-xs"
                                : "border-slate-200 bg-white hover:border-[#6E488A]/20"
                            }`}
                          >
                            <button
                              onClick={() => setActiveTutorial(isExpanded ? null : tutorial.id)}
                              className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`p-2 rounded-xl text-xs font-bold ${
                                    isExpanded
                                      ? "bg-[#6E488A] text-white"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-[#36C4D8] uppercase tracking-wider block">
                                    {tutorial.badge}
                                  </span>
                                  <h5 className="font-display font-bold text-xs text-slate-800">
                                    {tutorial.title}
                                  </h5>
                                </div>
                              </div>

                              <div className="text-slate-400">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-[#6E488A]" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </div>
                            </button>

                            {/* Tutorial Steps */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="px-4 pb-4 pt-1 space-y-2 border-t border-[#6E488A]/10"
                                >
                                  {tutorial.steps.map((step, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed"
                                    >
                                      <div className="w-4 h-4 rounded-full bg-[#36C4D8]/20 text-[#208898] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
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
                </div>

                {/* Drawer Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-center space-y-1">
                  <p className="text-[11px] font-mono font-semibold text-[#56346F]/80">
                    M.A.P.A.™ Mujer • Sistema de Autoregulación Emocional
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Diseñado por Leonel Osorio Andrade
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

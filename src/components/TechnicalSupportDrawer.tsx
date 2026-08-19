import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
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
import { CLARA_LUZ_PROFILE } from "../data/claraLuzProfile";

export interface TechnicalSupportDrawerProps {
  userEmail?: string;
  isLoggedIn?: boolean;
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
  isLoggedIn = false,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  triggerClassName
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTutorial, setActiveTutorial] = useState<string | null>(
    isLoggedIn ? "program_navigation" : "login_code"
  );

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleOpen = () => {
    if (isLoggedIn && activeTutorial === "login_code") {
      setActiveTutorial("program_navigation");
    }
    setInternalIsOpen(true);
  };

  const supportWhatsAppUrl = `https://wa.me/573005149055?text=${encodeURIComponent(
    `¡Hola, Clara! 🫶\nNecesito ayuda técnica con mi acceso a M.A.P.A.™ Mujer.\nMi correo de registro es: ${userEmail || ""}`
  )}`;

  return (
    <>
      {/* Floating Trigger Controls at bottom left: Volver/Anterior + Ayuda & Soporte */}
      {externalIsOpen === undefined && (
        <div className="fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-[998] flex items-center gap-2">
          {/* 1. ICON-ONLY "VOLVER / ANTERIOR" NAVIGATION BUTTON (CLEAN CIRCULAR ARROW) */}
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#3E1B5A] hover:bg-[#2C1242] text-white border-2 border-white/90 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 group shrink-0"
            title="Volver / Regresar a la sección anterior"
            aria-label="Volver o regresar a la sección anterior"
          >
            <ArrowLeft className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.8] text-white group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* 2. PERSISTENT "AYUDA & SOPORTE" COMPACT BUTTON */}
          <button
            type="button"
            onClick={handleOpen}
            className={
              triggerClassName ||
              (isLoggedIn
                ? "px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white border-2 border-white/90 font-display font-bold text-xs shadow-xl transition-all duration-200 flex items-center gap-2 group cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                : "px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-[#6E488A]/25 text-[#56346F] font-display font-bold text-xs shadow-xl hover:bg-[#56346F] hover:text-white transition-all duration-200 flex items-center gap-2 group cursor-pointer hover:scale-105 active:scale-95 shrink-0")
            }
            aria-label={isLoggedIn ? "Abrir guía de uso del programa M.A.P.A." : "Abrir centro de ayuda técnica y soporte"}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-[#56346F] relative">
              <img
                src={CLARA_LUZ_PROFILE.image}
                alt="Clara Luz Mentora"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = "true";
                    target.src = "/clara-luz-profile.jpg";
                  } else if (!target.dataset.triedSecond) {
                    target.dataset.triedSecond = "true";
                    target.src = "/clara_luz.jpg";
                  }
                }}
                className="w-full h-full object-cover object-top rounded-full"
              />
            </div>
            <span className="font-black text-xs tracking-wide">Ayuda</span>
          </button>
        </div>
      )}

      {/* Gentle Slide-up Drawer/Modal with Soft Colors */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end items-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Sheet - Soft, Tender, Calm Theme (Max ~80% height, max-w-2xl) */}
            <motion.div
              initial={{ y: "100%", opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-[#FDF9FC] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EAE0F0] flex flex-col overflow-hidden text-slate-800"
            >
              {/* TOP DRAG / ACCENT BAR */}
              <div className="w-full pt-3 pb-1 flex justify-center bg-[#F7EDF8]">
                <div className="w-12 h-1.5 rounded-full bg-[#D4C3DF]" />
              </div>

              {/* HEADER WITH SOFT TENDER COLORS */}
              <div className="bg-gradient-to-r from-[#F5EBF8] via-[#FAF0FB] to-[#F5EBF8] px-5 py-4 border-b border-[#EADDF0] flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#EDE0F0] text-[#6E488A] flex items-center justify-center border border-[#6E488A]/20 shrink-0">
                    <LifeBuoy className="w-5 h-5 text-[#6E488A]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#8A519E] block">
                      {isLoggedIn ? "ACOMPAÑAMIENTO DE 7 DÍAS" : "CENTRO DE ASISTENCIA TÉCNICA"}
                    </span>
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-[#3A185C] leading-snug">
                      {isLoggedIn ? "Guía de Uso del Programa M.A.P.A.™" : "Soporte & Guías Rápidas"}
                    </h3>
                  </div>
                </div>

                {/* HIGH-CONTRAST SOFT PINK CLOSE BUTTON */}
                <button
                  onClick={handleClose}
                  className="px-3.5 py-1.5 rounded-full bg-[#E86FA3] hover:bg-[#d85f93] text-white transition-all flex items-center gap-1.5 text-xs font-bold font-mono shadow-xs hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  aria-label="Cerrar ayuda"
                >
                  <span>CERRAR</span>
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* SCROLLABLE BODY WITH SOFT LIGHT PASTEL CARDS */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FDF9FC]">
                
                {/* BANNER: CLARA LUZ WHATSAPP SUPPORT BANNER (ALWAYS SHOWN AT TOP OF SUPPORT) */}
                <div className="bg-gradient-to-r from-[#FFF5FA] via-[#F9F0F8] to-[#FFF5FA] rounded-2xl p-5 border border-[#E36DB4]/30 shadow-xs relative overflow-hidden text-left">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 max-w-md">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#E36DB4] shadow-md shrink-0 bg-[#56346F] relative">
                        <img
                          src={CLARA_LUZ_PROFILE.image}
                          alt={CLARA_LUZ_PROFILE.fullTitle}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.triedFallback) {
                              target.dataset.triedFallback = "true";
                              target.src = "/clara-luz-profile.jpg";
                            } else if (!target.dataset.triedSecond) {
                              target.dataset.triedSecond = "true";
                              target.src = "/clara_luz.jpg";
                            }
                          }}
                          className="w-full h-full object-cover object-top rounded-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E36DB4]/15 border border-[#E36DB4]/30 text-[#8A2B68] text-[10px] font-mono font-bold uppercase">
                          <Heart className="w-3 h-3 text-[#E36DB4] fill-[#E36DB4]" />
                          <span>Creadora, Fundadora y Mentora</span>
                        </div>
                        <h4 className="font-display font-bold text-base text-[#3A185C]">
                          Atención Directa con Clara Luz
                        </h4>
                        <p className="text-xs text-[#56346F] leading-relaxed">
                          Clara Luz • Mentora M.A.P.A.™ Mujer te atenderá personalmente si necesitas ayuda con tu código de acceso, cuenta o programa.
                        </p>
                      </div>
                    </div>

                    <a
                      href={supportWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-display font-bold text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Contactar en WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* 7-DAY PROGRAM GUIDE WHEN LOGGED IN */}
                {isLoggedIn && (
                  <div className="bg-gradient-to-r from-[#F5EBF8] via-[#FAF0FB] to-[#F5EBF8] rounded-2xl p-5 border border-[#6E488A]/30 shadow-xs text-left space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6E488A]/15 border border-[#6E488A]/30 text-[#56346F] text-[10px] font-mono font-bold uppercase">
                      <Sparkles className="w-3 h-3 text-[#6E488A]" />
                      <span>Guía de Uso del Programa M.A.P.A.™</span>
                    </div>
                    <h4 className="font-display font-extrabold text-base text-[#3A185C]">
                      ¿Cómo realizar tu proceso del ciclo de 7 Días?
                    </h4>
                    <p className="text-xs text-[#56346F] leading-relaxed">
                      M.A.P.A.™ Mujer es una experiencia guiada de autorregulación emocional diseñada para realizarse paso a paso durante 7 días:
                    </p>
                    <div className="space-y-2 pt-1 text-xs text-[#411F66]">
                      <div className="flex items-start space-x-2.5 bg-white/90 p-2.5 rounded-xl border border-[#EAE0F0]">
                        <div className="w-5 h-5 rounded-full bg-[#36C4D8] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                        <p><strong className="text-[#3A185C]">Un Día a la Vez (24h de Descanso):</strong> Cada día habilita un nuevo pilar. Para permitir la asimilación neurológica de las técnicas, entre cada día deben transcurrir al menos 24 horas.</p>
                      </div>
                      <div className="flex items-start space-x-2.5 bg-white/90 p-2.5 rounded-xl border border-[#EAE0F0]">
                        <div className="w-5 h-5 rounded-full bg-[#36C4D8] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                        <p><strong className="text-[#3A185C]">Test y Evaluaciones Diarias:</strong> Completa las escalas de autoevaluación al inicio de cada pilar para monitorear tus métricas de calma y guardar tu avance.</p>
                      </div>
                      <div className="flex items-start space-x-2.5 bg-white/90 p-2.5 rounded-xl border border-[#EAE0F0]">
                        <div className="w-5 h-5 rounded-full bg-[#36C4D8] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</div>
                        <p><strong className="text-[#3A185C]">Sonidos Bicuanti™ & Pistas de Calma:</strong> Escucha los audios de regulación sonora integrados al completar tu test diario para relajar tu sistema nervioso.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* GUIDES / TUTORIALS */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-[#EAE0F0] pb-2">
                    <h4 className="font-display font-bold text-sm text-[#3A185C] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#36C4D8]" />
                      <span>Preguntas Frecuentes & Guías</span>
                    </h4>
                    <span className="text-[10px] font-mono text-[#6E488A] bg-[#EDE0F0] px-2.5 py-0.5 rounded-full font-bold">
                      4 Guías
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {TUTORIALS.map((tutorial) => {
                      const isExpanded = activeTutorial === tutorial.id;
                      const IconComponent = tutorial.icon;

                      return (
                        <div
                          key={tutorial.id}
                          className={`rounded-xl border transition-all overflow-hidden bg-white shadow-2xs ${
                            isExpanded
                              ? "border-[#6E488A]/50 ring-1 ring-[#6E488A]/20"
                              : "border-[#EAE0F0] hover:border-[#6E488A]/30"
                          }`}
                        >
                          <button
                            onClick={() => setActiveTutorial(isExpanded ? null : tutorial.id)}
                            className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-lg text-xs font-bold ${
                                  isExpanded
                                    ? "bg-[#6E488A] text-white"
                                    : "bg-[#F3EBF5] text-[#56346F]"
                                }`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[9px] font-mono font-bold text-[#36C4D8] uppercase tracking-wider block">
                                  {tutorial.badge}
                                </span>
                                <h5 className="font-display font-bold text-xs sm:text-sm text-[#2A1244] leading-tight">
                                  {tutorial.title}
                                </h5>
                              </div>
                            </div>

                            <div className="text-slate-400 shrink-0">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-[#6E488A]" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </button>

                          {/* Expansion */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-3.5 pb-3.5 pt-2 space-y-2 border-t border-[#F0E6F4] bg-[#FAF5FC]"
                              >
                                {tutorial.steps.map((step, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start space-x-2.5 text-xs text-[#411F66] leading-relaxed"
                                  >
                                    <div className="w-4 h-4 rounded-full bg-[#36C4D8] text-white font-mono font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
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

                {/* BOTTOM RETURN ACTION */}
                <div className="pt-2 text-center">
                  <button
                    onClick={handleClose}
                    className="py-2.5 px-6 rounded-full bg-[#6E488A] hover:bg-[#56346F] text-white font-display font-bold text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a la App</span>
                  </button>
                </div>

              </div>

              {/* FOOTER */}
              <div className="px-4 py-3 bg-[#F3EBF5] border-t border-[#EAE0F0] text-center space-y-0.5">
                <p className="text-[11px] font-mono font-bold text-[#3A185C]">
                  M.A.P.A.™ Mujer • Sistema de Autorregulación Emocional
                </p>
                <p className="text-[10px] text-[#6E488A] font-extrabold font-mono">
                  Clara Luz • Mentora M.A.P.A.™ Mujer
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

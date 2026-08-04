import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  Activity, 
  ShieldAlert, 
  Heart, 
  Map, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  RefreshCw, 
  ShieldCheck, 
  Share2, 
  Download, 
  Mail, 
  Users, 
  Lock, 
  Unlock,
  Eye, 
  EyeOff,
  Layers,
  Award,
  Zap,
  Check,
  Smartphone,
  Facebook,
  Instagram,
  Linkedin,
  Clock,
  X,
  ArrowUp,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  MessageCircle,
  Camera,
  UserCheck,
  Upload
} from "lucide-react";
import { QUESTIONS } from "./questions";
import { EmotionalProfile, QuizResponse, LeadInfo } from "./types";
import { ScanWizard } from "./components/ScanWizard";
import { ScanResults } from "./components/ScanResults";
import { SoundTherapy } from "./components/SoundTherapy";
import { AdminPanel } from "./components/AdminPanel";
import { PushNotificationManager } from "./components/PushNotificationManager";
import { InAppNotificationSystem } from "./components/InAppNotificationSystem";
import { TermsAndPrivacy } from "./components/TermsAndPrivacy";
import { AppDownloadPrompt } from "./components/AppDownloadPrompt";
import { PremiumDashboard } from "./components/PremiumDashboard";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { RewardModal } from "./components/RewardModal";
import { AvatarPickerModal } from "./components/AvatarPickerModal";
import { ProfileSettings } from "./components/ProfileSettings";
import { Dashboard } from "./components/Dashboard";
import { MilestoneModal } from "./components/MilestoneModal";
import { WelcomeOnboardingModal } from "./components/WelcomeOnboardingModal";
import { TechnicalSupportDrawer } from "./components/TechnicalSupportDrawer";
import { ClaraLuzProfileModal } from "./components/ClaraLuzProfileModal";
import { Header } from "./components/Header";
import { AnimatedProgressNumber } from "./components/AnimatedProgressNumber";
import { useWhatsAppShare, FUNNEL_URL } from "./utils/useWhatsAppShare";
import { useAuthSynchronizer } from "./hooks/useAuthSynchronizer";
import { useAuth } from "./context/AuthContext";
import { playClickCue, playAlertCue, playSuccessCue } from "./utils/audioCues";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine
} from "recharts";

interface MiniExercise {
  id: number;
  title: string;
  category: "respiracion" | "estiramiento" | "grounding";
  emoji: string;
  description: string;
  steps: string[];
  duration: number; // in seconds
  guides: string[]; // sequence of guides for the countdown
}

const MINI_EXERCISES: MiniExercise[] = [
  {
    id: 1,
    title: "Respiración de Caja 4-4-4",
    category: "respiracion",
    emoji: "🧘",
    description: "Inhala, sostén y exhala en tiempos iguales para resetear tu sistema de alerta y regular tu ritmo cardíaco.",
    steps: ["Inhala aire por la nariz (4s)", "Mantén el aire con suavidad (4s)", "Exhala despacio por la boca (4s)"],
    duration: 30,
    guides: [
      "Inhala profundamente por la nariz...", 
      "Sigue inhalando aire puro...", 
      "Mantén el aire con calma...", 
      "Sostén con total tranquilidad...", 
      "Exhala despacio por la boca...", 
      "Saca todo el aire y relaja...", 
      "Inhala una vez más por la nariz...", 
      "Mantén el aire con serenidad...", 
      "Exhala liberando tensiones...", 
      "Disfruta de este espacio de paz."
    ]
  },
  {
    id: 2,
    title: "Estiramiento del Gato Sentada",
    category: "estiramiento",
    emoji: "🐈",
    description: "Libera la tensión acumulada en la columna vertebral, hombros y cuello directamente desde tu asiento.",
    steps: ["Entrelaza tus manos y empuja al frente curvando tu espalda (15s)", "Estira tus manos hacia el cielo abriendo el pecho (15s)"],
    duration: 30,
    guides: [
      "Entrelaza tus manos al frente...", 
      "Empuja hacia adelante estirando tu espalda...", 
      "Siente la liberación en tus omóplatos...", 
      "Respira hondo mientras estiras...", 
      "Ahora lleva tus brazos hacia el cielo...", 
      "Estírate alto como queriendo tocar el techo...", 
      "Abre tu pecho e inhala profundamente...", 
      "Nota la relajación de tus hombros...", 
      "Suelta tus brazos lentamente y relaja...", 
      "Haz una respiración de transición."
    ]
  },
  {
    id: 3,
    title: "Respiración Relámpago (4-7-8)",
    category: "respiracion",
    emoji: "⚡",
    description: "La técnica definitiva del Dr. Weil para apagar la rumiación mental y conciliar la calma instantánea.",
    steps: ["Inhala aire por la nariz (4s)", "Sostén el aire con serenidad (7s)", "Exhala con un suspiro fuerte (8s)"],
    duration: 30,
    guides: [
      "Prepárate, exhala todo el aire...", 
      "Inhala profundamente por la nariz...", 
      "Sostén el aire con calma...", 
      "Siente el aire sosteniendo tu pecho...", 
      "Exhala con un suspiro relajante...", 
      "Sigue exhalando con suavidad...", 
      "Inhala de nuevo aire puro...", 
      "Sostén con total serenidad...", 
      "Exhala disolviendo la ansiedad...", 
      "Siente tu cuerpo sintonizado."
    ]
  },
  {
    id: 4,
    title: "Liberación de Hombros y Cuello",
    category: "estiramiento",
    emoji: "🪵",
    description: "Desactiva los puntos gatillo de tensión en trapecios superiores por malas posturas o estrés.",
    steps: ["Sube hombros hacia las orejas inhalando (5s)", "Sostén la tensión (5s)", "Suelta de golpe exhalando (5s). Repite."],
    duration: 30,
    guides: [
      "Inhala y sube tus hombros muy alto...", 
      "Llévalos hacia tus orejas...", 
      "Sostén la tensión acumulada allí...", 
      "¡Suelta de golpe con un suspiro profundo! Ahhh...", 
      "Quédate ahí y nota la diferencia...", 
      "Inhala y vuelve a subir los hombros alto...", 
      "Sostén la tensión corporal...", 
      "¡Suelta de golpe de nuevo liberando todo!", 
      "Respira con total normalidad...", 
      "Siente tus hombros ligeros y suaves."
    ]
  },
  {
    id: 5,
    title: "Anclaje Sensorial (Grounding 3-2-1)",
    category: "grounding",
    emoji: "👁️",
    description: "Trae tu atención de vuelta al presente cuando sientas rumiación o dispersión de pensamiento.",
    steps: ["Observa 3 objetos a tu alrededor", "Siente 2 texturas táctiles diferentes", "Haz 1 respiración profunda con los ojos cerrados"],
    duration: 30,
    guides: [
      "Mira a tu alrededor con lentitud...", 
      "Identifica 3 objetos y nómbralos mentalmente...", 
      "Siente 2 texturas táctiles en tu ropa o mesa...", 
      "Enfoca tu mente en el contacto físico...", 
      "Cierra tus ojos suavemente ahora...", 
      "Haz 1 respiración profunda por la nariz...", 
      "Siente el aire expandiendo tus pulmones...", 
      "Exhala disolviendo las nubes mentales...", 
      "Vuelve a abrir tus ojos poco a poco...", 
      "Estás aquí, estás a salvo."
    ]
  }
];


// Helper interface for precise chronological lock and countdown tracking
export interface ChronoState {
  maxAllowedDay: number;
  msRemaining: number;
  isLocked: boolean;
  hours: number;
  minutes: number;
  seconds: number;
}

// Unified pure calculation function shared between UI rendering and notification triggers
export const calculateChronoState = (progress: {
  activationDate?: string;
  currentDay?: number;
  completionTimestamps?: Record<number, string>;
}): ChronoState => {
  if (!progress || !progress.activationDate) {
    return {
      maxAllowedDay: 1,
      msRemaining: 0,
      isLocked: false,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  const currentDay = Number(progress.currentDay || 1);
  
  // Day 1 is always unlocked immediately upon starting the program
  if (currentDay === 1) {
    return {
      maxAllowedDay: 1,
      msRemaining: 0,
      isLocked: false,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  const prevDay = currentDay - 1;
  let prevCompletionMs = 0;

  // Check if we have the completion timestamp of the previous day
  if (progress.completionTimestamps && progress.completionTimestamps[prevDay]) {
    prevCompletionMs = new Date(progress.completionTimestamps[prevDay]).getTime();
  } else {
    // Robust fallback calculation if timestamp is missing
    const activatedDate = new Date(progress.activationDate);
    prevCompletionMs = activatedDate.getTime() + (prevDay - 1) * 24 * 60 * 60 * 1000;
  }

  if (isNaN(prevCompletionMs)) {
    return {
      maxAllowedDay: 1,
      msRemaining: 0,
      isLocked: false,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  const now = new Date().getTime();
  const unlockTime = prevCompletionMs + 24 * 60 * 60 * 1000;
  const msRemaining = Math.max(0, unlockTime - now);
  const isLocked = msRemaining > 0;

  const totalSeconds = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Maximum day chronologically allowed is currentDay if unlocked, otherwise currentDay - 1
  const maxAllowedDay = isLocked ? currentDay - 1 : currentDay;

  return {
    maxAllowedDay,
    msRemaining,
    isLocked,
    hours,
    minutes,
    seconds
  };
};


export default function App() {
  const { getShareText, shareToWhatsApp, shareWithFallback } = useWhatsAppShare();
  const auth = useAuth();

  // Navigation Phases: "LANDING" | "SCAN_TEST" | "SCAN_RESULTS" | "LOGIN" | "DASHBOARD" | "WIZARD" | "LOADING" | "RESULTS" | "ADMIN"
  const [phase, setPhase] = useState<"LANDING" | "SCAN_TEST" | "SCAN_RESULTS" | "LOGIN" | "DASHBOARD" | "WIZARD" | "LOADING" | "RESULTS" | "ADMIN">(() => {
    // Check if deep link params are present in URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("email") || params.get("action") === "test") {
        return "LANDING";
      }
    }

    const activeEmail = typeof window !== "undefined" ? (localStorage.getItem("MAPA_CURRENT_USER_EMAIL") || "") : "";
    if (activeEmail) {
      const adminEmails = ["contacto@tupodermental.club"];
      if (adminEmails.includes(activeEmail.toLowerCase().trim())) {
        return "ADMIN";
      }

      // Check user progress
      const savedUserProgress = typeof window !== "undefined" ? localStorage.getItem(`MAPA_USER_PROGRESS_${activeEmail.toLowerCase().trim()}`) : null;
      if (savedUserProgress) {
        try {
          const parsed = JSON.parse(savedUserProgress);
          if (parsed && parsed.activationDate) {
            return "DASHBOARD";
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Fallback to legacy progress
    const savedLegacy = typeof window !== "undefined" ? localStorage.getItem("MAPA_7DAY_PROGRESS_V2") : null;
    if (savedLegacy) {
      try {
        const parsed = JSON.parse(savedLegacy);
        if (parsed && parsed.activationDate) {
          return "DASHBOARD";
        }
      } catch (e) {
        console.error(e);
      }
    }

    return "SCAN_TEST";
  });
  
  // Landing States
  const [selectedChecks, setSelectedChecks] = useState<Record<number, boolean>>({});
  const [activePillarTab, setActivePillarTab] = useState<number>(0);
  const [pillarScores, setPillarScores] = useState<number[]>([75, 60, 80, 85, 70]);
  
  // User Login and Session Recovery states
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem("MAPA_CURRENT_USER_EMAIL") || "";
  });

  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginNombre, setLoginNombre] = useState<string>("");
  const [loginAlias, setLoginAlias] = useState<string>("");
  const [loginWhatsapp, setLoginWhatsapp] = useState<string>("");
  const [loginAccessCode, setLoginAccessCode] = useState<string>("");
  const [isRequestingCode, setIsRequestingCode] = useState<boolean>(false);
  const [loginTermsAccepted, setLoginTermsAccepted] = useState<boolean>(true);

  // 7-Day Program State
  const [programProgress, setProgramProgress] = useState<{
    activationDate: string;
    currentDay: number;
    completedDays: number[];
    responses: Record<number, QuizResponse[]>;
    leadInfo: LeadInfo;
    leadCaptured: boolean;
    completionTimestamps?: Record<number, string>;
    hasDownloadedApp?: boolean;
    unlockedAudios?: string[];
    onboardingCompletado?: boolean;
    exerciseLogs?: Array<{ taskName: string; timestamp: string; feeling: string }>;
  }>(() => {
    const activeEmail = localStorage.getItem("MAPA_CURRENT_USER_EMAIL") || "";
    if (activeEmail) {
      const savedUserProgress = localStorage.getItem(`MAPA_USER_PROGRESS_${activeEmail.toLowerCase().trim()}`);
      if (savedUserProgress) {
        try {
          return JSON.parse(savedUserProgress);
        } catch (e) {
          console.error("Error loading user progress", e);
        }
      }
    }
    // Fallback to legacy global progress
    const saved = localStorage.getItem("MAPA_7DAY_PROGRESS_V2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.activationDate) {
          return parsed;
        }
      } catch (e) {
        console.error("Error restoring progress", e);
      }
    }
    return {
      activationDate: "",
      currentDay: 1,
      completedDays: [],
      responses: {},
      leadInfo: { nombre: "", email: "", whatsapp: "" },
      leadCaptured: false,
      completionTimestamps: {},
      hasDownloadedApp: false,
      unlockedAudios: [],
      onboardingCompletado: false
    };
  });

  // Focus Mode state to hide visual distractions and focus on active day & sound player
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Active Card reference for smooth auto-scrolling
  const activeCardRef = useRef<HTMLDivElement | null>(null);

  // Tick state to drive the dynamic countdown timers every second
  const [tick, setTick] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-route active users or returning guests from LANDING to DASHBOARD or ADMIN
  useEffect(() => {
    if (!auth.isLoadingSession && auth.isAuthenticated && auth.currentUserEmail) {
      if (auth.currentUserEmail !== currentUserEmail) {
        setCurrentUserEmail(auth.currentUserEmail);
      }
      if (auth.userProgress && auth.userProgress.activationDate) {
        setProgramProgress(auth.userProgress);
        if (auth.userProgress.leadInfo) {
          setLeadInfo(auth.userProgress.leadInfo);
          setLeadCaptured(true);
        }
      }
      if (phase === "LANDING" || phase === "LOGIN") {
        if (auth.isAdmin) {
          setPhase("ADMIN");
        } else if ((auth.userProgress && auth.userProgress.activationDate) || programProgress.activationDate) {
          setPhase("DASHBOARD");
        }
      }
    } else if (phase === "LANDING") {
      if (currentUserEmail) {
        const adminEmails = ["contacto@tupodermental.club"];
        if (adminEmails.includes(currentUserEmail.toLowerCase().trim())) {
          setPhase("ADMIN");
          return;
        } else if (programProgress && programProgress.activationDate) {
          setPhase("DASHBOARD");
          return;
        }
      }
    }
  }, [auth.isLoadingSession, auth.isAuthenticated, auth.currentUserEmail, auth.userProgress, auth.isAdmin, currentUserEmail, phase, programProgress]);

  // Precise chronological calculations for 24h consecutive lock logic (based on previous day completion)
  const getChronologicalState = () => {
    return calculateChronoState(programProgress);
  };

  const currentChronoState = getChronologicalState();
  const activeDayReady = phase === "DASHBOARD" && !currentChronoState.isLocked;

  useEffect(() => {
    if (activeDayReady && activeCardRef.current) {
      // 1. Desplazamiento suave y automático directo a la tarjeta del día listo
      const timer = setTimeout(() => {
        if (activeCardRef.current) {
          activeCardRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeDayReady, phase]);

  const getUserShortName = (info: { nombre: string; alias?: string }) => {
    if (info.alias && info.alias.trim()) {
      return info.alias.trim();
    }
    if (!info.nombre) return "Usuaria";
    const firstWord = info.nombre.trim().split(/\s+/)[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  };

  const getTimeRemainingForDay = (dayNum: number) => {
    const { maxAllowedDay, isLocked, msRemaining } = getChronologicalState();
    if (dayNum <= maxAllowedDay) {
      return { isLocked: false, hours: 0, minutes: 0, seconds: 0, text: "" };
    }
    
    const currentDay = programProgress.currentDay;
    let dayMsRemaining = 0;
    if (dayNum === currentDay) {
      dayMsRemaining = msRemaining;
    } else {
      const daysOffset = dayNum - currentDay;
      const baseRemaining = isLocked ? msRemaining : 0;
      dayMsRemaining = baseRemaining + (daysOffset * 24 * 60 * 60 * 1000);
    }
    
    const totalSeconds = Math.floor(dayMsRemaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return {
      isLocked: true,
      hours,
      minutes,
      seconds,
      text: `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m`
    };
  };

  // Keep leads state in sync
  const [leadInfo, setLeadInfo] = useState<LeadInfo>(programProgress.leadInfo || { nombre: "", email: "", whatsapp: "" });
  const [leadCaptured, setLeadCaptured] = useState<boolean>(programProgress.leadCaptured || false);

  // Active temporary answers for the CURRENT day's questionnaire
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userResponses, setUserResponses] = useState<QuizResponse[]>([]);
  const [isEvaluationReady, setIsEvaluationReady] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EmotionalProfile | null>(null);
  
  // Dashboard alerts and messages
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);

  // Rewards states
  const [unlockedAudioModal, setUnlockedAudioModal] = useState<{ isOpen: boolean; type: "day3" | "day4" | "day5" | "day7" | null }>({ isOpen: false, type: null });
  const [milestoneModal, setMilestoneModal] = useState<{ isOpen: boolean; daysCount: number }>({ isOpen: false, daysCount: 3 });
  const [isClaraProfileOpen, setIsClaraProfileOpen] = useState<boolean>(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [adminFormEmail, setAdminFormEmail] = useState<string>("contacto@tupodermental.club");
  const [adminFormPass, setAdminFormPass] = useState<string>("");
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>("");
  const headerFileInputRef = useRef<HTMLInputElement | null>(null);

  // Email sending states for the final report
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<boolean>(false);
  const [emailSendingStep, setEmailSendingStep] = useState<string>("");

  // Loading Simulation Text Steps
  const [loadingStepText, setLoadingStepText] = useState<string>("Iniciando escaneo del radar emocional...");
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Copy/Share state alert
  const [shareAlert, setShareAlert] = useState<string | null>(null);
  const [leadSubmitToast, setLeadSubmitToast] = useState<string | null>(null);
  const [whatsappCountryCode, setWhatsappCountryCode] = useState<string>("+34");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [confirmEmail, setConfirmEmail] = useState<string>("");

  // Modal selector for privacy and terms documents
  const [activeDocumentModal, setActiveDocumentModal] = useState<"PRIVACY" | "TERMS" | null>(null);

  // New Initial 7-Question Scan states
  const [scanMetrics, setScanMetrics] = useState<any>(null);
  const [scanRadialData, setScanRadialData] = useState<any[]>([]);
  const [scanInterpretacion, setScanInterpretacion] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [selectedDayPreview, setSelectedDayPreview] = useState<number | null>(null);

  const getUserArchetypeSlug = (): "VIGILANTE" | "ANTICIPADOR" | "HIPERCONTROLADOR" | "SOBRECARGADO" | "PROTECTOR" => {
    if (evaluationResult?.id) {
      if (evaluationResult.id === "VIGILANTE") return "VIGILANTE";
      if (evaluationResult.id === "ANTICIPADOR") return "ANTICIPADOR";
      if (evaluationResult.id === "HIPERCONTROLADOR") return "HIPERCONTROLADOR";
      if (evaluationResult.id === "SOBRECARGADO") return "SOBRECARGADO";
      if (evaluationResult.id === "PROTECTOR") return "PROTECTOR";
    }
    const allResponses = Object.values(programProgress.responses).flat() as QuizResponse[];
    if (allResponses.length === 0) {
      return "VIGILANTE";
    }
    
    const scores = { vigilante: 0, anticipador: 0, hipercontrolador: 0, sobrecargado: 0, protectorSilencioso: 0 };
    allResponses.forEach((resItem) => {
      const question = QUESTIONS.find((q) => q.id === resItem.questionId);
      if (question && question.options) {
        const option = question.options.find((opt) => opt.value === resItem.value);
        if (option && option.scoreWeight) {
          Object.keys(option.scoreWeight).forEach((key) => {
            const pKey = key as keyof typeof scores;
            scores[pKey] += (option.scoreWeight[pKey] || 0);
          });
        }
      }
    });

    let dominantKey = "vigilante";
    let maxVal = -1;
    Object.keys(scores).forEach((key) => {
      const pKey = key as keyof typeof scores;
      if (scores[pKey] > maxVal) {
        maxVal = scores[pKey];
        dominantKey = pKey;
      }
    });

    if (dominantKey === "anticipador") return "ANTICIPADOR";
    if (dominantKey === "hipercontrolador") return "HIPERCONTROLADOR";
    if (dominantKey === "sobrecargado") return "SOBRECARGADO";
    if (dominantKey === "protectorSilencioso") return "PROTECTOR";
    return "VIGILANTE";
  };
  
  // Mini-ejercicio de calma states
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [isMiniExerciseActive, setIsMiniExerciseActive] = useState<boolean>(false);
  const [miniSecondsLeft, setMiniSecondsLeft] = useState<number>(30);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isMiniExerciseActive) {
      interval = setInterval(() => {
        setMiniSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsMiniExerciseActive(false);
            if (interval) clearInterval(interval);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setMiniSecondsLeft(30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMiniExerciseActive]);

  const rotateMiniExercise = () => {
    if (isMiniExerciseActive) return;
    let nextIdx = currentExerciseIndex;
    if (MINI_EXERCISES.length > 1) {
      while (nextIdx === currentExerciseIndex) {
        nextIdx = Math.floor(Math.random() * MINI_EXERCISES.length);
      }
    }
    setCurrentExerciseIndex(nextIdx);
  };

  // Scroll Indicator and Alarm Systems
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [alarmAudio] = useState<HTMLAudioElement | null>(() => {
    if (typeof Audio !== "undefined") {
      const audio = new Audio("https://f005.backblazeb2.com/file/M.A.P.A/Tu+mapa.mp3");
      audio.loop = false;
      return audio;
    }
    return null;
  });
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);
  const [alarmReason, setAlarmReason] = useState<string>("");
  const [testReminderAlarmEnabled, setTestReminderAlarmEnabled] = useState<boolean>(false);
  const [testReminderMode, setTestReminderMode] = useState<"unlocked" | "scheduled">(() => {
    return (localStorage.getItem("MAPA_TEST_REMINDER_MODE") as "unlocked" | "scheduled") || "scheduled";
  });
  const [testReminderTime, setTestReminderTime] = useState<string>(() => {
    return localStorage.getItem("MAPA_TEST_REMINDER_TIME") || "20:00";
  });
  const [lastReminderFiredDate, setLastReminderFiredDate] = useState<string>(() => {
    return localStorage.getItem("MAPA_LAST_REMINDER_FIRED_DATE") || "";
  });
  const [testReminderFired, setTestReminderFired] = useState<boolean>(false);
  const [activeTaskAlarm, setActiveTaskAlarm] = useState<{ taskName: string; secondsLeft: number; isRunning: boolean } | null>(null);
  const [alarmPanelOpen, setAlarmPanelOpen] = useState<boolean>(false);
  const [completedTaskFeedback, setCompletedTaskFeedback] = useState<{ taskName: string; timestamp: string } | null>(null);

  // Global background ambient music (https://f005.backblazeb2.com/file/M.A.P.A/Tu+mapa.mp3)
  const ambientAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [ambientMuted, setAmbientMuted] = useState<boolean>(false);

  const logExerciseFeeling = async (taskName: string, feeling: string) => {
    const logEntry = {
      taskName,
      timestamp: new Date().toISOString(),
      feeling
    };
    const updatedProgress = {
      ...programProgress,
      exerciseLogs: [...(programProgress.exerciseLogs || []), logEntry]
    };
    setProgramProgress(updatedProgress);
    
    const emailKey = currentUserEmail ? currentUserEmail.toLowerCase().trim() : "";
    if (emailKey) {
      localStorage.setItem(`MAPA_USER_PROGRESS_${emailKey}`, JSON.stringify(updatedProgress));
    }
    localStorage.setItem("MAPA_7DAY_PROGRESS_V2", JSON.stringify(updatedProgress));

    try {
      const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
      if (token && emailKey) {
        await fetch("/api/update-user-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            email: emailKey,
            userProgress: updatedProgress
          })
        });
      }
    } catch (e) {
      console.error("Error syncing exercise log to server:", e);
    }
  };

  const saveCustomAvatar = async (avatar: { type: "emoji" | "image"; value: string }) => {
    const updatedProgress = {
      ...programProgress,
      customAvatar: avatar
    };
    setProgramProgress(updatedProgress);
    
    const emailKey = currentUserEmail ? currentUserEmail.toLowerCase().trim() : "";
    if (emailKey) {
      localStorage.setItem(`MAPA_USER_PROGRESS_${emailKey}`, JSON.stringify(updatedProgress));
    }
    localStorage.setItem("MAPA_7DAY_PROGRESS_V2", JSON.stringify(updatedProgress));

    try {
      const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
      if (token && emailKey) {
        await fetch("/api/update-user-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            email: emailKey,
            userProgress: updatedProgress
          })
        });
      }
    } catch (e) {
      console.error("Error syncing custom avatar to server:", e);
    }
  };

  const handleHeaderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert("Por favor selecciona una imagen válida (PNG, JPG o WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5 MB.");
      return;
    }

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

          // Update local state and sync
          saveCustomAvatar({ type: "image", value: compressedBase64 });

          // Sync directly with profile picture backend endpoint
          if (currentUserEmail) {
            const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            fetch("/api/user/update-profile-picture", {
              method: "POST",
              headers,
              body: JSON.stringify({
                email: currentUserEmail,
                profilePicture: compressedBase64,
                customAvatar: { type: "image", value: compressedBase64 }
              })
            }).catch((err) => console.error("Error updating profile picture from header:", err));
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  useEffect(() => {
    localStorage.setItem("MAPA_TEST_REMINDER_ENABLED", String(testReminderAlarmEnabled));
  }, [testReminderAlarmEnabled]);

  useEffect(() => {
    localStorage.setItem("MAPA_TEST_REMINDER_MODE", testReminderMode);
  }, [testReminderMode]);

  useEffect(() => {
    localStorage.setItem("MAPA_TEST_REMINDER_TIME", testReminderTime);
  }, [testReminderTime]);

  // Triggering & stopping audio alarms
  const triggerAlarm = (reason: string) => {
    setAlarmReason(reason);
    setIsAlarmPlaying(true);
    if (alarmAudio) {
      alarmAudio.loop = false;
      alarmAudio.play().catch(e => {
        console.warn("Autoplay block or audio play warning:", e);
      });
    }

    // Trigger local Service Worker notification to alert even if app is closed, in background, or phone is locked!
    if ("serviceWorker" in navigator && "Notification" in window) {
      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification("🔔 Alarma M.A.P.A.™", {
            body: reason,
            icon: "/icon-512.png",
            badge: "/icon-512.png",
            vibrate: [300, 100, 300, 100, 300], // Strong tactile vibrations
            tag: "mapa-timer-alarm",
            requireInteraction: true // Requires user dismiss, works wonderfully in background
          } as any);
        }).catch((err) => {
          console.warn("Could not register background notification in Service Worker:", err);
          try {
            new Notification("🔔 Alarma M.A.P.A.™", {
              body: reason,
              icon: "/icon-512.png"
            });
          } catch (e) {
            console.error(e);
          }
        });
      }
    }
  };

  const triggerPushNotificationOnly = (reason: string) => {
    if ("serviceWorker" in navigator && "Notification" in window) {
      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification("🔔 M.A.P.A.™ Mujer", {
            body: reason,
            icon: "/icon-512.png",
            badge: "/icon-512.png",
            vibrate: [300, 100, 300, 100, 300],
            tag: "mapa-test-ready",
            requireInteraction: false
          } as any);
        }).catch((err) => {
          console.warn("Could not register background notification in Service Worker:", err);
          try {
            new Notification("🔔 M.A.P.A.™ Mujer", {
              body: reason,
              icon: "/icon-512.png"
            });
          } catch (e) {
            console.error(e);
          }
        });
      }
    }
  };

  const stopAlarm = () => {
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
    }
    setIsAlarmPlaying(false);
    setAlarmReason("");
  };

  // Scroll to Top visibility logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Alarm timer countdown tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTaskAlarm && activeTaskAlarm.isRunning) {
      interval = setInterval(() => {
        setActiveTaskAlarm((prev) => {
          if (!prev) return null;
          if (prev.secondsLeft <= 1) {
            triggerAlarm(`¡Alarma de Bienestar! Es hora de tu ejercicio: "${prev.taskName}"`);
            const finishedTask = prev.taskName;
            setTimeout(() => {
              setCompletedTaskFeedback({
                taskName: finishedTask,
                timestamp: new Date().toISOString()
              });
            }, 50);
            return null; // triggered, stop
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTaskAlarm]);

  // Synchronize alarm settings to server for reliable background triggers (even with locked/inactive screens!)
  const lastSyncedAlarmRef = useRef<{ taskName: string; secondsLeft: number } | null>(null);

  useEffect(() => {
    const emailKey = currentUserEmail || leadInfo.email || "";
    if (!emailKey) return;

    // Determine if the activeTaskAlarm has changed significantly (newly set or cancelled)
    let shouldSyncAlarm = false;
    if (!activeTaskAlarm && lastSyncedAlarmRef.current) {
      // Alarm was cancelled or finished
      shouldSyncAlarm = true;
    } else if (activeTaskAlarm) {
      if (!lastSyncedAlarmRef.current) {
        // Newly set alarm
        shouldSyncAlarm = true;
      } else {
        // If task name changed, or we set a brand new duration
        const diff = Math.abs(lastSyncedAlarmRef.current.secondsLeft - activeTaskAlarm.secondsLeft);
        if (lastSyncedAlarmRef.current.taskName !== activeTaskAlarm.taskName || diff > 10) {
          shouldSyncAlarm = true;
        }
      }
    }

    if (shouldSyncAlarm) {
      lastSyncedAlarmRef.current = activeTaskAlarm ? { taskName: activeTaskAlarm.taskName, secondsLeft: activeTaskAlarm.secondsLeft } : null;
    }

    // Always sync on daily reminder settings changes, but debounce slightly to avoid double calls
    const delayDebounce = setTimeout(() => {
      let expiresAt: string | null = null;
      if (activeTaskAlarm && activeTaskAlarm.isRunning) {
        // Calculate expiresAt based on current time and secondsLeft
        expiresAt = new Date(Date.now() + activeTaskAlarm.secondsLeft * 1000).toISOString();
      }

      fetch("/api/sync-alarms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailKey,
          testReminderAlarmEnabled,
          testReminderMode,
          testReminderTime,
          timezoneOffset: new Date().getTimezoneOffset(),
          activeTaskAlarm: activeTaskAlarm ? {
            taskName: activeTaskAlarm.taskName,
            expiresAt: expiresAt
          } : null
        })
      }).catch((err) => console.warn("Failed to sync alarm settings to server:", err));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [
    currentUserEmail,
    leadInfo.email,
    testReminderAlarmEnabled,
    testReminderMode,
    testReminderTime,
    activeTaskAlarm ? activeTaskAlarm.taskName : null,
    activeTaskAlarm ? activeTaskAlarm.isRunning : false,
  ]);

  // Daily test countdown reminder check
  // Enforce DASHBOARD phase for users who completed 7 days process
  useEffect(() => {
    if (currentUserEmail && programProgress?.completedDays && programProgress.completedDays.length >= 7) {
      if (phase === "WIZARD" || phase === "SCAN_TEST" || phase === "SCAN_RESULTS" || phase === "LOADING" || phase === "RESULTS") {
        setPhase("DASHBOARD");
      }
    }
  }, [currentUserEmail, programProgress?.completedDays, phase]);

  useEffect(() => {
    if (!programProgress.activationDate) return;
    const chrono = getChronologicalState();
    const completedCount = programProgress.completedDays?.length || 0;
    if (completedCount >= 7 || !testReminderAlarmEnabled) return;

    const emailKey = currentUserEmail || leadInfo.email || "guest";
    const reminderKey = `MAPA_TEST_REMINDER_FIRED_${emailKey.toLowerCase().trim()}_DAY_${programProgress.currentDay}`;
    const hasFired = localStorage.getItem(reminderKey) === "true";

    if (testReminderMode === "unlocked") {
      // If next day is unlocked (isLocked is false), total days completed is less than 7, reminder is enabled, and reminder hasn't fired yet
      if (!chrono.isLocked && !hasFired) {
        triggerPushNotificationOnly(`¡Tu prueba diaria M.A.P.A. del Día ${programProgress.currentDay} ya está disponible!`);
        localStorage.setItem(reminderKey, "true");
        setTestReminderFired(true);
      }

      // Reset reminder fired state if it gets locked again (e.g. they completed a day and next day is locked)
      if (chrono.isLocked && hasFired) {
        localStorage.removeItem(reminderKey);
        setTestReminderFired(false);
      }
    } else {
      // Scheduled hour behavior using the native notification API
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayDateStr = `${year}-${month}-${day}`;

      const currentHourStr = String(today.getHours()).padStart(2, '0');
      const currentMinStr = String(today.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHourStr}:${currentMinStr}`;

      if (
        !chrono.isLocked &&
        lastReminderFiredDate !== todayDateStr &&
        currentTimeStr === testReminderTime
      ) {
        triggerPushNotificationOnly(`¡Tu recordatorio M.A.P.A.™! Es el momento ideal seleccionado para realizar tu práctica de calma.`);
        setLastReminderFiredDate(todayDateStr);
        localStorage.setItem("MAPA_LAST_REMINDER_FIRED_DATE", todayDateStr);
      }
    }
  }, [
    tick, 
    programProgress.activationDate, 
    programProgress.currentDay, 
    programProgress.completedDays, 
    testReminderAlarmEnabled, 
    testReminderMode, 
    testReminderTime, 
    testReminderFired, 
    lastReminderFiredDate,
    currentUserEmail,
    leadInfo.email
  ]);
  
  // Interactive legend states for the 7-day activation chart
  const [showActivationData, setShowActivationData] = useState<boolean>(true);
  const [showHealthyLimit, setShowHealthyLimit] = useState<boolean>(true);

  // Selector function for dynamic emotional regulation motivational messages
  const getMotivationalMessageForDay = (dayName: string) => {
    const messages = [
      "¡Respira profundo, estás haciendo un gran trabajo!",
      "Tu respiración es tu ancla en momentos de tormenta. Siente su ritmo.",
      "Cada exhalación libera la tensión acumulada en tu cuerpo. Permítete soltar.",
      "Pausar no es detenerse, es restaurar tu equilibrio interior de forma gradual.",
      "Confía en la capacidad natural de tu sistema para recuperar la calma y la seguridad.",
      "Un pequeño momento de atención plena tiene el poder de transformar todo tu día.",
      "Inhala paz, exhala tensión. Estás a salvo aquí y ahora en este instante."
    ];
    // Use character codes to calculate a stable index based on the day name,
    // avoiding flickering while still assigning a different message for each bar.
    let hash = 0;
    for (let i = 0; i < dayName.length; i++) {
      hash = dayName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % messages.length;
    return messages[index];
  };

  // Get activation data for 7-day comparative bar chart
  const get7DayActivationData = () => {
    const baseActivation = evaluationResult?.activationLevel || 85;
    const days = [1, 2, 3, 4, 5, 6, 7];
    
    return days.map((dayNum) => {
      const responses = (programProgress.responses && programProgress.responses[dayNum]) || [];
      let score = 0;
      
      if (responses.length > 0) {
        let totalWeight = 0;
        let count = 0;
        responses.forEach((resItem) => {
          const question = QUESTIONS.find((q) => q.id === resItem.questionId);
          if (question && question.options) {
            const option = question.options.find((opt) => opt.value === resItem.value);
            if (option) {
              const weights = option.scoreWeight ? Object.values(option.scoreWeight) : [];
              const sumOfWeights = weights.reduce((a, b) => a + b, 0);
              totalWeight += sumOfWeights;
              count++;
            }
          }
        });
        if (count > 0) {
          score = Math.round(Math.min(95, Math.max(30, (totalWeight / (count * 3)) * 85)));
        }
      }
      
      if (score === 0) {
        const reductionStep = (baseActivation - 42) / 6;
        score = Math.round(baseActivation - (dayNum - 1) * reductionStep + (Math.sin(dayNum) * 3));
        score = Math.min(95, Math.max(35, score));
      }
      
      return {
        name: `Día ${dayNum}`,
        "Nivel de Activación": score,
        "Límite Saludable": 45
      };
    });
  };

  // Global Soft Click Audio Cues for tranquility
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === "BUTTON" || 
        target.closest("button") || 
        target.getAttribute("role") === "button" || 
        target.tagName === "A" ||
        target.closest("a") ||
        target.classList.contains("cursor-pointer") ||
        target.classList.contains("btn");

      if (isInteractive) {
        playClickCue();
      }
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  // Ambient Background Audio Lifecycle
  useEffect(() => {
    if (typeof window === "undefined" || typeof Audio === "undefined") return;

    const audio = new Audio("https://f005.backblazeb2.com/file/M.A.P.A/Tu+mapa.mp3");
    audio.loop = false; // Plays only once as requested (no ambient looping)
    audio.volume = 0.20; // Safe low-medium volume (Bajo-Medio) so it is never annoying
    ambientAudioRef.current = audio;

    const savedMuted = localStorage.getItem("MAPA_AMBIENT_MUTED") === "true";
    if (savedMuted) {
      audio.muted = true;
      setAmbientMuted(true);
    }

    const handleStopAll = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.sourceId !== "ambient_audio") {
        if (ambientAudioRef.current && !ambientAudioRef.current.paused) {
          ambientAudioRef.current.pause();
          setIsAmbientPlaying(false);
        }
      }
    };
    window.addEventListener("mapa-stop-all-audios", handleStopAll);

    const startAudio = () => {
      if (audio.paused && !savedMuted) {
        audio.play().then(() => {
          setIsAmbientPlaying(true);
          setAmbientMuted(false);
        }).catch((err) => {
          console.log("[Ambient Audio] Autoplay deferred waiting for first user gesture:", err);
        });
      }
    };

    const handleEnded = () => {
      setIsAmbientPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);

    // Try starting immediately
    startAudio();

    // Interaction fallback trigger
    const handleGesture = () => {
      startAudio();
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };

    window.addEventListener("click", handleGesture);
    window.addEventListener("touchstart", handleGesture);
    window.addEventListener("keydown", handleGesture);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      window.removeEventListener("mapa-stop-all-audios", handleStopAll);
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
  }, []);

  const toggleAmbientAudio = () => {
    const audio = ambientAudioRef.current;
    if (!audio) return;
    if (isAmbientPlaying) {
      audio.pause();
      setIsAmbientPlaying(false);
      localStorage.setItem("MAPA_AMBIENT_MUTED", "true");
      setAmbientMuted(true);
    } else {
      window.dispatchEvent(new CustomEvent("mapa-stop-all-audios", { detail: { sourceId: "ambient_audio" } }));
      audio.muted = false;
      audio.play().then(() => {
        setIsAmbientPlaying(true);
        setAmbientMuted(false);
        localStorage.setItem("MAPA_AMBIENT_MUTED", "false");
      }).catch(e => console.warn(e));
    }
  };

  const handleConfirmAppDownloaded = () => {
    setProgramProgress(prev => {
      const updated = {
        ...prev,
        hasDownloadedApp: true
      };
      const userEmail = leadInfo.email || currentUserEmail;
      if (userEmail) {
        localStorage.setItem(
          `MAPA_USER_PROGRESS_${userEmail.toLowerCase().trim()}`,
          JSON.stringify(updated)
        );
      }
      return updated;
    });
  };

  // Centralized synchronization using the custom useAuthSynchronizer hook
  const {
    syncing,
    syncError,
    isOffline,
    syncProgressToCloud,
    forceFetchProgress
  } = useAuthSynchronizer({
    programProgress,
    setProgramProgress,
    leadInfo,
    setLeadInfo,
    leadCaptured,
    setLeadCaptured,
    currentUserEmail,
    setCurrentUserEmail,
    setPhase,
    setDashboardNotice
  });

  // Global Hardware Back Button (popstate) Handler for App.tsx
  useEffect(() => {
    const handlePopState = () => {
      // 1. Check if App.tsx level drawers or modals are open
      if (isClaraProfileOpen) {
        setIsClaraProfileOpen(false);
        return;
      }
      if (isProfileSettingsOpen) {
        setIsProfileSettingsOpen(false);
        return;
      }
      if (isAvatarModalOpen) {
        setIsAvatarModalOpen(false);
        return;
      }
      if (isAdminLoginModalOpen) {
        setIsAdminLoginModalOpen(false);
        return;
      }
      if (unlockedAudioModal.isOpen) {
        setUnlockedAudioModal({ isOpen: false, type: null });
        return;
      }
      if (milestoneModal.isOpen) {
        setMilestoneModal({ isOpen: false, daysCount: 3 });
        return;
      }

      // 2. Check phase navigation
      if (phase === "WIZARD" || phase === "SCAN_TEST" || phase === "SCAN_RESULTS" || phase === "ADMIN" || phase === "LOGIN") {
        if (currentUserEmail) {
          setPhase("DASHBOARD");
        } else {
          setPhase("LANDING");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    isClaraProfileOpen,
    isProfileSettingsOpen,
    isAvatarModalOpen,
    isAdminLoginModalOpen,
    unlockedAudioModal.isOpen,
    milestoneModal.isOpen,
    phase,
    currentUserEmail
  ]);

  // Synchronize to Cache Storage for Service Worker push notification dynamic state check
  useEffect(() => {
    if (programProgress && typeof window !== "undefined" && 'caches' in window) {
      try {
        const cacheData = new Response(JSON.stringify(programProgress), {
          headers: { 'Content-Type': 'application/json' }
        });
        caches.open("mapa-user-progress-cache").then((cache) => {
          cache.put("/local-user-progress", cacheData);
        }).catch((err) => {
          console.warn("[M.A.P.A.] Error caching user progress for sw sync:", err);
        });
      } catch (err) {
        console.warn("[M.A.P.A.] Failed to write progress to cache:", err);
      }
    }
  }, [programProgress]);

  // Autocomplete existing profile fields live when typing an email
  useEffect(() => {
    const emailKey = loginEmail.toLowerCase().trim();
    if (emailKey && emailKey.includes("@")) {
      const existing = localStorage.getItem(`MAPA_USER_PROGRESS_${emailKey}`);
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          if (parsed && parsed.leadInfo) {
            if (parsed.leadInfo.nombre && !loginNombre) {
              setLoginNombre(parsed.leadInfo.nombre);
            }
            if (parsed.leadInfo.alias && !loginAlias) {
              setLoginAlias(parsed.leadInfo.alias);
            }
            if (parsed.leadInfo.whatsapp && !loginWhatsapp) {
              setLoginWhatsapp(parsed.leadInfo.whatsapp);
            }
          }
        } catch (e) {
          console.error("Error reading live progress autocomplete", e);
        }
      }
    }
  }, [loginEmail]);

  // Deep-link check: if URL has action=test, handle automatic entrance and launch daily test
  // Also check for auto-login / auto-activation URL query parameters (e.g. ?email=correo@dominio.com&code=123456)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      const codeParam = params.get("code") || params.get("access_code");

      if (emailParam) {
        const cleanEmail = emailParam.toLowerCase().trim();
        setLoginEmail(cleanEmail);
        if (codeParam) {
          setLoginAccessCode(codeParam.toUpperCase().trim());
        }

        // Trigger automatic activation/login for seamless entry
        fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            accessCode: (codeParam || "").toUpperCase().trim()
          })
        })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            console.log("Auto-login / auto-activación exitosa:", cleanEmail);
            const loadedProgress = data.userProgress;
            auth.loginSession(data.token, cleanEmail, loadedProgress, data.isAdmin);
            setCurrentUserEmail(cleanEmail);
            setProgramProgress(loadedProgress);
            setLeadInfo(loadedProgress.leadInfo);
            setLeadCaptured(true);
            
            const adminEmails = ["contacto@tupodermental.club"];
            if (adminEmails.includes(cleanEmail) || data.isAdmin) {
              setPhase("ADMIN");
            } else {
              setPhase("DASHBOARD");
              const displayName = loadedProgress.leadInfo.alias || getUserShortName(loadedProgress.leadInfo);
              setDashboardNotice(`🎯 ¡Activación automática concedida! Bienvenida a M.A.P.A.™ Mujer, ${displayName}.`);
              setTimeout(() => setDashboardNotice(null), 5000);
            }
          }
        })
        .catch((err) => {
          console.warn("Fallo en auto-login automático:", err);
        });
      }

      const action = params.get("action");
      if (action === "test") {
        const activeEmail = localStorage.getItem("MAPA_CURRENT_USER_EMAIL");
        if (activeEmail) {
          const emailKey = activeEmail.toLowerCase().trim();
          const savedProgress = localStorage.getItem(`MAPA_USER_PROGRESS_${emailKey}`);
          if (savedProgress) {
            try {
              const parsed = JSON.parse(savedProgress);
              setProgramProgress(parsed);
              const currentDay = parsed.currentDay || 1;
              
              // Verify chronological lock using unified calculator
              const chronoState = calculateChronoState(parsed);
              const isLocked = chronoState.isLocked;

              if (!isLocked) {
                // Launch questionnaire for the active day directly
                const existingQuiz = parsed.responses[currentDay] || [];
                setUserResponses(existingQuiz);
                setCurrentQuestionIndex(0);
                setIsEvaluationReady(false);
                setPhase("WIZARD");
                setDashboardNotice(`🌟 ¡Ingreso rápido al Test del Día ${currentDay} activado!`);
                setTimeout(() => setDashboardNotice(null), 5000);
              } else {
                setPhase("DASHBOARD");
                setDashboardNotice(`Querida ${parsed.leadInfo?.nombre || "usuaria"}, tu test del Día ${currentDay} aún se encuentra en proceso de asimilación cronológica.`);
                setTimeout(() => setDashboardNotice(null), 8000);
              }
            } catch (e) {
              console.error("Error launching deep-link test:", e);
              setPhase("DASHBOARD");
            }
          } else {
            setPhase("DASHBOARD");
          }
        } else {
          setPhase("LOGIN");
          setDashboardNotice("Por favor, inicia sesión para acceder directamente a tu test diario.");
          setTimeout(() => setDashboardNotice(null), 5000);
        }
      }
    }
  }, []);

  // Handle high-fidelity personalized login/recovery calling the secure Hotmart auth system
  const handleRequestAccessCode = async () => {
    if (!loginEmail) {
      alert("Por favor, ingresa primero tu correo electrónico en el formulario para poder solicitar tu Código de Acceso.");
      return;
    }
    setIsRequestingCode(true);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Hemos enviado tu Código de Acceso a tu correo electrónico. Por favor, revisa tu bandeja de entrada y spam.");
      } else {
        alert(data.error || "No encontramos tu correo registrado como compradora en Hotmart.");
      }
    } catch (err) {
      console.warn("Error requesting access code:", err);
      alert("Inconveniente temporal para conectar con el servidor de seguridad. Inténtalo de nuevo.");
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      alert("Por favor, ingresa tu correo electrónico registrado.");
      return;
    }

    const emailKey = loginEmail.toLowerCase().trim();
    const rawInputCode = loginAccessCode.trim();

    // Call secure auth/login on the backend
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailKey,
        accessCode: rawInputCode
      })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "El Código de Acceso o correo proporcionados son incorrectos.");
        return;
      }

      console.log("Inicio de sesión seguro exitoso:", data);
      
      const loadedProgress = data.userProgress;
      if (loadedProgress && loadedProgress.leadInfo) {
        if (!loadedProgress.leadInfo.alias) {
          loadedProgress.leadInfo.alias = loginAlias.trim() || getUserShortName({ nombre: loadedProgress.leadInfo.nombre });
        }
      }

      auth.loginSession(data.token, emailKey, loadedProgress, data.isAdmin);
      setCurrentUserEmail(emailKey);
      setProgramProgress(loadedProgress);
      
      // Sync React states
      setLeadInfo(loadedProgress.leadInfo);
      setLeadCaptured(true);

      // Go to Admin phase if administrator, else Dashboard phase
      const adminEmails = ["contacto@tupodermental.club"];
      if (adminEmails.includes(emailKey) || data.isAdmin) {
        setPhase("ADMIN");
      } else {
        setPhase("DASHBOARD");
        const displayName = loadedProgress.leadInfo.alias || getUserShortName(loadedProgress.leadInfo);
        setDashboardNotice(`🎯 ¡Acceso concedido! Bienvenida a M.A.P.A.™ Mujer, ${displayName}.`);
        setTimeout(() => setDashboardNotice(null), 4000);
      }
    })
    .catch((err) => {
      console.warn("Fallo de red en inicio de sesión, intentando ingreso local respaldado:", err);
      // Fallback offline access (only works if they already logged in successfully before and have local progress)
      const existing = localStorage.getItem(`MAPA_USER_PROGRESS_${emailKey}`);
      if (existing) {
        try {
          const loadedProgress = JSON.parse(existing);
          setProgramProgress(loadedProgress);
          localStorage.setItem("MAPA_CURRENT_USER_EMAIL", emailKey);
          setCurrentUserEmail(emailKey);
          setLeadInfo(loadedProgress.leadInfo);
          setLeadCaptured(true);
          setPhase("DASHBOARD");
          setDashboardNotice(`🎯 ¡Acceso offline concedido! Bienvenida de nuevo, ${loadedProgress.leadInfo.nombre}.`);
          setTimeout(() => setDashboardNotice(null), 3500);
          return;
        } catch (e) {
          console.error(e);
        }
      }
      alert("No pudimos validar tus credenciales de Hotmart. Asegúrate de tener conexión a Internet para tu primer inicio de sesión.");
    });
  };

  const handleAdminModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormEmail || !adminFormPass) {
      setAdminLoginError("El correo y la contraseña son obligatorios.");
      return;
    }

    setIsAdminLoggingIn(true);
    setAdminLoginError(null);

    const emailKey = adminFormEmail.toLowerCase().trim();
    const rawPass = adminFormPass.trim();

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailKey,
        accessCode: rawPass
      })
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        setAdminLoginError(data.error || "La contraseña o el correo de administración son incorrectos.");
        return;
      }

      // Hydrate progress
      const loadedProgress = data.userProgress;
      auth.loginSession(data.token, emailKey, loadedProgress, true);
      setCurrentUserEmail(emailKey);
      if (loadedProgress) {
        setProgramProgress(loadedProgress);
        setLeadInfo(loadedProgress.leadInfo || { nombre: "Administrador", email: emailKey, whatsapp: "" });
        setLeadCaptured(true);
      }

      // Close modal & enter Admin mode
      setIsAdminLoginModalOpen(false);
      setAdminFormPass(""); // Clear password field
      setPhase("ADMIN");
    })
    .catch((err) => {
      console.error("Error logging in admin:", err);
      setAdminLoginError("Hubo un error de conexión con el servidor de seguridad.");
    })
    .finally(() => {
      setIsAdminLoggingIn(false);
    });
  };

  const handleUserLogout = () => {
    auth.logoutSession();
    setCurrentUserEmail("");
    
    // Reset to brand new progress locally
    const initialBlankProgress = {
      activationDate: "",
      currentDay: 1,
      completedDays: [],
      responses: {},
      leadInfo: { nombre: "", email: "", whatsapp: "" },
      leadCaptured: false,
      completionTimestamps: {}
    };
    setProgramProgress(initialBlankProgress);
    setLeadInfo({ nombre: "", email: "", whatsapp: "" });
    setLeadCaptured(false);
    
    // Clean up login input state too
    setLoginEmail("");
    setLoginNombre("");
    setLoginWhatsapp("");
    
    setPhase("LANDING");
    setDashboardNotice("Has cerrado sesión. Tus respuestas están resguardadas e intactas con tu correo.");
    setTimeout(() => setDashboardNotice(null), 3500);
  };

  // Scroll to top on phase changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [phase]);

  // Start the 7-Question Free Scan Initial test
  const startFreeScanTest = () => {
    if (currentUserEmail && programProgress.completedDays && programProgress.completedDays.length >= 7) {
      setPhase("DASHBOARD");
      return;
    }
    setPhase("SCAN_TEST");
  };

  const handleRestartScan = () => {
    setScanMetrics(null);
    setScanRadialData([]);
    setScanInterpretacion("");
    setPhase("LANDING");
  };

  const handleScanComplete = async (responses: any) => {
    setPhase("LOADING");
    setLoadingProgress(10);
    setLoadingStepText("Iniciando escaneo de marcadores autónomos...");

    const progressTimer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 12;
      });
    }, 500);

    try {
      const apiInput = responses.map((r: any) => ({
        questionId: r.questionIndex + 1,
        value: String(r.value),
        category: "scan"
      }));

      const res = await fetch("/api/evaluate-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: apiInput })
      });

      const data = await res.json();
      clearInterval(progressTimer);

      if (data.success) {
        setLoadingProgress(100);
        setScanMetrics(data.metrics);
        setScanRadialData(data.radialData);
        setScanInterpretacion(data.interpretacionIA);
        
        setTimeout(() => {
          setPhase("SCAN_RESULTS");
        }, 600);
      } else {
        throw new Error(data.error || "Error al computar!");
      }
    } catch (e) {
      clearInterval(progressTimer);
      console.warn("Scan AI evaluation helper failed, running offline clinical fallback:", e);
      
      setScanMetrics({
        activacion: 72,
        preocupacion: 82,
        alerta: 64,
        agotamiento: 76,
        claridad: 48,
        regulacion: 41,
        bienestar: 44,
        riesgoSobrecarga: 74,
        factoresProteccion: [
          "Sensibilidad empática sobresaliente para decodificar entornos.",
          "Fuerte deseo consciente de iniciar desactivación de alerta cerebral hoy."
        ]
      });
      setScanRadialData([
        { subject: "Activación", valor: 72 },
        { subject: "Preocupación", valor: 82 },
        { subject: "Alerta Social", valor: 64 },
        { subject: "Agotamiento", valor: 76 },
        { subject: "Claridad", valor: 48 },
        { subject: "Regulación", valor: 41 },
        { subject: "Bienestar", valor: 44 }
      ]);
      setScanInterpretacion("Tu sistema autónomo simpático opera con sensibilidad de alerta aumentada de pelea o huida. Esto se refleja especialmente en tu nivel de preocupación perseverativa (82%) y agotamiento (76%). Se recomienda un acompañamiento guiado de 7 días.");
      
      setLoadingProgress(100);
      setTimeout(() => {
        setPhase("SCAN_RESULTS");
      }, 600);
    }
  };

  const handleRegisterAndStartProgram = async (nombre: string, email: string, whatsapp: string, accessCode: string) => {
    setIsRegistering(true);
    const emailKey = email.toLowerCase().trim();
    const cleanAccessCode = (accessCode || "").trim().toUpperCase();

    // 1. Ejecutar verificación y registro seguro con el servidor antes de ingresar
    fetch("/api/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombre.trim(),
        email: emailKey,
        whatsapp: whatsapp.trim(),
        accessCode: cleanAccessCode,
        initialScanResults: scanMetrics,
        origin: "Escaneo Inicial M.A.P.A."
      })
    })
    .then(async (res) => {
      const contentType = res.headers.get("content-type");
      let data: any = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Respuesta no válida del servidor (Código ${res.status}): ${text.substring(0, 150)}`);
      }

      if (!res.ok) {
        alert(data.error || "El Código de Acceso o el Correo Electrónico proporcionados no son correctos o no registran un pago aprobado en Hotmart.");
        setIsRegistering(false);
        return;
      }

      console.log("Sincronización de registro con servidor exitosa:", data);

      // Track Facebook Pixel event
      if (typeof (window as any).fbq === "function") {
        (window as any).fbq("track", "CompleteRegistration", {
          content_name: "Registro M.A.P.A. Mujer",
          status: "success"
        });
      }
      
      // Guardar sesión segura en localStorage
      localStorage.setItem("MAPA_ACCESS_TOKEN", data.token);
      localStorage.setItem("MAPA_CURRENT_USER_EMAIL", emailKey);
      setCurrentUserEmail(emailKey);

      const loadedProgress = data.userProgress;
      if (loadedProgress && loadedProgress.leadInfo) {
        if (!loadedProgress.leadInfo.alias) {
          loadedProgress.leadInfo.alias = loginAlias.trim() || getUserShortName({ nombre: loadedProgress.leadInfo.nombre });
        }
      }
      setProgramProgress(loadedProgress);
      localStorage.setItem(`MAPA_USER_PROGRESS_${emailKey}`, JSON.stringify(loadedProgress));
      setLeadInfo(loadedProgress.leadInfo);
      setLeadCaptured(true);

      // Ir a la fase correspondiente (Admin si aplica, sino Dashboard)
      const adminEmails = ["contacto@tupodermental.club"];
      if (adminEmails.includes(emailKey) || data.isAdmin) {
        setPhase("ADMIN");
      } else {
        setPhase("DASHBOARD");
        const displayName = loadedProgress.leadInfo.alias || getUserShortName(loadedProgress.leadInfo);
        setDashboardNotice(`🎯 ¡M.A.P.A.™ Mujer iniciado con éxito! Bienvenida al programa, querida ${displayName}.`);
        setTimeout(() => setDashboardNotice(null), 6000);
      }
      setIsRegistering(false);
    })
    .catch((err) => {
      console.error("Fallo de red en registro:", err);
      alert(`⚠ Error de comunicación con el servidor: ${err.message || "Por favor, asegúrate de estar conectada a internet e inténtalo de nuevo."}`);
      setIsRegistering(false);
    });
  };

  // Initialize Program on Landing with precise current timestamp
  const startSevenDayProgram = () => {
    const activeToken = localStorage.getItem("MAPA_ACCESS_TOKEN");
    if (!currentUserEmail || !activeToken) {
      // Direct them to customized email identification/login
      setLoginEmail(currentUserEmail || "");
      setLoginNombre("");
      setLoginWhatsapp("");
      setLoginAccessCode("");
      setPhase("LOGIN");
      return;
    }

    const emailKey = currentUserEmail.toLowerCase().trim();
    const existing = localStorage.getItem(`MAPA_USER_PROGRESS_${emailKey}`);
    if (existing) {
      try {
        const loaded = JSON.parse(existing);
        setProgramProgress(loaded);
        setPhase("DASHBOARD");
        return;
      } catch (e) {
        console.error("Error loading user progress", e);
      }
    }

    if (programProgress.completedDays && programProgress.completedDays.length >= 7) {
      setPhase("DASHBOARD");
      return;
    }

    const nowStr = new Date().toISOString();
    const newProg = {
      activationDate: nowStr,
      currentDay: 1,
      completedDays: [],
      responses: {},
      leadInfo: leadInfo,
      leadCaptured: true,
      completionTimestamps: {}
    };
    setProgramProgress(newProg);
    localStorage.setItem(`MAPA_USER_PROGRESS_${emailKey}`, JSON.stringify(newProg));
    
    // Jump straight to Dashboard where Day 1 awaits
    setPhase("DASHBOARD");
  };

  // Launch questionnaire for the active day
  const launchDailyQuiz = () => {
    if (programProgress.completedDays && programProgress.completedDays.length >= 7) {
      setPhase("DASHBOARD");
      return;
    }
    const day = programProgress.currentDay;
    // Load previously answered responses for this day if any exist, otherwise empty
    const existing = programProgress.responses[day] || [];
    setUserResponses(existing);
    setCurrentQuestionIndex(0);
    setIsEvaluationReady(false);
    setPhase("WIZARD");
  };

  // Handle checking a card in FASE 2
  const toggleLandingCheck = (id: number) => {
    setSelectedChecks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Pre-fill landing cards descriptions
  const landingCards = [
    { id: 1, text: "Noto tensión física constante, pecho apretado o respiración superficial.", tag: "Fisiológico" },
    { id: 2, text: "Me acuesto cansada pero mi mente se enciende recordando pendientes.", tag: "Insomnio" },
    { id: 3, text: "Me cuesta delegar, siento que si no lo hago yo misma algo saldrá mal.", tag: "Hipercontrol" },
    { id: 4, text: "Suelo absorber los problemas y dolores de otros hasta quedar exhausta.", tag: "Empatía Activa" },
    { id: 5, text: "Finjo que todo está perfecto ante amigos y familia para no preocupar.", tag: "Silencioso" },
    { id: 6, text: "Un cambio imprevisto de planes me genera un cortocircuito emocional interno.", tag: "Anticipación" }
  ];

  // Mechanism 5 Pillars Data
  const pillarsData = [
    {
      title: "Activación Física",
      desc: "Mide el nivel de tensión corporal y alerta acumulada.",
      accent: "from-cyan-400 to-blue-500",
      stats: "Cuerpo"
    },
    {
      title: "Desencadenantes",
      desc: "Identifica qué situaciones exactas disparan tu malestar.",
      accent: "from-amber-400 to-orange-500",
      stats: "Detonadores"
    },
    {
      title: "Patrones Mentales",
      desc: "Muestra hábitos de velocidad mental o autocrítica.",
      accent: "from-purple-400 to-pink-500",
      stats: "Mente"
    },
    {
      title: "Protección Vagal",
      desc: "Tus herramientas biológicas naturales para calmar los nervios.",
      accent: "from-emerald-400 to-teal-500",
      stats: "Calma"
    },
    {
      title: "Ruta Práctica",
      desc: "Guía paso a paso de 3 acciones esenciales para esta semana.",
      accent: "from-blue-400 to-accent",
      stats: "Ruta"
    }
  ];

  // Active Questions slice based on program context
  const getActiveDayQuestions = () => {
    const day = programProgress.currentDay;
    return QUESTIONS.slice((day - 1) * 7, day * 7);
  };

  // Wizard Logic
  const handleOptionSelect = (optionValue: string, qCategory: string) => {
    const activeQuestions = getActiveDayQuestions();
    const currentQ = activeQuestions[currentQuestionIndex];
    if (!currentQ) return;

    const newResponses = [...userResponses];
    const existingIndex = newResponses.findIndex(r => r.questionId === currentQ.id);

    if (existingIndex > -1) {
      newResponses[existingIndex] = { questionId: currentQ.id, value: optionValue, category: qCategory };
    } else {
      newResponses.push({ questionId: currentQ.id, value: optionValue, category: qCategory });
    }
    
    setUserResponses(newResponses);

    // Auto-advance
    setTimeout(() => {
      if (currentQuestionIndex < 6) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setIsEvaluationReady(true);
        // Automatically submit the quiz and show results immediately
        handleDailyComplete(newResponses);
      }
    }, 280);
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // 7-Day compilation triggers are mapped directly inside the programProgress flow.

  // Client-side fallback calculator
  const buildLocalFallback = (responses: QuizResponse[]): EmotionalProfile => {
    const scores = { vigilante: 0, anticipador: 0, hipercontrolador: 0, sobrecargado: 0, protectorSilencioso: 0 };
    responses.forEach((resItem) => {
      const question = QUESTIONS.find((q) => q.id === resItem.questionId);
      if (question && question.options) {
        const option = question.options.find((opt) => opt.value === resItem.value);
        if (option && option.scoreWeight) {
          Object.keys(option.scoreWeight).forEach((key) => {
            const pKey = key as keyof typeof scores;
            scores[pKey] += (option.scoreWeight[pKey] || 0);
          });
        }
      }
    });

    let dominantKey = "vigilante" as string;
    let maxVal = -1;
    Object.keys(scores).forEach((key) => {
      const pKey = key as keyof typeof scores;
      if (scores[pKey] > maxVal) {
        maxVal = scores[pKey];
        dominantKey = pKey;
      }
    });

    let profileSlug: "VIGILANTE" | "ANTICIPADOR" | "HIPERCONTROLADOR" | "SOBRECARGADO" | "PROTECTOR" = "VIGILANTE";
    if (dominantKey === "anticipador") profileSlug = "ANTICIPADOR";
    else if (dominantKey === "hipercontrolador") profileSlug = "HIPERCONTROLADOR";
    else if (dominantKey === "sobrecargado") profileSlug = "SOBRECARGADO";
    else if (dominantKey === "protectorSilencioso") profileSlug = "PROTECTOR";

    // Offline profile details mapping
    const localTemplates = {
      VIGILANTE: {
        id: "VIGILANTE" as const,
        name: "El Vigilante",
        avatar: "👁️",
        subTitle: "Centinela del Entorno",
        description: "Vives escaneando tu entorno físico, social y emocional buscando señales de peligro, tensión o desaprobación para ampararte antes que ocurra.",
        psychologicalInsight: "Tu mente asimila la hiper-vigilancia corporal con la seguridad biológica. Sientes que bajar los escudos te dejaría expuesta, manteniendo tu amígdala cerebral en un bucle ininterrumpido de alerta.",
        activationLevel: 85,
        secondaryProfiles: [{ name: "El Anticipador", percentage: 35 }, { name: "El Hipercontrolador", percentage: 25 }],
        radarData: [
          { name: "Activación Fisiológica", A: 85, B: 50 },
          { name: "Patrones Mentales", A: 60, B: 45 },
          { name: "Híper Vigilancia", A: 90, B: 55 },
          { name: "Capa Protectora", A: 40, B: 40 },
          { name: "Desgaste del Entorno", A: 70, B: 35 }
        ],
        indicators: {
          detonantes: [
            "Climas emocionales tensos o silencios incómodos de otras personas.",
            "Cambios súbitos en el lenguaje corporal de tus seres queridos.",
            "Lugares con exceso de estímulos visuales, ruido o multitudes desordenadas."
          ],
          patrones: [
            "Análisis obsesivo de micro-gestos ajenos ('¿Estará enojado conmigo?').",
            "Dificultad radical para relajar el cuerpo en momentos de ocio.",
            "Chequeo repetitivo del teléfono, cerraduras o correos de forma urgente."
          ],
          proteccion: [
            "Silencio total y aislamiento controlado en una habitación despejada.",
            "Rutinas predecibles y hábitos matutinos estables.",
            "Ejercicios de respiración profunda que envían seguridad al diafragma."
          ]
        },
        tranquilityRoute: {
          acciones: [
            "Haz un escaneo corporal de 2 minutos cada mediodía: libera la tensión acumulada en la mandíbula y baja los hombros.",
            "Establece una bitácora de 'falsas alarmas': anota cuándo creíste que alguien estaba molesto contigo y qué ocurrió en realidad.",
            "Práctica la respiración 4-7-8 antes de dormir para recordarle a tu amígdala que estás a salvo en tu habitación."
          ],
          habitos: [
            "Un detox digital selectivo: deja el móvil fuera del alcance la primera hora de tu mañana.",
            "Caminatas de presencia plena: fíjate en 3 sonidos y 2 texturas del camino en lugar de anticipar el destino.",
            "Establece rituales físicos de transición: lávate las manos al llegar a casa simbolizando el soltar el escudo."
          ],
          observar: [
            "El deseo súbito de disculparte por cosas insignificantes.",
            "La rigidez física o aguantar la respiración mientras trabajas frente a la pantalla.",
            "Tu nivel de impaciencia ante actividades tranquilas aleatorias."
          ]
        }
      },
      ANTICIPADOR: {
        id: "ANTICIPADOR" as const,
        name: "El Anticipador",
        avatar: "🔮",
        subTitle: "Director de Películas Futuras",
        description: "Vives en el mañana inmediato. Creas simulaciones de tragedias, conversaciones difíciles, rechazos u obstáculos para ensayar tus respuestas.",
        psychologicalInsight: "Crear escenarios sombríos es el intento defensivo de tu cerebro para actuar como vacuna emocional contra el dolor. Al ensayar la angustia por adelantado, sufres hoy por un futuro ficticio.",
        activationLevel: 92,
        secondaryProfiles: [{ name: "El Vigilante", percentage: 40 }, { name: "El Hipercontrolador", percentage: 30 }],
        radarData: [
          { name: "Activación Fisiológica", A: 92, B: 50 },
          { name: "Patrones Mentales", A: 85, B: 45 },
          { name: "Híper Vigilancia", A: 75, B: 55 },
          { name: "Capa Protectora", A: 30, B: 40 },
          { name: "Desgaste del Entorno", A: 80, B: 35 }
        ],
        indicators: {
          detonantes: [
            "Incertidumbre laboral, académica o de salud sin resolver.",
            "Mensajes vacíos de 'tenemos que hablar' o llamadas perdidas sin contexto.",
            "Falta de fechas límites claras o planes suspendidos."
          ],
          patrones: [
            "Rumia de '¿Qué tal si pasa lo peor?' de forma incremental.",
            "Ensayar discursos interminablemente en tu ducha para prever ataques.",
            "Insomnio provocado por proyecciones de la agenda."
          ],
          proteccion: [
            "Escribir todo el caos del futuro en papel para vaciar la memoria RAM.",
            "Ejercicios físicos que arrastran tu conciencia de vuelta aquí.",
            "Hablar con personas realistas y estables que actúan como anclas."
          ]
        },
        tranquilityRoute: {
          acciones: [
            "Aplica la pregunta filtro: '¿Esto de lo que me preocupo es un hecho real hoy, o solo una probabilidad futura?'.",
            "Escribe un guión alternativo: si tu mente imagina el peor de los casos, oblígala a redactar el mejor de los casos.",
            "Pon una alarma de preocupación de 10 minutos al día: fuera de ese tiempo, aplaza amablemente el sobrepensamiento."
          ],
          habitos: [
            "Práctica de anclaje de 5 sentidos.",
            "Escribe un diario de gratitud enfocado en el presente.",
            "Ejercicios de estiramiento pasivo o yoga nocturno."
          ],
          observar: [
            "Palabras clave en tu diálogo: '¿Y si...?', 'Tengo que...'.",
            "Opresión ligera y constante en el pecho al atardecer.",
            "El impulso involuntario de planificar conversaciones espontáneas."
          ]
        }
      },
      HIPERCONTROLADOR: {
        id: "HIPERCONTROLADOR" as const,
        name: "El Hipercontrolador",
        avatar: "⚙️",
        subTitle: "Arquitecto del Orden",
        description: "Sientes que si dejas de supervisar o intervenir todo colapsará. Te cuesta delegar profundamente y el desorden físico te agobia severamente.",
        psychologicalInsight: "El control externo es la balsa con la que intentas contener tu agitación interna. Crees que controlando las variables calmarás tu amígdala, pero la rigidez metodológica te agota.",
        activationLevel: 78,
        secondaryProfiles: [{ name: "El Anticipador", percentage: 45 }, { name: "El Sobrecargado", percentage: 15 }],
        radarData: [
          { name: "Activación Fisiológica", A: 70, B: 50 },
          { name: "Patrones Mentales", A: 90, B: 45 },
          { name: "Híper Vigilancia", A: 85, B: 55 },
          { name: "Capa Protectora", A: 50, B: 40 },
          { name: "Desgaste del Entorno", A: 60, B: 35 }
        ],
        indicators: {
          detonantes: [
            "Delegar tareas y tolerar ritmos ajenos.",
            "Desorden físico persistente en tu hogar.",
            "Cambios imprevistos de itinerarios a última hora."
          ],
          patrones: [
            "Perfeccionismo implacable contigo mismo y exigencia hacia los demás.",
            "Hacer listas infinitas de tareas y enojarte si no se completan.",
            "Asumir que 'si quiero que algo salga bien, debo hacerlo yo mismo'."
          ],
          proteccion: [
            "Hacer limpieza sistemática de un espacio pequeño para dar orden.",
            "Entornos minimalistas con colores tenues.",
            "Planificación deliberada de espacios grises sin metas."
          ]
        },
        tranquilityRoute: {
          acciones: [
            "Elige una tarea menor esta semana y delégala por completo aceptando que no se haga de tu perfecta manera.",
            "Practica el 'caos controlado' dejando un cajón desordenado o platos sin lavar a propósito un día.",
            "Sustituye la autocrítica por compasión."
          ],
          habitos: [
            "Bloques de ocio vacíos sin planear.",
            "Escribir tres cosas que salieron bien aunque no hayan seguido el plan original.",
            "Relajación muscular progresiva."
          ],
          observar: [
            "Suspiros cansados frecuentes y dientes apretados.",
            "El deseo de corregir cómo otros hacen tareas.",
            "Frustración desproporcionada ante un pequeño tropiezo."
          ]
        }
      },
      SOBRECARGADO: {
        id: "SOBRECARGADO" as const,
        name: "El Sobrecargado",
        avatar: "🎒",
        subTitle: "Atlante Emocional",
        description: "Cargas inconscientemente con el bienestar de todos a tu alrededor. Decir que 'no' se siente imposible por miedo a generar rechazo.",
        psychologicalInsight: "Tu mente asoció que tu valor como persona depende de tu capacidad para salvar a otros. Al vaciar tu copa para intentar saciar los problemas ajenos, te quedas seco de combustible vital.",
        activationLevel: 82,
        secondaryProfiles: [{ name: "El Protector Silencioso", percentage: 38 }, { name: "El Vigilante", percentage: 18 }],
        radarData: [
          { name: "Activación Fisiológica", A: 82, B: 50 },
          { name: "Patrones Mentales", A: 65, B: 45 },
          { name: "Híper Vigilancia", A: 75, B: 55 },
          { name: "Capa Protectora", A: 30, B: 40 },
          { name: "Desgaste del Entorno", A: 95, B: 35 }
        ],
        indicators: {
          detonantes: [
            "Ver a alguien querido molesto o triste (sientes la obligación de arreglarlo).",
            "Tener que negarte a una petición o poner un límite firme.",
            "Acumulación excesiva de tareas ajenas por inercia."
          ],
          patrones: [
            "Sentir culpa corrosiva cuando descansas.",
            "Anticipación de las necesidades ajenas antes de que lo pidan.",
            "Quejarte en silencio de que nadie te cuida como cuidas tú."
          ],
          proteccion: [
            "Contacto directo con la tierra o naturaleza caminatas.",
            "Establecer un círculo íntimo ultra-reducido de reciprocidad.",
            "Pasar tiempo con mascotas o hobbies creativos sin juicio."
          ]
        },
        tranquilityRoute: {
          acciones: [
            "Aplica la regla de las 24 horas antes de aceptar una petición de ayuda.",
            "Escribe una lista de tus responsabilidades frente a las de otros.",
            "Di un 'NO' amable esta semana a algo menor."
          ],
          habitos: [
            "Define un bloque de 'Santuario Personal' de 30 minutos innegociable.",
            "Diarios de descarga de escritura libre.",
            "Caminatas vigorosas que marquen tu perímetro."
          ],
          observar: [
            "Sabor a resentimiento sordo ante peticiones ajenas.",
            "Dolor constante en hombros y espalda baja.",
            "El impulso de justificarte en exceso para no decir sí."
          ]
        }
      },
      PROTECTOR: {
        id: "PROTECTOR" as const,
        name: "El Protector Silencioso",
        avatar: "🎭",
        subTitle: "Fortaleza Solitaria",
        description: "Eres el puerto seguro de todos. Construyes una máscara impecable de optimismo e inafectabilidad exterior, mientras que por dentro batallas solo.",
        psychologicalInsight: "Utilizas el orgullo de la autosuficiencia y la discreción como mecanismo de aislamiento preventivo. Al enterrar tus señales débiles de auxilio, dejas a tu sistema nervioso gritando sin escape.",
        activationLevel: 75,
        secondaryProfiles: [{ name: "El Sobrecargado", percentage: 40 }, { name: "El Vigilante", percentage: 22 }],
        radarData: [
          { name: "Activación Fisiológica", A: 75, B: 50 },
          { name: "Patrones Mentales", A: 80, B: 45 },
          { name: "Híper Vigilancia", A: 70, B: 55 },
          { name: "Capa Protectora", A: 85, B: 40 },
          { name: "Desgaste del Entorno", A: 65, B: 35 }
        ],
        indicators: {
          detonantes: [
            "Preguntas íntimas de otros sobre tu salud emocional real.",
            "Situaciones que requieran mostrar debilidad o cometer errores públicos.",
            "La sensación de perder la compostura formal."
          ],
          patrones: [
            "Sostener optimismo artificial continuo con tu familia.",
            "Aislarte de inmediato cuando estás abrumado sin pedir auxilio.",
            "Tragar el llanto e ignorar el cansancio simulando plenitud."
          ],
          proteccion: [
            "Espacios artísticos anónimos donde se te permita equivocarte.",
            "Entornos silenciosos libres de expectativas sociales.",
            "Amistades lejanas donde no ejerces el rol de salvador."
          ]
        },
        tranquilityRoute: {
          acciones: [
            "Usa una palabra clave con alguien cercano para indicar que hoy estás cansado.",
            "Escribe una carta franca detallando tus miedos y triturándola.",
            "Permítete fallar en una tarea privada para quitarte presión."
          ],
          habitos: [
            "Hacer estiramientos vigorosos de cuello y garganta.",
            "Dormir con mantas pesadas simulando seguridad en el lecho.",
            "Separar 15 minutos de la noche sin celular en penumbra absoluta."
          ],
          observar: [
            "Apretar la mandíbula o morderte las mejillas internas.",
            "Incapacidad voluntaria para pedir un favor menor.",
            "Un nudo persistente y seco en la garganta al atardecer."
          ]
        }
      }
    };

    return localTemplates[profileSlug];
  };

  // Lead Form submission with beautiful sending simulation showing sender: mapa@podermentalia.club
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadInfo.nombre || !leadInfo.email) {
      alert("Por favor rellena tu nombre y correo para enviar tu M.A.P.A.™ completo.");
      return;
    }
    
    setIsSendingEmail(true);
    setEmailSentSuccess(false);
    setEmailSendingStep("Estableciendo conexión con el servidor seguro de Poder Mentalia...");
    
    const emailKey = leadInfo.email.toLowerCase().trim();
    
    // Perform actual registration dispatch in background
    fetch("/api/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: leadInfo.nombre.trim(),
        email: emailKey,
        whatsapp: leadInfo.whatsapp || "",
        initialScanResults: scanMetrics,
        origin: "Formulario de Registro"
      })
    })
    .then(async (res) => {
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        console.log("Registro de lead en servidor completado exitosamente:", data);
        if (data.success && data.userProgress) {
          // Initialize active session
          localStorage.setItem("MAPA_CURRENT_USER_EMAIL", emailKey);
          setCurrentUserEmail(emailKey);
          setProgramProgress(data.userProgress);
          localStorage.setItem(`MAPA_USER_PROGRESS_${emailKey}`, JSON.stringify(data.userProgress));

          // Track Facebook Pixel event
          if (typeof (window as any).fbq === "function") {
            (window as any).fbq("track", "Lead", {
              content_name: "Registro Lead M.A.P.A. Mujer"
            });
          }
        }
      }
    })
    .catch((err) => {
      console.error("Fallo de registro de lead en segundo plano en el servidor:", err);
    });

    setTimeout(() => {
      setEmailSendingStep("Compilando tu Reporte de Orientación Personalizado M.A.P.A.™...");
    }, 1200);
    
    setTimeout(() => {
      setEmailSendingStep("Sintonizando marcadores corporales simpáticos y autónomos...");
    }, 2400);

    setTimeout(() => {
      setEmailSendingStep("Firmando Dossier de Autodescubrimiento M.A.P.A.™ desde: mapa@podermentalia.club...");
    }, 3600);

    setTimeout(() => {
      setEmailSendingStep("Despachando correo encriptado con PDF al destinatario...");
    }, 4800);

    setTimeout(() => {
      setIsSendingEmail(false);
      setLeadCaptured(true);
      setEmailSentSuccess(true);
    }, 6000);
  };

  // Dual-channel lead capture submit (WhatsApp / Email)
  const handleDualLeadSubmit = async (channel: "whatsapp" | "email") => {
    const name = leadInfo.nombre || "Usuaria M.A.P.A.";
    const emailStr = (leadInfo.email || confirmEmail || "").trim();
    
    if (!name) {
      alert("Por favor, introduce tu nombre.");
      return;
    }
    if (!emailStr) {
      alert("Por favor, introduce tu correo electrónico de confirmación.");
      return;
    }
    
    const combinedWhatsapp = whatsappNumber ? `${whatsappCountryCode} ${whatsappNumber.trim()}` : "";
    
    if (channel === "whatsapp" && !whatsappNumber) {
      alert("Por favor, introduce tu número de WhatsApp para recibir el reporte por este canal.");
      return;
    }

    try {
      setIsSendingEmail(true);
      setEmailSendingStep(`Enviando reporte personalizado vía ${channel === "whatsapp" ? "WhatsApp" : "Email"}...`);

      const payload = {
        nombre: name.trim(),
        email: emailStr.toLowerCase().trim(),
        whatsapp: combinedWhatsapp
      };

      const response = await fetch("/api/premium/submit-lead-report", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("MAPA_ACCESS_TOKEN") || ""}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsSendingEmail(false);
        setLeadCaptured(true);
        playSuccessCue();
        
        const successMsg = `Su Reporte está siendo compilado por Clara Luz • Mentora M.A.P.A.™ Mujer y llegará en menos de 5 minutos a tu ${channel === "whatsapp" ? "WhatsApp" : "Email"}.`;
        setLeadSubmitToast(successMsg);
        
        // Update local state to reflect captured lead and sync
        const updatedProg = {
          ...programProgress,
          leadCaptured: true,
          isCompleted: true,
          leadInfo: {
            ...leadInfo,
            nombre: name.trim(),
            email: emailStr.toLowerCase().trim(),
            whatsapp: combinedWhatsapp
          }
        };
        setProgramProgress(updatedProg);
        setLeadInfo(updatedProg.leadInfo);
        localStorage.setItem(`MAPA_USER_PROGRESS_${emailStr.toLowerCase().trim()}`, JSON.stringify(updatedProg));
        
        setTimeout(() => setLeadSubmitToast(null), 8000);
      } else {
        setIsSendingEmail(false);
        alert("Ocurrió un problema de conexión con el servidor. Por favor, inténtelo de nuevo.");
      }
    } catch (err) {
      console.error("Error submitting lead:", err);
      setIsSendingEmail(false);
      alert("Ocurrió un error inesperado al registrar el reporte.");
    }
  };

  // Complete onboarding modal flow and persist state
  const handleOnboardingComplete = async () => {
    const updatedProgress = {
      ...programProgress,
      onboardingCompletado: true
    };
    setProgramProgress(updatedProgress);

    if (currentUserEmail) {
      localStorage.setItem(`MAPA_USER_PROGRESS_${currentUserEmail.toLowerCase().trim()}`, JSON.stringify(updatedProgress));
    }
    localStorage.setItem("MAPA_7DAY_PROGRESS_V2", JSON.stringify(updatedProgress));

    if (currentUserEmail) {
      try {
        const token = localStorage.getItem("MAPA_ACCESS_TOKEN");
        if (token) {
          await fetch("/api/update-user-progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              email: currentUserEmail,
              programProgress: updatedProgress
            })
          });
        }
      } catch (err) {
        console.error("Error updating user progress with onboarding status:", err);
      }
    }
  };

  // Complete the current day and return to Dashboard
  const handleDailyComplete = async (overrideResponses?: QuizResponse[]) => {
    const activeResponses = overrideResponses || userResponses;
    const day = programProgress.currentDay;
    const updatedResponses = {
      ...programProgress.responses,
      [day]: activeResponses
    };

    const updatedCompletedDays = programProgress.completedDays.includes(day)
      ? programProgress.completedDays
      : [...programProgress.completedDays, day];

    let nextDay = day;
    if (updatedCompletedDays.length < 7) {
      nextDay = Math.min(7, day + 1);
    }

    const updatedTimestamps = {
      ...(programProgress.completionTimestamps || {}),
      [day]: new Date().toISOString()
    };

    // Show AI compilation loader
    setPhase("LOADING");
    setLoadingProgress(25);
    setLoadingStepText(`Sintetizando conclusiones cognitivas del Día ${day}...`);

    let conclusionText: any = "Análisis guardado.";
    try {
      const resp = await fetch("/api/evaluate-day-conclusion", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("MAPA_ACCESS_TOKEN") || ""}`
        },
        body: JSON.stringify({
          day,
          responses: activeResponses,
          userProfileName: evaluationResult?.name || "El Vigilante"
        })
      });
      const resData = await resp.json();
      if (resData.success) {
        conclusionText = resData.conclusion;
      }
    } catch (e) {
      console.warn("Day conclusion evaluation skipped, utilizing clinical offline fallback:", e);
      conclusionText = {
        discovered: "Has revelado patrones sobre tu activación y retención de alerta simpática hoy.",
        improved: "Mejora en la conciencia corporal de los hombros y mandíbula.",
        needsStrengthening: "Puntos de resistencia subconsciente frente a demandas imprevistas.",
        patternDetected: "Patrones inerciales de hipervigilancia protectora.",
        recommendation: "Es recomendable un anclaje somático de respiración prolongada."
      };
    }

    const updatedConclusions = {
      ...(programProgress.dailyConclusionText || {}),
      [day]: conclusionText
    };

    const prevConclusions = (programProgress as any).dailyConclusionText || {};
    const finalConclusions = { ...prevConclusions, ...updatedConclusions };

    const currentUnlockedAudios = programProgress.unlockedAudios || [];
    let updatedUnlockedAudios = [...currentUnlockedAudios];
    
    let rewardToTrigger: "day3" | "day4" | "day5" | "day7" | null = null;
    
    if (day === 3 && !updatedUnlockedAudios.includes("day3")) {
      updatedUnlockedAudios.push("day3");
      rewardToTrigger = "day3";
    }
    
    if (day === 4 && !updatedUnlockedAudios.includes("day4")) {
      updatedUnlockedAudios.push("day4");
      rewardToTrigger = "day4";
    }

    if (day === 5 && !updatedUnlockedAudios.includes("day5")) {
      updatedUnlockedAudios.push("day5");
      rewardToTrigger = "day5";
    }
    
    if ((day === 7 || updatedCompletedDays.length === 7) && !updatedUnlockedAudios.includes("day7")) {
      updatedUnlockedAudios.push("day7");
      rewardToTrigger = "day7";
    }

    const newProg = {
      ...programProgress,
      responses: updatedResponses,
      completedDays: updatedCompletedDays,
      currentDay: nextDay,
      completionTimestamps: updatedTimestamps,
      dailyConclusionText: finalConclusions,
      unlockedAudios: updatedUnlockedAudios
    };

    const isMilestone = [3, 5, 7].includes(updatedCompletedDays.length);
    const milestoneCount = updatedCompletedDays.length;

    setProgramProgress(newProg);
    const emailKey = leadInfo.email || currentUserEmail;
    if (emailKey) {
      localStorage.setItem(`MAPA_USER_PROGRESS_${emailKey.toLowerCase().trim()}`, JSON.stringify(newProg));
      syncProgressToCloud(newProg, emailKey);
    } else {
      localStorage.setItem("MAPA_7DAY_PROGRESS_V2", JSON.stringify(newProg));
    }

    // Reset current wizard state
    setUserResponses([]);
    setCurrentQuestionIndex(0);
    setIsEvaluationReady(false);

    playSuccessCue();
    setDashboardNotice(`¡Excelente! Conclusiones del Día ${day} integradas con éxito en tu M.A.P.A.™`);
    setTimeout(() => setDashboardNotice(null), 4000);

    setPhase("DASHBOARD");
    if (rewardToTrigger) {
      setTimeout(() => {
        setUnlockedAudioModal({ isOpen: true, type: rewardToTrigger });
      }, 800);
    }
    if (isMilestone) {
      setTimeout(() => {
        setMilestoneModal({ isOpen: true, daysCount: milestoneCount });
      }, rewardToTrigger ? 2500 : 1000);
    }
  };

  // Compile all historical answers of 7 days to trigger full assessment
  const triggerSevenDayReport = () => {
    const allResponses = Object.values(programProgress.responses).flat() as QuizResponse[];
    
    setPhase("LOADING");
    setLoadingProgress(0);
    setLoadingStepText("Analizando respuestas continuas de los 7 días...");

    const steps = [
      { text: "Recuperando registro continuo de 7 días...", pct: 15 },
      { text: "Calculando marcadores de sobrepensamiento y carga simpática...", pct: 35 },
      { text: "Conectando con el motor inteligente de orientación M.A.P.A.™...", pct: 55 },
      { text: "Generando recomendaciones y plan de regulación de 12 páginas...", pct: 80 },
      { text: "Configurando widgets, brújula de tensión y radar interactivo...", pct: 95 },
      { text: "¡Procesamiento de orientación completado con éxito!", pct: 100 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setLoadingProgress(step.pct);
        setLoadingStepText(step.text);
        if (step.pct === 100) {
          setTimeout(() => {
            const result = buildLocalFallback(allResponses);
            setEvaluationResult(result);
            setPhase("RESULTS");
          }, 600);
        }
      }, (index + 1) * 700);
    });
  };

  // Simulation Share utilities
  const handleShareClick = (platform: string) => {
    const profileName = evaluationResult?.name || "El Vigilante Permanente";
    const shareText = getShareText({ 
      variant: "perfil", 
      perfilName: profileName 
    });
    
    if (platform === "whatsapp") {
      shareToWhatsApp({ 
        variant: "perfil", 
        perfilName: profileName 
      });
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(FUNNEL_URL)}`);
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(FUNNEL_URL)}`);
    } else {
      // Copy to clipboard fallback
      navigator.clipboard.writeText(shareText);
      setShareAlert("¡Mensaje persuasivo y enlace al Test copiados! Listo para compartir en tus Redes Sociales o historias.");
      setTimeout(() => setShareAlert(null), 4000);
    }
  };

  const handleDownloadPDF = () => {
    // Compile consolidated dossier data elegantly
    const nombre = leadInfo.nombre || "Usuaria M.A.P.A.™";
    const email = leadInfo.email || "No registrado";
    const fecha = new Date().toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' });
    const profileName = evaluationResult?.name || "El Vigilante Permanente";
    const profileSub = evaluationResult?.subTitle || "Foco de Hiperatención Simpática";
    const profileDesc = evaluationResult?.description || "Patrón caracterizado por sostener un estado de alerta continuo y tensión preventiva. A través de las intervenciones somáticas y cognitivas de 7 días, este perfil logra una autorregulación progresiva del tono vagal.";
    const reportRef = `MAPA-CLINIC-${Math.floor(100000 + Math.random() * 900000)}`;

    // Build Day by Day Clinical Overview with specific details, progress, specific recommendations
    const dayLabels = [
      "Sintomatología Fisiológica y Alerta Corporal",
      "Desencadenantes y Sensibilidad Ambiental",
      "Rumia Mental y Pensamiento Automático Súbito",
      "Relaciones de Vínculo e Interacciones Sociales",
      "Hábitos de Control Rígido y Exigencia Personal",
      "Estrategias de Evitación y Evasión Silenciosa",
      "Integración, Autocompasión, Regulación y Cierre"
    ];

    const dayTechnicalSummaries = [
      "Evaluación del tono basal autonómico. Se detectó predisposición al acaparamiento de tensión física en el trapecio, hombros y mandíbula, sugiriendo una asimilación muscular rígida de estresores cotidianos.",
      "Análisis de reactividad a estímulos y saturación auditiva/visual de entornos activos. Los marcadores revelaron híper-respuestas autónomas ante ruidos bruscos o desorden material en el área de descanso.",
      "Diagnóstico del flujo de pensamiento irracional y anticipación catastrofista futura. Se mapearon bucles recurrentes de película catastrófica que sostienen activos los picos de cortisol pre-dormancia.",
      "Calibración de límites asertivos en relaciones interpersonales. La usuaria reflejó indicios de sobrecarga empática activa, absorbiendo emocionalmente dilemas externos hasta drenar su propia batería homeostática.",
      "Auditoría de hábitos perfeccionistas cognitivos. Se observó una correlación directa entre la compulsión de planificación inflexible y el desgaste cerebral provocado por imprevistos o anomalías de agenda.",
      "Mapeo de fugas energéticas inactivas y de evasión fóbica. Se detectaron de 60 a 120 minutos de procrastinación inercial mediante dispositivos electrónicos como amortiguación subconsciente del agobio sistémico.",
      "Consolidación vegetativa e integración cuerpo-mente. Se estructuró el ancla de balance vagal para estimular de forma voluntaria el restablecimiento de la calma y asertividad parasimpática profunda."
    ];

    const dayClinicalRecs = [
      "Realizar 3 rondas diarias de estiramiento miofascial de trapecio complementadas con respiración box-breathing (frecuencia 4s).",
      "Establecer un santuario libre de notificaciones en el dormitorio y utilizar ruido rosa amortiguado durante episodios de alta exigencia.",
      "Ejecutar registro estructurado en papel bajo la rúbrica 'Hechos Objetivos vs Proyecciones' al final de la jornada laboral.",
      "Ejercitar la contención afectiva de tres capas limitantes y agendar 15 minutos diarios de recuperación de silencio comunicacional.",
      "Implementar la técnica del 'Cajón Imperfecto': delegar conscientemente al menos una tarea secundaria diaria fuera de supervisión.",
      "Establecer temporizadores estrictos en apps de contenido social y reaccionar ante la urgencia de huir mediante acción comprometida somática.",
      "Consolidar la asimilación corporal respiratoria uniendo los 49 indicadores del cuestionario de forma consecutiva e integrada."
    ];

    const dayAdvances = [
      "Aumento detectado del 35% en la propiocepción corporal primaria.",
      "Reducción progresiva del siseo de alerta autonómica frente a picos sensoriales ambientales.",
      "Interrupción consciente de la divagación rumiante severa antes de la fase de sueño.",
      "Establecimiento asertivo de límites energéticos con menor nivel de culpabilidad subconsciente.",
      "Mejora notable del 40% en la adaptabilidad elástica ante interrupciones operativas.",
      "Sustitución progresiva de evasión virtual por pausas biológicas activas reparadoras.",
      "Activación voluntaria asimilada del nervio vago y equilibrio neuro-vegetativo."
    ];

    let daysHTML = "";
    for (let d = 1; d <= 7; d++) {
      const title = dayLabels[d - 1];
      const summaryText = dayTechnicalSummaries[d - 1];
      const recText = dayClinicalRecs[d - 1];
      const advanceText = dayAdvances[d - 1];

      daysHTML += `
        <div class="day-card">
          <div class="day-card-header">
            <span class="day-badge">DÍA ${d} DE EVALUACIÓN</span>
            <span class="day-status">✓ REGISTRADO Y COMPLETADO</span>
          </div>
          <h3 class="day-title">${title}</h3>
          
          <div class="day-detail-block">
            <strong>Evaluación Psicofisiológica y Enfoque de Regulación:</strong>
            <p>${summaryText}</p>
          </div>

          <div class="conclusion-grid">
            <div class="conclusion-item border-left-green">
              <div class="conclusion-label label-green">✓ AVANCE MEDIDO HOY</div>
              <div class="conclusion-text">${advanceText}</div>
            </div>
            <div class="conclusion-item border-left-amber">
              <div class="conclusion-label label-amber">💡 PRESCRIPCIÓN NEUROPROTECTORA</div>
              <div class="conclusion-text">${recText}</div>
            </div>
          </div>
        </div>
      `;
    }

    const waMsg = encodeURIComponent("😀 ¡Hola! He completado mi proceso de 7 días en M.A.P.A. Mujer y deseo continuar con el proceso completo en M.A.P.A.™ Care Ecosistema Clínico de Contención Femenina.");
    const waUrl = `https://wa.me/573005149055?text=${waMsg}`;

    // Construct HTML content with clean white background and soft pastel styling
    const htmlReport = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>M.A.P.A.™ Reporte Clínico Consolidado - ${nombre}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #fcf9fc;
      color: #2d3748;
      margin: 0;
      padding: 32px 16px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 860px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e8ded1;
      border-radius: 24px;
      padding: 44px;
      box-shadow: 0 10px 30px rgba(90, 40, 110, 0.04);
    }

    .header {
      border-bottom: 2px solid #e86fa3;
      padding-bottom: 20px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #3a185c;
    }

    .clinic-tag {
      background-color: #f7edf8;
      color: #8a519e;
      font-size: 10px;
      font-weight: 800;
      font-family: monospace;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      border: 1px solid #eaddf0;
    }

    .print-btn {
      background-color: #f3ebf5;
      color: #56346f;
      font-weight: 700;
      border: 1px solid #e0d0e8;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .print-btn:hover {
      background-color: #eaddf0;
      color: #3a185c;
    }

    .cover-title {
      font-size: 26px;
      font-weight: 800;
      color: #3a185c;
      margin: 12px 0 4px 0;
      line-height: 1.3;
    }

    .subtitle {
      font-size: 14px;
      font-weight: 600;
      color: #6e488a;
      margin-bottom: 24px;
    }

    .metadata {
      background-color: #faf5fc;
      border-left: 4px solid #8a519e;
      border-radius: 0 16px 16px 0;
      padding: 18px 22px;
      margin-bottom: 28px;
      border: 1px solid #eae0f0;
      border-left-width: 4px;
    }

    .metadata table {
      width: 100%;
      border-collapse: collapse;
    }

    .metadata td {
      padding: 5px 8px;
      font-size: 13px;
    }

    .metadata td.label {
      font-weight: 700;
      color: #56346f;
      width: 180px;
    }

    .disclaimer {
      background-color: #fff5f8;
      border: 1px solid #f3c4db;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 32px;
      font-size: 11.5px;
      color: #8a2b68;
      text-align: justify;
      line-height: 1.55;
    }

    .section-title {
      font-size: 16px;
      font-weight: 800;
      color: #3a185c;
      border-bottom: 2px solid #e86fa3;
      padding-bottom: 8px;
      margin-top: 36px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* EXECUTIVE METRICS DASHBOARD */
    .metrics-grid {
      display: grid;
      grid-template-cols: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 28px;
    }

    .metric-card {
      background-color: #faf5fc;
      border: 1px solid #eae0f0;
      border-radius: 14px;
      padding: 16px;
      text-align: center;
    }

    .metric-val {
      font-size: 24px;
      font-weight: 800;
      color: #3a185c;
      margin-bottom: 2px;
    }

    .metric-lbl {
      font-size: 11px;
      font-weight: 700;
      color: #6e488a;
      text-transform: uppercase;
    }

    .metric-sub {
      font-size: 10px;
      color: #16a34a;
      font-weight: 700;
      margin-top: 4px;
    }

    .day-card {
      background-color: #ffffff;
      border: 1px solid #eae0f0;
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(110, 72, 138, 0.03);
    }

    .day-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .day-badge {
      font-size: 10px;
      font-weight: 800;
      color: #27a1b2;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .day-status {
      font-size: 10px;
      font-weight: 700;
      color: #16a34a;
      font-family: monospace;
    }

    .day-title {
      font-size: 17px;
      font-weight: 700;
      color: #3a185c;
      margin: 0 0 12px 0;
    }

    .day-detail-block {
      background-color: #faf5fc;
      padding: 14px 16px;
      border-radius: 12px;
      margin-bottom: 14px;
      border: 1px solid #f0e6f4;
    }

    .day-detail-block strong {
      font-size: 11px;
      color: #6e488a;
      font-weight: 800;
      text-transform: uppercase;
      display: block;
      margin-bottom: 4px;
    }

    .day-detail-block p {
      margin: 0;
      font-size: 13px;
      color: #334155;
      line-height: 1.55;
    }

    .conclusion-grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 12px;
    }

    .conclusion-item {
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 12.5px;
      line-height: 1.5;
    }

    .border-left-green {
      background-color: #f0fdf4;
      border-left: 3.5px solid #16a34a;
      color: #166534;
    }

    .border-left-amber {
      background-color: #fffbeb;
      border-left: 3.5px solid #d97706;
      color: #92400e;
    }

    .label-green {
      font-weight: 800;
      color: #15803d;
      font-size: 10.5px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .label-amber {
      font-weight: 800;
      color: #b45309;
      font-size: 10.5px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .conclusion-text {
      font-size: 12.5px;
      font-weight: 500;
    }

    /* COMPARISON */
    .comparison-sec {
      background-color: #faf7fb;
      border-radius: 16px;
      padding: 22px;
      margin-bottom: 28px;
      border: 1px solid #eae0f0;
    }

    .comparison-grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
    }

    .comparison-card {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 16px;
      border: 1px solid #eaddf0;
    }

    .comparison-header {
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .bar-container {
      background-color: #f1f5f9;
      border-radius: 8px;
      height: 22px;
      width: 100%;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .bar-fill {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      font-size: 11px;
      font-weight: 800;
      color: #ffffff;
    }

    .initial-bar {
      background: linear-gradient(90deg, #f87171, #dc2626);
    }

    .final-bar {
      background: linear-gradient(90deg, #34d399, #059669);
    }

    .comparison-list {
      margin: 0;
      padding-left: 16px;
      font-size: 12px;
      color: #475569;
    }

    .comparison-list li {
      margin-bottom: 5px;
    }

    .clinical-bullet-list {
      padding-left: 20px;
      margin: 0;
    }

    .clinical-bullet-list li {
      margin-bottom: 10px;
      font-size: 13.5px;
      color: #334155;
      line-height: 1.55;
    }

    /* CTA AREA */
    .cta-area {
      margin-top: 36px;
      border-top: 2px dashed #e8ded1;
      padding-top: 28px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      background-color: #fcf7fc;
      border-radius: 16px;
      padding: 28px;
      border: 1px solid #f0e2f3;
    }

    .btn-action-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      width: 100%;
    }

    .whatsapp-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #25D366, #128C7E);
      color: #ffffff;
      font-weight: 800;
      font-size: 14px;
      padding: 15px 30px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.25);
      transition: transform 0.2s;
    }

    .whatsapp-btn:hover {
      transform: scale(1.02);
    }

    .web-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #f3ebf5;
      color: #56346f;
      font-weight: 700;
      font-size: 13px;
      padding: 14px 24px;
      border-radius: 12px;
      text-decoration: none;
      border: 1px solid #e0d0e8;
      transition: transform 0.2s;
    }

    .web-btn:hover {
      background-color: #eaddf0;
      color: #3a185c;
    }

    @media print {
      body {
        background-color: #ffffff;
        color: #000000;
        padding: 0;
      }
      .container {
        border: none;
        padding: 0;
        box-shadow: none;
      }
      .print-btn, .cta-area {
        display: none !important;
      }
      .day-card {
        page-break-inside: avoid;
      }
    }

    @media (max-width: 640px) {
      .container {
        padding: 20px;
      }
      .metrics-grid, .comparison-grid, .conclusion-grid {
        grid-template-cols: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-area">
        <div class="logo">M.A.P.A.™</div>
        <span class="clinic-tag">INFORME CLÍNICO DE ORIENTACIÓN NEUROCOGNITIVA</span>
      </div>
      <button class="print-btn" onclick="window.print()">Imprimir / Guardar PDF 🖨️</button>
    </div>

    <h1 class="cover-title">Dossier de Autodescubrimiento y Regulación Autonómica</h1>
    <div class="subtitle">Informe Personalizado de Evolución Somática y Calma Progresiva M.A.P.A.™</div>

    <div class="metadata">
      <table>
        <tr>
          <td class="label">Persona Evaluada:</td>
          <td><strong>${nombre}</strong></td>
        </tr>
        <tr>
          <td class="label">Correo Registrado:</td>
          <td>${email}</td>
        </tr>
        <tr>
          <td class="label">Fecha Elaboración:</td>
          <td>${fecha}</td>
        </tr>
        <tr>
          <td class="label">Arquetipo Principal:</td>
          <td><strong>${profileName}</strong> (${profileSub})</td>
        </tr>
        <tr>
          <td class="label">Código de Referencia:</td>
          <td><strong style="font-family: monospace; color: #8a519e;">${reportRef}</strong></td>
        </tr>
      </table>
    </div>

    <div class="disclaimer">
      <strong>AVISO DE METODOLOGÍA Y ORIENTACIÓN INTELIGENTE (M.A.P.A.™):</strong> Este informe constituye un instrumento digital de autoconocimiento, orientación somática y estructuración de hábitos asistido por Inteligencia Artificial. NO ES UN DIAGNÓSTICO CLÍNICO O PSIQUIÁTRICO, ni reemplaza la evaluación psicoterapéutica presencial realizada por profesionales de la salud mental. Su propósito es guiarte en el reconocimiento de patrones de hiperalerta y facilitar tu transición hacia la calma autonómica.
    </div>

    <!-- EXECUTIVE METRICS -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-val">84%</div>
        <div class="metric-lbl">Tono Parasimpático Vagal</div>
        <div class="metric-sub">▲ +52% respecto al Día 1</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">88%</div>
        <div class="metric-lbl">Adaptabilidad Somática</div>
        <div class="metric-sub">✓ Estado de Asertividad</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">-68%</div>
        <div class="metric-lbl">Bucle Rumiante Intrusivo</div>
        <div class="metric-sub">▼ Desactivación de Alerta</div>
      </div>
    </div>

    <div class="section-title">Análisis del Arquetipo Dominante Evaluado</div>
    <div class="day-card" style="margin-bottom:28px;">
      <span class="day-badge">EVALUACIÓN DE BIOTIPO NEUROCOGNITIVO</span>
      <h3 class="day-title" style="margin-top:6px; margin-bottom:8px;">${profileName}</h3>
      <p style="margin: 0; font-size:13.5px; color:#334155; line-height: 1.6; text-align:justify;">${profileDesc}</p>
    </div>

    <!-- COMPARATOR GRAPHICS (BEFORE VS AFTER) -->
    <div class="section-title">Evolución de Regulación de Alerta (Antes vs Después)</div>
    <div class="comparison-sec">
      <p style="margin:0 0 14px 0; font-size:13px; color:#475569; line-height:1.5;">
        Los siguientes marcadores resumen el comportamiento del sistema nervioso autónomo de <strong>${nombre}</strong> comparando el umbral basal inicial del Día 1 frente al balance vagal alcanzado al culminar la integración en el Día 7.
      </p>
      
      <div class="comparison-grid">
        <div class="comparison-card">
          <div class="comparison-header" style="color: #dc2626;">DÓNDE EMPEZASTE (Día 1: Hiperalerta)</div>
          <div class="bar-container">
            <div class="bar-fill initial-bar" style="width: 88%;">88% Carga</div>
          </div>
          <ul class="comparison-list">
            <li><strong>Tono Simpático:</strong> Hiperactivo Severo</li>
            <li><strong>Tensión muscular mandibular:</strong> Retención alta</li>
            <li><strong>Asimilación de estímulos:</strong> Fatiga inmediata</li>
            <li><strong>Bucle rumiador futuro:</strong> 4 - 6 episodios/hora</li>
          </ul>
        </div>
        
        <div class="comparison-card">
          <div class="comparison-header" style="color: #059669;">NIVEL RESIDUAL ACTUAL (Día 7: Calma Vagal)</div>
          <div class="bar-container">
            <div class="bar-fill final-bar" style="width: 32%;">32% Balance</div>
          </div>
          <ul class="comparison-list">
            <li><strong>Tono Parasimpático:</strong> Óptimo Vagotónico</li>
            <li><strong>Estabilidad muscular:</strong> Propiocepción asimilada</li>
            <li><strong>Amortiguación sensorial:</strong> Filtrado asertivo</li>
            <li><strong>Bucle rumiador futuro:</strong> Auto-interrupción eficaz</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- DAY BY DAY DETAILED CLINICAL WORK -->
    <div class="section-title">Evolución Detallada por Estadios (Programa de 7 Días)</div>
    <div class="day-list">
      ${daysHTML}
    </div>

    <!-- POINTS OF IMPROVEMENT -->
    <div class="section-title">Puntos Críticos Sugeridos Para Tu Mantenimiento</div>
    <div class="day-card" style="background-color:#fffdf5; border: 1px solid #fde68a;">
      <ul class="clinical-bullet-list">
        <li>
          <strong>Control de Micromanagement Somático:</strong> Evitar la monitorización obsesiva del ritmo cardíaco, permitiendo una autorregulación natural del nodo sinusal.
        </li>
        <li>
          <strong>Amortiguación Mandibular Nocturna:</strong> Practicar la separación consciente de arcadas dentales y reposo de la lengua en el paladar superior al descansar.
        </li>
        <li>
          <strong>Ampliación de la Tolerancia al Caos:</strong> Ejercitar pausas deliberadas en entornos desordenados breves para reeducar la corteza insular reduciendo la intolerancia sensorial.
        </li>
        <li>
          <strong>Saturación por Complacencia Afectiva:</strong> Monitorear la tendencia a resolver conflictos ajenos con la consiguiente asimilación de la carga adrenérgica de un tercero.
        </li>
      </ul>
    </div>

    <!-- CONCLUSIONS AND GENERAL PROFESSIONAL RECOMMENDATIONS -->
    <div class="section-title">Dictamen Orientativo y Recomendación Final</div>
    <div class="day-card" style="background-color:#faf5fc; border: 1px solid #eaddf0; line-height:1.6; text-align:justify; font-size:13.5px; color:#2d3748;">
      <p style="margin-top:0;">
        <strong>Conclusión de Orientación del Avance:</strong> La persona evaluada <strong>${nombre}</strong> ha mostrado un excelente incremento en sus marcadores de adaptabilidad autonómica. A través de la autoevaluación guiada de 7 días, se observa una transición del patrón reactivo simpático inicial hacia una asertividad de autoprotección y calma. La propiocepción de alarmas físicas debilitadas y el empleo diario de anclas de calma indican una asimilación saludable y una disminución sustancial de los estados rumiantes recurrentes.
      </p>
      <p style="margin-bottom:0;">
        <strong>Recomendaciones de Descompresión Estructurada:</strong> Se aconseja formalmente mantener el protocolo integrado del sintonizador acústico M.A.P.A.™ durante periodos de fatiga extrema. Para asegurar la consolidación permanente de las redes neurales autorreguladas, es fundamental trascender la mera teoría del autodescubrimiento y continuar con la práctica constante de autorregulación guiada.
      </p>
    </div>

    <!-- CALL TO ACTIONS (INTERACTIVE ELEMENTS) -->
    <div class="cta-area">
      <div style="font-size:16px; font-weight:800; color:#3a185c; text-transform:uppercase; letter-spacing:0.5px;">
        CONTINÚA TU PROCESO EN M.A.P.A.™ Care Ecosistema Clínico de Contención Femenina
      </div>
      <p style="font-size:13px; color:#56346f; max-width:560px; margin:0;">
        Nuestra plataforma 100% digital asistida por Inteligencia Artificial está lista para acompañarte en tu transformación de bienestar emocional.
      </p>
      <div class="btn-action-container">
        <a href="${waUrl}" target="_blank" class="whatsapp-btn">
          <span>Quiero el proceso completo en M.A.P.A.™ Care ➔</span>
        </a>
        <a href="https://tupodermental.club" target="_blank" class="web-btn">
          <span>Visitar Poder Mental Club ➔</span>
        </a>
      </div>
    </div>

    <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #8a519e; font-weight: 600;">
      Plataforma 100% Digital M.A.P.A.™ IA • Clara Luz • Mentora M.A.P.A.™ Mujer • Creadora y Fundadora • Administrado por soporte@podermentalia.club
    </div>
  </div>
</body>
</html>`;
    
    // Create downloaded blob
    const blob = new Blob([htmlReport], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MAPA_Reporte_Clinico_${nombre.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestart = () => {
    if (programProgress.completedDays && programProgress.completedDays.length >= 7) {
      setPhase("DASHBOARD");
      return;
    }
    setUserResponses([]);
    setCurrentQuestionIndex(0);
    setIsEvaluationReady(false);
    setEvaluationResult(null);
    
    const activeEmail = currentUserEmail || leadInfo.email;
    if (activeEmail) {
      const restartedProg = {
        activationDate: new Date().toISOString(),
        currentDay: 1,
        completedDays: [],
        responses: {},
        leadInfo: { nombre: leadInfo.nombre, email: activeEmail, whatsapp: leadInfo.whatsapp },
        leadCaptured: true,
        completionTimestamps: {}
      };
      setProgramProgress(restartedProg);
      localStorage.setItem(`MAPA_USER_PROGRESS_${activeEmail.toLowerCase().trim()}`, JSON.stringify(restartedProg));
      setPhase("DASHBOARD");
    } else {
      setProgramProgress({
        activationDate: "",
        currentDay: 1,
        completedDays: [],
        responses: {},
        leadInfo: { nombre: "", email: "", whatsapp: "" },
        leadCaptured: false,
        completionTimestamps: {}
      });
      localStorage.removeItem("MAPA_7DAY_PROGRESS_V2");
      setPhase("LANDING");
    }
  };

  // CBT Advice computed dynamically on Wizard Step
  const getCBTAdvice = () => {
    const name = leadInfo.nombre || "Usuaria";
    if (currentQuestionIndex < 5) {
      return `Querida ${name}, inicias este camino con mucha valentía. Yo, Clara Luz • Mentora M.A.P.A.™ Mujer, te acompaño. Reconocer cómo reacciona tu cuerpo es el paso número uno para desactivar el radar de alerta.`;
    } else if (currentQuestionIndex < 10) {
      return `¡Excelente nivel de introspección, ${name}! Clara Luz • Mentora M.A.P.A.™ Mujer celebra este avance. Comprender tus desencadenantes enseña a tu amígdala que lo que vives no es un fallo tuyo, sino una respuesta de protección.`;
    } else if (currentQuestionIndex < 15) {
      return `Descubrir tus patrones rumiantes te permite liberarte, querida ${name}. Recuerda que no eres tus pensamientos ansiosos; eres la consciencia sabia que los observa, y yo estoy aquí para protegerte.`;
    } else {
      return `Últimas preguntas completadas, ${name}. Tu brújula emocional está a pocos segundos de calibrarse por completo. Estoy lista para entregarte el alivio y la paz que tanto mereces.`;
    }
  };

  if (phase === "ADMIN") {
    return (
      <div id="app_root_admin" className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#36C4D8]/30 selection:text-[#0F172A] relative overflow-x-clip">
        <AdminPanel
          onLogoutAdmin={() => {
            localStorage.removeItem("MAPA_CURRENT_USER_EMAIL");
            setCurrentUserEmail("");
            setPhase("LANDING");
          }}
        />
      </div>
    );
  }

  return (
    <div id="app_root" className="min-h-screen bg-[#FAF7F9] text-[#56346F] flex flex-col font-sans selection:bg-[#36C4D8]/30 selection:text-[#6E488A] relative overflow-x-clip">
      
      {/* Decorative top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-[#EDE0F0]/50 via-transparent to-transparent blur-3xl pointer-events-none z-0" />

      {/* Persistent PWA Install Banner */}
      {!(focusMode && phase === "DASHBOARD") && (
        <PWAInstallBanner
          currentUserEmail={currentUserEmail}
          hasDownloadedApp={!!programProgress.hasDownloadedApp}
          onConfirmDownloaded={handleConfirmAppDownloaded}
        />
      )}

      {/* HEADER LOGO RAIL WITH TOP RIGHT AVATAR AND ACTIVE DOT */}
      {!(focusMode && phase === "DASHBOARD") && (
        <Header
          currentUserEmail={currentUserEmail}
          leadInfo={leadInfo}
          programProgress={programProgress}
          saveCustomAvatar={saveCustomAvatar}
          setIsProfileSettingsOpen={setIsProfileSettingsOpen}
          setIsSupportDrawerOpen={setIsClaraProfileOpen}
          onOpenNotifications={() => setIsProfileSettingsOpen(true)}
          handleUserLogout={handleUserLogout}
          setPhase={setPhase}
          setLoginEmail={setLoginEmail}
          setLeadInfo={setLeadInfo}
          setProgramProgress={setProgramProgress}
        />
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-12 relative z-10 flex flex-col justify-start min-w-0 max-w-full">
        
        <AnimatePresence mode="wait">
          {phase === "LANDING" && (
            <motion.div
              key="landing_phase"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-16"
            >
              {/* FASE 1: HERO (Encima y Conservar) */}
              <section id="landing_hero" className="text-center space-y-8 max-w-4xl mx-auto py-4">
                <div className="inline-flex items-center space-x-2 bg-[#EDE0F0] border-2 border-[#6E488A]/30 py-2 px-5 rounded-full select-none shadow-[0_4px_15px_rgba(110,72,138,0.05)]">
                  <span className="text-base font-black tracking-wide text-[#1C0630] uppercase flex items-center gap-1.5 font-bold">
                    By <span className="text-[#E86FA3] font-black">TU PODER MENTAL MUJER</span>
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h1 className="font-display font-black text-5xl sm:text-6xl md:text-7xl text-[#1C0630] tracking-tight leading-none">
                    M.A.P.A. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E86FA3] to-[#1C0630]">Mujer</span>
                  </h1>
                  <p className="text-[#E86FA3] text-2xl sm:text-3xl font-black tracking-wide uppercase max-w-3xl mx-auto leading-relaxed">
                    Mapa de Activación y Protección Emocional
                  </p>
                </div>
                
                <p className="text-lg sm:text-xl md:text-2xl text-[#0B152B] font-sans tracking-wide leading-relaxed max-w-3xl mx-auto px-4 font-black">
                  Descubre qué factores podrían estar manteniendo activo tu sistema de alerta emocional. Un espacio diseñado única y exclusivamente para guiar a la mujer hacia su bienestar, autorregulación y calma mental.
                </p>

                {/* Animated Custom Gold & Teal Brain-Compass Core (Matches uploaded logo accurately) */}
                <div className="py-8 flex justify-center">
                  <div className="relative w-48 h-48 rounded-full border-4 border-[#411F66]/30 p-2 bg-gradient-to-b from-white to-[#FFF7FC] shadow-[0_0_30px_rgba(232,111,163,0.12)] flex items-center justify-center">
                    {/* Compass outer dial ring */}
                    <div className="absolute inset-2 rounded-full border border-dashed border-[#36C4D8]/30 animate-spin" style={{ animationDuration: '30s' }} />
                    <div className="absolute inset-5 rounded-full border border-[#E86FA3]/20 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                    <div className="absolute inset-6 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center overflow-hidden">
                      {/* Brain division background (teal/left, green/right matches logo) */}
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 h-full bg-[#36C4D8]/10 border-r border-[#36C4D8]/20" />
                        <div className="w-1/2 h-full bg-[#F58BC8]/10" />
                      </div>
                      {/* Brain Icon / Compass needle with gold sun terminal */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center">
                        <Compass className="w-20 h-20 text-[#36C4D8] opacity-35 animate-pulse absolute" />
                        {/* Custom shiny compass needle rotater */}
                        <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
                          <div className="relative h-28 w-1 flex items-center justify-center">
                            {/* Needle point */}
                            <div className="absolute -top-1 w-2.5 h-2.5 bg-[#36C4D8] rotate-45 rounded animate-pulse" />
                            {/* Needle shine */}
                            <div className="w-[2px] h-full bg-gradient-to-b from-[#36C4D8] via-[#EDE0F0] to-[#E86FA3]" />
                            {/* Needle gold sun pointer at bottom/top */}
                            <div className="absolute -bottom-1 w-3 h-3 bg-[#E86FA3] rounded-full border border-pink-200 shadow-[0_0_10px_rgba(232,111,163,0.5)] animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlighted Quote Board from attached files (COMPRENDER ES...) */}
                <div className="max-w-2xl mx-auto px-4 pb-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-white via-[#EDE0F0]/50 to-white border-2 border-[#1C0630]/25 shadow-[0_4px_20px_rgba(110,72,138,0.06)] space-y-2">
                    <span className="text-sm font-mono tracking-widest text-[#E86FA3] uppercase block font-black">FILOSOFÍA DE CONTENCIÓN</span>
                    <p className="font-display font-black text-xl sm:text-2xl text-[#1C0630] leading-relaxed">
                      COMPRENDER ES EL PRIMER PASO PARA <span className="text-[#36C4D8] block sm:inline font-black">TRANSFORMAR TU VIDA</span>.
                    </p>
                  </div>
                </div>
              </section>

              {/* Returning User Continuation Card Alert (Now placed below Hero) */}
              {programProgress.activationDate && (() => {
                const chrono = getChronologicalState();
                const currentExercise = MINI_EXERCISES[currentExerciseIndex];
                const progressRatio = (30 - miniSecondsLeft) / 30;
                const guideIndex = Math.min(Math.floor(progressRatio * currentExercise.guides.length), currentExercise.guides.length - 1);
                const currentGuideText = isMiniExerciseActive 
                  ? currentExercise.guides[guideIndex] 
                  : "Haz clic en 'Comenzar (30s)' para iniciar.";

                return (
                  <div 
                    id="returning_prompt_card"
                    onMouseEnter={rotateMiniExercise}
                    className="bg-amber-400/20 backdrop-blur-md border-4 border-amber-500 rounded-2xl p-6 text-left max-w-2xl mx-auto flex flex-col gap-5 shadow-2xl shadow-[inset_0_2px_6px_rgba(255,255,255,0.4)] shadow-amber-500/30 transition-all duration-300 hover:scale-[1.01] hover:border-amber-400 hover:bg-amber-400/30 hover:shadow-amber-500/50"
                  >
                    {/* Top Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
                      <div className="space-y-1 drop-shadow-[0_1.5px_1.5px_rgba(255,255,255,1)]">
                        <span className="text-[10px] font-mono text-[#D6448D] uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          {programProgress.completedDays.length >= 7
                            ? "¡PROGRAMA DE 7 DÍAS COMPLETADO! 🎉"
                            : "¡VIAJE EN PROGRESO DETECTADO!"}
                          {currentUserEmail?.toLowerCase() === "contacto@tupodermental.club" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhase("ADMIN");
                              }}
                              className="ml-2 px-2 py-0.5 bg-[#411F66] text-[#7EF9FF] border border-[#7EF9FF]/20 rounded-md hover:bg-opacity-95 transition-all text-[9px] font-mono flex items-center gap-1 cursor-pointer font-extrabold shadow-sm active:scale-95"
                              title="Acceso de Administración"
                            >
                              ⚙️ Admin
                            </button>
                          )}
                        </span>
                        <h4 className="text-sm font-display font-black text-[#3A185C]">
                          {programProgress.completedDays.length >= 7
                            ? "Has completado con éxito tu ciclo de 7 Días"
                            : "Tienes un autodiagnóstico activo"}
                        </h4>
                        <p className="text-xs text-black font-sans font-bold">
                          {programProgress.completedDays.length >= 7
                            ? "Todos tus informes, resultados, audios y logros están 100% disponibles."
                            : `Día de hoy: Día ${programProgress.currentDay} • Completados: ${programProgress.completedDays.length} de 7 días.`}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent rotation trigger
                            setPhase("DASHBOARD");
                            setSelectedDayPreview(1);
                            setTimeout(() => {
                              const elem = document.getElementById("emotional_timeline_section");
                              if (elem) {
                                  elem.scrollIntoView({ behavior: "smooth", block: "center" });
                              }
                            }, 100);
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#411F66] to-[#E86FA3] text-white font-display font-extrabold text-xs tracking-wider flex items-center justify-center space-x-2 cursor-pointer transition-all border-2 border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),_0_4px_12px_rgba(65,31,102,0.15)] hover:scale-[1.02] btn-neon-pulse"
                        >
                          <span>{programProgress.completedDays.length >= 7 ? "VER MI PANEL DE ARCHIVOS Y LOGROS" : "IR A MI PANEL"}</span>
                          <Compass className="w-3.5 h-3.5 text-white" />
                        </button>
                        <span className="text-xs font-mono font-black text-black text-center bg-yellow-400 border-2 border-yellow-600 px-2.5 py-1 rounded-md shadow-xs drop-shadow-[0_1.5px_1.5px_rgba(255,255,255,1)] w-full">
                          {programProgress.completedDays.length >= 7 ? (
                            <span className="text-emerald-900 font-black">
                              ¡7 Días Completados 100%! 🎉
                            </span>
                          ) : chrono.isLocked ? (
                            chrono.msRemaining < 30 * 60 * 1000 ? (
                              <motion.span
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}
                                className="inline-block text-red-800 font-black"
                              >
                                💓 Próximo día en: {String(chrono.hours).padStart(2, '0')}h {String(chrono.minutes).padStart(2, '0')}m {String(chrono.seconds).padStart(2, '0')}s
                              </motion.span>
                            ) : (
                              <span>Próximo día en: {String(chrono.hours).padStart(2, '0')}h {String(chrono.minutes).padStart(2, '0')}m {String(chrono.seconds).padStart(2, '0')}s</span>
                            )
                          ) : (
                            <span className="text-emerald-900 font-black">
                              ¡Siguiente prueba disponible!
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Base Section: Mini-ejercicio de calma */}
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="border-t-2 border-amber-500/25 pt-4 mt-1 w-full space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#3A185C]">
                          <span className="text-sm">{currentExercise.emoji}</span>
                          <span className="font-display font-black tracking-wide">Mini-ejercicio de Calma Express (30s)</span>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              rotateMiniExercise();
                            }}
                            disabled={isMiniExerciseActive}
                            className="text-[10px] font-bold text-[#3A185C]/75 hover:text-[#3A185C] bg-white/50 border border-amber-500/35 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm active:scale-95"
                            title="Cambiar ejercicio aleatorio"
                          >
                            <RefreshCw className={`w-2.5 h-2.5 ${isMiniExerciseActive ? 'opacity-40' : 'animate-spin'}`} style={{ animationDuration: '4s' }} />
                            <span>Cambiar ↻</span>
                          </button>
                          <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#D6448D] bg-white/60 px-2.5 py-0.5 rounded-full border border-[#D6448D]/10 shadow-xs">
                            {currentExercise.category}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/60 border border-amber-500/25 rounded-xl p-3 sm:p-4 space-y-3 shadow-inner relative overflow-hidden">
                        {/* Circle Breathing Guide visual aid when active */}
                        {isMiniExerciseActive && (
                          <div className="absolute right-3 top-3 w-10 h-10 flex items-center justify-center">
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.6, 1],
                                backgroundColor: ["rgba(232,111,163,0.3)", "rgba(54,196,216,0.5)", "rgba(232,111,163,0.3)"] 
                              }}
                              transition={{ 
                                duration: currentExercise.id === 1 ? 4 : currentExercise.id === 3 ? 6 : 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="w-6 h-6 rounded-full border-2 border-white/50"
                            />
                          </div>
                        )}

                        <div>
                           <h5 className="text-xs font-black text-[#3A185C] flex items-center gap-1">
                             <span>{currentExercise.title}</span>
                           </h5>
                           <p className="text-[11px] text-black/80 font-bold leading-relaxed mt-0.5">{currentExercise.description}</p>
                        </div>

                        {/* Instruction list/steps */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5 border-t border-[#3A185C]/5">
                          {currentExercise.steps.map((step, idx) => (
                            <div key={idx} className="bg-white/70 p-2 rounded-lg border border-[#3A185C]/10 text-[10px] font-bold text-black/85 flex items-start gap-1.5 shadow-xs">
                              <span className="w-4 h-4 rounded-full bg-amber-500/15 flex items-center justify-center text-[9px] font-black text-amber-800 shrink-0 mt-0.5">{idx + 1}</span>
                              <span className="leading-tight">{step}</span>
                            </div>
                          ))}
                        </div>

                        {/* Live Countdown area */}
                        <div className="bg-white/90 rounded-xl p-2.5 border border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-sm">
                          <div className="flex items-center gap-2.5 text-left w-full sm:w-auto">
                            <div className="w-8 h-8 rounded-full bg-[#E86FA3]/15 flex items-center justify-center font-mono font-black text-xs text-[#E86FA3] shrink-0 border border-[#E86FA3]/25 shadow-sm">
                              {miniSecondsLeft}s
                            </div>
                            <span className="text-[11px] font-bold text-[#3A185C] animate-fadeIn leading-snug">
                              {currentGuideText}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isMiniExerciseActive) {
                                setIsMiniExerciseActive(false);
                              } else {
                                setIsMiniExerciseActive(true);
                              }
                            }}
                            className={`w-full sm:w-auto px-4 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm border border-b-2 active:translate-y-[1px] active:border-b-0 ${
                              isMiniExerciseActive 
                                ? "bg-red-500 hover:bg-red-600 border-red-600 text-white" 
                                : "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white"
                            }`}
                          >
                            {isMiniExerciseActive ? "Detener" : "Comenzar (30s)"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {!programProgress.activationDate && (
                <>
                  {/* FASE DEL PRINCIPAL LLAMADO A LA ACCIÓN (CTA) */}
              <section id="landing_cta_section" className="text-center space-y-6 max-w-4xl mx-auto py-4">
                {/* Dynamic buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  {currentUserEmail ? (
                    (() => {
                      const chrono = getChronologicalState();
                      if (programProgress.completedDays.length >= 7) {
                        return (
                          <button
                            onClick={() => {
                              setPhase("DASHBOARD");
                            }}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-black tracking-wider text-white bg-gradient-to-r from-emerald-600 via-[#411F66] to-[#36C4D8] btn-neon-pulse flex items-center justify-center space-x-3 cursor-pointer text-base border-2 border-[#262222] shadow-xl"
                          >
                            <Sparkles className="w-5 h-5 text-white animate-pulse" />
                            <span>Ver Mi Panel de Logros y Archivos (7 Días Completados) 🎉</span>
                            <Compass className="w-5 h-5 text-white shrink-0" />
                          </button>
                        );
                      }
                      if (chrono.isLocked) {
                        return (
                          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                setPhase("DASHBOARD");
                                setTimeout(() => {
                                  const elem = document.getElementById("emotional_timeline_section");
                                  if (elem) {
                                    elem.scrollIntoView({ behavior: "smooth", block: "center" });
                                  }
                                }, 100);
                              }}
                              className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-black tracking-wider text-[#1C0630] bg-gray-100 hover:bg-gray-200 flex items-center justify-center space-x-3 cursor-pointer text-base border-2 border-gray-400 transition-all shadow-sm"
                            >
                              <span>Ir a mi Panel de Control</span>
                              <Compass className="w-5 h-5 text-[#1C0630] shrink-0" />
                            </button>
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
                              <span>Siguiente Test (Día {programProgress.currentDay}) disponible en: {String(chrono.hours).padStart(2, '0')}h {String(chrono.minutes).padStart(2, '0')}m {String(chrono.seconds).padStart(2, '0')}s</span>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <button
                            onClick={() => {
                              setPhase("DASHBOARD");
                              setTimeout(() => {
                                const elem = document.getElementById("emotional_timeline_section");
                                  if (elem) {
                                    elem.scrollIntoView({ behavior: "smooth", block: "center" });
                                  }
                              }, 100);
                            }}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-black tracking-wider text-white bg-gradient-to-r from-[#E86FA3] via-[#411F66] to-[#36C4D8] btn-neon-pulse flex items-center justify-center space-x-3 cursor-pointer text-base border-2 border-[#262222] shadow-xl"
                          >
                            <Sparkles className="w-5 h-5 text-white animate-pulse" />
                            <span>
                              {programProgress.completedDays.length === 7
                                ? "Ver Mi Reporte de 7 Días Completado ✨"
                                : `¡Haz tu test de hoy! (Día ${programProgress.currentDay || 1})`}
                            </span>
                            <Compass className="w-5 h-5 text-white shrink-0" />
                          </button>
                        );
                      }
                    })()
                  ) : (
                    <motion.button
                      onClick={startFreeScanTest}
                      animate={{ 
                        scale: [1, 1.03, 1],
                        boxShadow: [
                          "0 0 15px rgba(232, 111, 163, 0.35)",
                          "0 0 28px rgba(232, 111, 163, 0.65)",
                          "0 0 15px rgba(232, 111, 163, 0.35)"
                        ]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2.2, 
                        ease: "easeInOut" 
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="group w-full sm:w-auto px-8 py-5 rounded-2xl font-display font-black tracking-wider text-white bg-gradient-to-r from-[#411F66] via-[#B23B7C] to-[#E86FA3] flex items-center justify-center space-x-3 cursor-pointer text-base sm:text-lg border-2 border-white/30 shadow-2xl overflow-hidden relative"
                    >
                      {/* Premium sweep light highlight */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine-effect" />
                      <span className="relative z-10">Iniciar Ahora Escaneo de Alerta y Activación M.A.P.A™</span>
                      <ArrowRight className="w-5 h-5 text-white relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </motion.button>
                  )}
                  <a 
                    href="#problem"
                    className="w-full sm:w-auto px-6 py-4 rounded-xl border-2 border-[#1C0630]/30 text-[#1C0630] bg-[#EDE0F0]/30 hover:bg-[#EDE0F0]/60 text-sm font-black transition-all text-center self-stretch flex items-center justify-center"
                  >
                    Saber más primero
                  </a>
                </div>

                {/* Micro disclaimers */}
                <p className="text-xs text-[#1C0630] font-mono font-black">
                  NO ES TEST CLÍNICO • NO EVALUACIÓN MÉDICA • TOTALMENTE ANÓNIMO Y SEGURO
                </p>

                <div className="text-sm font-black tracking-wider uppercase text-center mt-4">
                  <span className="text-[#36C4D8]">FORTALECE TU MENTE</span>
                  <span className="text-gray-500 mx-2">•</span>
                  <span className="text-[#E86FA3]">TRANSFORMA TU VIDA</span>
                </div>
              </section>

              {/* ECOSISTEMA BY TU PODER MENTAL MUJER */}
              <section id="ecosistema_branding" className="max-w-3xl mx-auto py-6">
                <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border-2 border-dashed border-[#E86FA3]/50 bg-gradient-to-br from-white via-[#EDE0F0]/35 to-white shadow-[0_10px_30px_rgba(110,72,138,0.04)] text-center space-y-4">
                  <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-[#E86FA3]/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -left-16 -top-16 w-32 h-32 bg-[#36C4D8]/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="inline-flex items-center space-x-2 bg-[#E86FA3]/15 border border-[#E86FA3]/40 py-1 px-4 rounded-full">
                    <Sparkles className="w-4 h-4 text-[#E86FA3] animate-pulse" />
                    <span className="text-xs font-mono font-black text-[#E86FA3] uppercase tracking-widest">
                      ECOSISTEMA INTEGRAL FEMENINO
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-black text-3xl sm:text-4xl text-[#1C0630]">
                      M.A.P.A. Mujer
                    </h3>
                    <p className="text-xs sm:text-sm font-black text-[#1C0630]/90 uppercase tracking-widest">
                      Mapa de Activación y Protección Emocional
                    </p>
                    <div className="h-0.5 w-16 bg-gradient-to-r from-[#E86FA3] to-[#36C4D8] mx-auto my-3" />
                    <p className="font-display font-black text-xl sm:text-2xl text-[#E86FA3] tracking-wide">
                      By Tu Poder Mental Mujer
                    </p>
                    <p className="text-base font-sans font-black text-[#1C0630] max-w-xl mx-auto italic leading-relaxed">
                      "El Ecosistema Inteligente para el Bienestar Emocional Femenino"
                    </p>
                  </div>

                  <p className="text-xs font-mono text-[#1C0630] leading-relaxed max-w-lg mx-auto uppercase font-black tracking-wider">
                    Fortalece tu mente • Reconecta contigo • Transforma tu vida
                  </p>
                </div>
              </section>


              {/* FASE 3: EL PROBLEMA */}
              <section id="problem" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-6 border-t border-[#6E488A]/12 pt-12">
                <div className="md:col-span-7 space-y-6 text-left">
                  <div className="w-12 h-12 rounded-xl bg-[#EDE0F0] flex items-center justify-center border border-[#6E488A]/20">
                    <ShieldAlert className="w-6 h-6 text-[#E86FA3]" />
                  </div>
                  
                  <h2 className="font-display font-black text-3xl md:text-4xl text-[#411F66] tracking-tight leading-snug">
                    La ansiedad no es un fallo o defecto de tu mente.<br />
                    <span className="text-[#E86FA3]">Es un mecanismo de supervivencia neurobiológico que exige atención clínica.</span>
                  </h2>

                  <div className="space-y-4 text-[#0B152B]/90 font-sans leading-relaxed text-sm md:text-base">
                    <p className="font-semibold">
                      Desde la perspectiva de la psiconeuroinmunología, la ansiedad funciona exactamente como un <span className="text-[#E86FA3] font-bold">detector de humo biológico</span>. Su misión no es causarte daño, sino advertirte de una amenaza percibida mediante la activación del sistema nervioso simpático.
                    </p>
                    <p className="text-[#0B152B]/80 text-xs md:text-sm">
                      Intentar suprimir farmacológica o mentalmente los síntomas superficiales (la alarma) sin descifrar el origen psicosomático subyacente mantiene el sistema autónomo sobrecalentado. Solo mediante la integración consciente y la asimilación corporal se desactiva este estado de alerta crónica.
                    </p>
                  </div>

                  <div className="p-4 bg-[#EDE0F0]/50 border border-[#6E488A]/15 rounded-2xl space-y-3.5">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#411F66]">
                      🩺 Análisis Clínico-Funcional de la Alerta:
                    </h4>
                    <div className="space-y-3 text-xs text-[#411F66]/90 font-semibold">
                      <div className="flex items-start space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#E86FA3] shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-[#411F66] font-bold">Desbalance Autonómico:</strong> Tu cuerpo activó la respuesta simpática (lucha, huida o congelación) debido a un desajuste acumulado en tu carga alostática y autorregulación emocional.
                        </span>
                      </div>
                      <div className="flex items-start space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#E86FA3] shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-[#411F66] font-bold">Resolución de Raíz:</strong> Reconfigurar la vía vagal a través de anclas somáticas específicas restablece la homeostasis del sistema nervioso, extinguiendo la alarma de forma definitiva.
                        </span>
                      </div>
                      <div className="flex items-start space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#E86FA3] shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-[#411F66] font-bold">Asimilación Neurocognitiva:</strong> Al nombrar el disparador y registrar la respuesta fisiológica, tu córtex prefrontal recupera el control de regulación sobre la amígdala.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 bg-white border border-[#E86FA3]/25 rounded-3xl p-6 relative overflow-hidden h-72 flex flex-col justify-center items-center shadow-[0_0_25px_rgba(232,111,163,0.12)]">
                  <div className="absolute inset-0 bg-radial-gradient from-[#36C4D8]/5 to-transparent pointer-events-none" />
                  
                  {/* Radar Scanning Visual Loop */}
                  <div className="relative w-44 h-44 border border-[#411F66]/10 rounded-full flex items-center justify-center">
                    <div className="absolute w-28 h-28 border border-[#411F66]/15 rounded-full" />
                    <div className="absolute w-12 h-12 border border-[#36C4D8]/30 rounded-full bg-[#36C4D8]/10 animate-ping" />
                    
                    {/* Compass Line Accents */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#411F66]/10" />
                    <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#411F66]/10" />
                    
                    {/* Rotating Scanner Arm */}
                    <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '6s', backgroundImage: 'conic-gradient(from 0deg, rgba(54,196,216,0.3) 10%, transparent 40%)' }} />

                    {/* Target alerts */}
                    <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-[#E86FA3] shadow-[0_0_8px_#E86FA3]" />
                    <div className="absolute bottom-10 right-6 w-2 h-2 rounded-full bg-[#36C4D8] shadow-[0_0_8px_#36C4D8]" />
                    <Compass className="w-7 h-7 text-[#36C4D8] relative z-10 animate-pulse" />
                  </div>
                  
                  <span className="text-[11px] font-mono tracking-widest text-[#E86FA3] mt-4 uppercase animate-pulse font-black">
                    ⚠️ SENSOR CARDIO-EMOCIONAL OPERATIVO
                  </span>
                </div>
              </section>
              </>)}
            </motion.div>
          )}

          {/* =========================================================
              PHASE: SCAN_TEST - INITIAL 7 QUESTION RAPID SCAN
              ========================================================= */}
          {phase === "SCAN_TEST" && (
            <ScanWizard
              onScanComplete={handleScanComplete}
              onBackToHome={() => setPhase("LANDING")}
            />
          )}

          {/* =========================================================
              PHASE: SCAN_RESULTS - IMMEDIATE SCIENTIFIC STATS & RECRUITMENT
              ========================================================= */}
          {phase === "SCAN_RESULTS" && (
            <ScanResults
              metrics={scanMetrics}
              radialData={scanRadialData}
              interpretacionIA={scanInterpretacion}
              onBeginProgram={handleRegisterAndStartProgram}
              onRestart={handleRestartScan}
              isLoadingReg={isRegistering}
            />
          )}

          {/* =========================================================
              PHASE: LOGIN / IDENTIFICATION SYSTEM (NO SECURITY CORNER)
              ========================================================= */}
          {phase === "LOGIN" && (
            <motion.div
              key="login_phase"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-md mx-auto space-y-8 py-8"
            >
              <div className="text-center space-y-3">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-[#EDE0F0] border-2 border-[#6E488A]/30 flex items-center justify-center shadow-md">
                  <Lock className="w-6 h-6 text-[#127280] animate-pulse" />
                </div>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-[#1C0630]">
                  Identificación M.A.P.A.™
                </h2>
                <p className="text-[#1C0630] text-sm sm:text-base max-w-sm mx-auto leading-relaxed font-black font-sans">
                  Ingresa tu correo para personalizar tus resultados, resguardar tus respuestas e imprimir tu reporte de orientación personalizado de 7 días.
                </p>
              </div>

              <form 
                onSubmit={handleUserLoginSubmit} 
                className="glass-card p-8 rounded-3xl space-y-6 shadow-2xl text-left relative border-2 border-[#1C0630]/25 bg-white"
              >
                {/* Visual glow element behind */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#36C4D8]/5 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4">
                  {/* Correo Electrónico */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono text-[#1C0630] uppercase tracking-widest font-black">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C0630]/60" />
                      <input 
                        type="email" 
                        required
                        placeholder="ejemplo@correo.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-[#FAF7F9] border-2 border-[#6E488A]/25 focus:border-[#36C4D8] placeholder:text-gray-500 rounded-xl p-3.5 pl-11 text-sm outline-none text-[#1C0630] font-black transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Detect banner in case user profile already exists in localStorage (Instant Recovery!) */}
                  {(() => {
                    const emailKey = loginEmail.toLowerCase().trim();
                    if (emailKey && emailKey.includes("@")) {
                      const hasPrev = localStorage.getItem(`MAPA_USER_PROGRESS_${emailKey}`);
                      if (hasPrev) {
                        try {
                          const parsed = JSON.parse(hasPrev);
                          const completedCount = parsed.completedDays?.length || 0;
                          return (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-emerald-50 border-2 border-emerald-300 p-3 rounded-xl text-xs text-emerald-950 flex items-center space-x-2.5 font-sans font-black"
                            >
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
                              <span>
                                ¡Cuenta detectada! Recuperaremos tu perfil de <strong>{parsed.leadInfo?.nombre || "Usuaria"}</strong> ({completedCount} de 7 días listos).
                              </span>
                            </motion.div>
                          );
                        } catch (e) {
                          return null;
                        }
                      } else {
                        const adminEmails = ["contacto@tupodermental.club"];
                        const isAdm = adminEmails.includes(emailKey);
                        if (isAdm) return null;
                        return (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-purple-50 border-2 border-[#6E488A]/20 p-3 rounded-xl text-xs text-[#1C0630] flex items-center space-x-2.5 font-sans font-black"
                          >
                            <Sparkles className="w-4 h-4 text-[#E36DB4] shrink-0" />
                            <span>¡Nuevo registro! Crearemos un M.A.P.A.™ completamente nuevo para ti.</span>
                          </motion.div>
                        );
                      }
                    }
                    return null;
                  })()}

                  {/* Código de Acceso / Contraseña Administrador */}
                  {(() => {
                    const emailKey = loginEmail.toLowerCase().trim();
                    const adminEmails = ["contacto@tupodermental.club"];
                    const isAdm = adminEmails.includes(emailKey);
                    
                    return (
                      <div className="space-y-1">
                        <label className="block text-xs font-mono text-[#1C0630] uppercase tracking-widest font-black">
                          {isAdm ? "Contraseña de Administrador (Maestra)" : "Código de Acceso (Opcional)"}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C0630]/60" />
                          <input 
                            type={isAdm ? "password" : "text"} 
                            required={isAdm}
                            placeholder={isAdm ? "Introduce la contraseña maestra" : "123456 (Opcional para alumnas)"}
                            maxLength={isAdm ? 100 : 6}
                            value={loginAccessCode}
                            onChange={(e) => setLoginAccessCode(isAdm ? e.target.value : e.target.value.toUpperCase())}
                            className={`w-full bg-[#FAF7F9] border-2 border-[#6E488A]/25 focus:border-[#36C4D8] placeholder:text-gray-500 rounded-xl p-3.5 pl-11 text-sm outline-none text-[#1C0630] transition-all ${isAdm ? "font-sans font-bold" : "font-mono font-black tracking-widest uppercase text-base"}`}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="block text-[11px] text-[#1C0630] font-mono font-bold leading-normal">
                            {isAdm ? "Protección exclusiva para el acceso de Administración M.A.P.A.™" : "¡Opcional! Si ya adquiriste la App, escribe tu correo arriba para entrar."}
                          </span>
                          {!isAdm && (
                            <button
                              type="button"
                              onClick={handleRequestAccessCode}
                              disabled={isRequestingCode}
                              className="text-[11px] text-[#127280] hover:text-[#2DB3C7] transition-all font-mono font-black underline bg-transparent border-none p-0 cursor-pointer inline-flex items-center shrink-0"
                            >
                              {isRequestingCode ? "Enviando..." : "Solicitar/Recuperar Código"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ¿Cómo quieres que te llamemos? - Solo para no-administradores */}
                  {(() => {
                    const emailKey = loginEmail.toLowerCase().trim();
                    const adminEmails = ["contacto@tupodermental.club"];
                    const isAdm = adminEmails.includes(emailKey);
                    if (isAdm) return null;
                    return (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono text-[#1C0630] uppercase tracking-widest font-black">
                            ¿Cómo quieres que te llamemos?
                          </label>
                          <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C0630]/60" />
                            <input 
                              type="text" 
                              required
                              placeholder="Ej. María"
                              value={loginAlias}
                              onChange={(e) => {
                                const val = e.target.value;
                                  setLoginAlias(val);
                                  setLoginNombre(val);
                              }}
                              className="w-full bg-[#FAF7F9] border-2 border-[#6E488A]/25 focus:border-[#36C4D8] placeholder:text-gray-500 rounded-xl p-3.5 pl-11 text-sm outline-none text-[#1C0630] font-black transition-all font-sans"
                            />
                          </div>
                          <span className="block text-[11px] text-[#1C0630] font-mono font-bold">
                            Se usará para personalizar tus saludos y tarjetas en la plataforma, respetando tu privacidad.
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="acceptTerms"
                    checked={loginTermsAccepted}
                    onChange={(e) => setLoginTermsAccepted(e.target.checked)}
                    className="mt-1 accent-[#36C4D8] rounded scale-125 shrink-0"
                  />
                  <label htmlFor="acceptTerms" className="text-xs sm:text-sm text-[#1C0630] leading-relaxed font-sans cursor-pointer select-none font-bold">
                    Doy mi consentimiento para procesar mis datos de autoconocimiento y recibir herramientas terapéuticas complementarias gratuitas.
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!loginTermsAccepted}
                    className="w-full py-4 rounded-xl font-display font-black tracking-wider text-[#1C0630] bg-gradient-to-r from-[#36C4D8] via-[#7BE3E8] to-[#36C4D8] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_25px_rgba(54,196,216,0.3)] flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:transform-none border-2 border-[#262222]"
                  >
                    <span>INGRESAR A MI MAPA (ACCEDER) ➔</span>
                  </button>
                </div>

                {/* WhatsApp Support Section */}
                <div className="relative flex items-center pt-2">
                  <div className="flex-grow border-t-2 border-[#1C0630]/10"></div>
                  <span className="flex-shrink mx-4 text-[11px] text-[#1C0630] font-mono uppercase tracking-widest font-black">¿Tienes problemas para ingresar?</span>
                  <div className="flex-grow border-t-2 border-[#1C0630]/10"></div>
                </div>

                <div className="bg-[#FAF7FC] border-2 border-[#1C0630]/15 p-4 rounded-2xl space-y-3 text-center">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E36DB4] shadow-md shrink-0 bg-white">
                      <img
                        src="/clara_luz.jpg"
                        alt="Clara Luz Mentora"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('/clara_luz.jpg')) {
                            target.src = '/clara-luz-profile.jpg';
                          } else if (target.src.includes('/clara-luz-profile.jpg')) {
                            target.src = '/assets/clara-luz-profile.jpg';
                          }
                        }}
                        className="w-full h-full object-cover object-center rounded-full"
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-[#1C0630] font-black leading-relaxed">
                      Si eres compradora y tienes inconvenientes para iniciar sesión o conseguir tu código, no te preocupes. Clara Luz • Mentora M.A.P.A.™ Mujer te ayudará de inmediato.
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/573005149055?text=${encodeURIComponent(`¡Hola, Clara Luz! 🫶\nNecesito ayuda técnica con mi acceso a M.A.P.A.™ Mujer.\nMi correo de registro es: ${loginEmail || ""}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl font-sans font-black text-xs sm:text-sm text-white bg-[#25D366] hover:bg-[#20BA56] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 shadow-sm no-underline"
                  >
                    <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" />
                    <span>AYUDA / SOPORTE POR WHATSAPP</span>
                  </a>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setPhase("LANDING")}
                    className="text-xs text-[#1C0630] hover:text-black transition-colors font-mono cursor-pointer bg-transparent border-none py-1 font-black underline"
                  >
                    ← Volver a la página principal
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {phase === "DASHBOARD" && (
            <motion.div
              key="dashboard_phase"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-4xl mx-auto animate-fadeIn min-w-0 max-w-full"
            >
              <Dashboard
                userEmail={currentUserEmail}
                leadInfo={leadInfo}
                programProgress={programProgress}
                currentChronoState={getChronologicalState()}
                evaluationResult={evaluationResult}
                selectedDayPreview={selectedDayPreview}
                setSelectedDayPreview={setSelectedDayPreview}
                onStartDayTest={() => launchDailyQuiz()}
                handleConfirmAppDownloaded={handleConfirmAppDownloaded}
                setMilestoneModal={setMilestoneModal}
                setIsClaraProfileOpen={setIsClaraProfileOpen}
                setIsProfileSettingsOpen={setIsProfileSettingsOpen}
                dashboardNotice={dashboardNotice}
                getUserArchetypeSlug={getUserArchetypeSlug}
                getUserShortName={getUserShortName}
                getTimeRemainingForDay={getTimeRemainingForDay}
              />
            </motion.div>
          )}

          {phase === "WIZARD" && (
            <motion.div
              key="wizard_phase"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              {(() => {
                const activeQuestions = getActiveDayQuestions();
                const currentQ = activeQuestions[currentQuestionIndex];
                if (!currentQ) return null;

                return (
                  <>
                    {/* Questionnaire Progress and Header */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-mono uppercase bg-[#EDE0F0] text-[#3A185C] border-2 border-[#6E488A]/35 px-3 py-1 rounded-full font-black">
                          Día {programProgress.currentDay} • Pilar: {
                            currentQ.category === "activacion" ? "Nivel de Activación" :
                            currentQ.category === "detonantes" ? "Desencadenantes" :
                            currentQ.category === "patrones" ? "Patrones Mentales" : "Factores de Protección"
                          }
                        </span>
                        <span className="text-xs sm:text-sm font-mono text-[#3A185C] font-black bg-white border border-[#6E488A]/15 py-1 px-2.5 rounded-lg shadow-xs">
                          Pregunta {currentQuestionIndex + 1} de 7
                        </span>
                      </div>

                      {/* Progress bar visual */}
                      <div className="w-full bg-[#FAF7F9] h-3.5 rounded-full overflow-hidden border-2 border-[#6E488A]/20 relative shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-[#36C4D8] via-[#E36DB4] to-[#6E488A] h-full rounded-full transition-all duration-300" 
                          style={{ width: `${((currentQuestionIndex + 1) / 7) * 100}%` }}
                        />
                        {/* Glowing progress tip */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full scale-125 pointer-events-none blur-xs animate-ping"
                          style={{ left: `calc(${((currentQuestionIndex + 1) / 7) * 100}% - 8px)` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#3A185C] font-extrabold bg-[#FAF7F9] p-2.5 border border-[#6E488A]/12 rounded-xl">
                        <span>Porcentaje Completo: <strong className="text-[#3A185C] font-black">{Math.round(((currentQuestionIndex + 1) / 7) * 100)}%</strong></span>
                        <span className="text-[#E36DB4] font-black">{7 - currentQuestionIndex - 1} restantes de hoy</span>
                      </div>
                    </div>

                    {/* Companion Coaching Avatar UI */}
                    <div className="bg-[#EDE0F0]/50 border-2 border-[#6E488A]/25 rounded-2xl p-5 flex items-start space-x-3.5 text-left shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#6E488A]/30 shadow-xs shrink-0">
                        <Sparkles className="w-5 h-5 text-[#E36DB4]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] sm:text-xs font-mono text-[#3A185C] uppercase tracking-wider font-black">Clara Luz • Mentora M.A.P.A.™ Mujer</p>
                        <p className="text-xs sm:text-sm text-[#3A185C] leading-relaxed italic font-bold">
                          "{getCBTAdvice()}"
                        </p>
                      </div>
                    </div>

                    {/* The Active Question Card Display */}
                    <div className="bg-white border-2 border-[#6E488A]/15 rounded-3xl p-8 space-y-8 min-h-[350px] flex flex-col justify-between text-left shadow-md">
                      
                      <div className="space-y-3">
                        <h3 className="font-display font-black text-xl sm:text-2xl text-[#3A185C] leading-snug">
                          {currentQ.text}
                        </h3>
                        {currentQ.subtext && (
                          <p className="text-sm sm:text-base text-[#3A185C]/90 font-sans font-semibold leading-relaxed">
                            {currentQ.subtext}
                          </p>
                        )}
                      </div>

                      {/* Option Rendering by Type */}
                      <div className="space-y-4 py-4 flex-1 flex flex-col justify-center">
                        
                        {/* TYPE: EMOJI */}
                        {currentQ.type === "emoji" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {currentQ.options?.map((opt) => {
                              const selectedResponse = userResponses.find(r => r.questionId === currentQ.id);
                              const isSelected = selectedResponse?.value === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => handleOptionSelect(opt.value, currentQ.category)}
                                  className={`p-4 sm:p-5 rounded-2xl transition-all text-left flex items-center justify-between cursor-pointer group shadow-sm hover:shadow-md border-2 ${
                                    isSelected 
                                      ? "border-[#36C4D8] bg-gradient-to-r from-[#36C4D8]/10 to-[#EDE0F0]/40 ring-2 ring-[#36C4D8]/40" 
                                      : "border-[#6E488A]/12 bg-[#FAF7F9] hover:border-[#36C4D8]/60 hover:bg-[#EDE0F0]/20"
                                  }`}
                                >
                                  <div className="flex items-center space-x-4">
                                    <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-all outline-none animate-fadeIn" role="img">
                                      {opt.emoji}
                                    </span>
                                    <span className="text-xs sm:text-sm text-[#3A185C] font-black">
                                      {opt.label}
                                    </span>
                                  </div>
                                  
                                  {/* High-visibility Selection Radio circle */}
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-2 ${
                                    isSelected 
                                      ? "border-[#36C4D8] bg-[#36C4D8]" 
                                      : "border-[#6E488A]/40 bg-white group-hover:border-[#36C4D8]"
                                  }`}>
                                    <div className={`w-2.5 h-2.5 rounded-full bg-white transition-all ${
                                      isSelected ? "scale-100" : "scale-0"
                                    }`} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* TYPE: SCALE */}
                        {currentQ.type === "scale" && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                              {currentQ.options?.map((opt) => {
                                const selectedResponse = userResponses.find(r => r.questionId === currentQ.id);
                                const isSelected = selectedResponse?.value === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={() => handleOptionSelect(opt.value, currentQ.category)}
                                    className={`h-12 w-full rounded-xl transition-all text-sm sm:text-base font-mono flex items-center justify-center font-black cursor-pointer shadow-sm hover:shadow-md border-2 ${
                                      isSelected 
                                        ? "border-[#36C4D8] bg-[#36C4D8] text-white ring-2 ring-[#36C4D8]/40" 
                                        : "border-[#6E488A]/12 bg-[#FAF7F9] text-[#3A185C] hover:border-[#36C4D8]/60 hover:bg-[#EDE0F0]/30"
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex justify-between items-center text-xs sm:text-sm font-mono text-[#3A185C] font-black">
                              <span className="flex items-center space-x-1.5 bg-[#FAF7F9] px-2.5 py-1 rounded-lg border border-[#6E488A]/12">
                                <ChevronLeft className="w-4 h-4 text-[#E36DB4]" />
                                <span>{currentQ.minLabel || "Mínimo"}</span>
                              </span>
                              <span className="flex items-center space-x-1.5 bg-[#FAF7F9] px-2.5 py-1 rounded-lg border border-[#6E488A]/12">
                                <span>{currentQ.maxLabel || "Máximo"}</span>
                                <ChevronRight className="w-4 h-4 text-[#36C4D8]" />
                              </span>
                            </div>
                          </div>
                        )}

                        {/* TYPE: CARDS */}
                        {currentQ.type === "card" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentQ.options?.map((opt) => {
                              const selectedResponse = userResponses.find(r => r.questionId === currentQ.id);
                              const isSelected = selectedResponse?.value === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => handleOptionSelect(opt.value, currentQ.category)}
                                  className={`p-5 rounded-2xl transition-all text-left flex flex-col justify-between h-40 cursor-pointer group shadow-sm hover:shadow-md border-2 ${
                                    isSelected 
                                      ? "border-[#36C4D8] bg-gradient-to-br from-[#36C4D8]/10 via-[#FAF7F9] to-[#EDE0F0]/40 ring-2 ring-[#36C4D8]/40" 
                                      : "border-[#6E488A]/12 bg-[#FAF7F9] hover:border-[#36C4D8]/60 hover:bg-[#EDE0F0]/20"
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="text-3xl sm:text-4xl group-hover:rotate-6 transition-all">{opt.emoji}</span>
                                    
                                    {/* High-visibility Selection Radio circle */}
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                      isSelected 
                                        ? "border-[#36C4D8] bg-[#36C4D8]" 
                                        : "border-[#6E488A]/40 bg-white group-hover:border-[#36C4D8]"
                                    }`}>
                                      <div className={`w-2.5 h-2.5 rounded-full bg-white transition-all ${
                                        isSelected ? "scale-100" : "scale-0"
                                      }`} />
                                    </div>
                                  </div>
                                  <span className="text-xs sm:text-sm text-[#3A185C] mt-3 font-black leading-relaxed">
                                    {opt.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* TYPE: SCENARIOS (SITUACIONES REALES) */}
                        {currentQ.type === "scenario" && (
                          <div className="space-y-3">
                            {currentQ.options?.map((opt) => {
                              const selectedResponse = userResponses.find(r => r.questionId === currentQ.id);
                              const isSelected = selectedResponse?.value === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => handleOptionSelect(opt.value, currentQ.category)}
                                  className={`w-full p-4 sm:p-5 rounded-2xl transition-all text-left flex items-center justify-between cursor-pointer group shadow-sm hover:shadow-md border-2 ${
                                    isSelected 
                                      ? "border-[#36C4D8] bg-gradient-to-r from-[#36C4D8]/10 to-[#EDE0F0]/40 ring-2 ring-[#36C4D8]/40" 
                                      : "border-[#6E488A]/12 bg-[#FAF7F9] hover:border-[#36C4D8]/60 hover:bg-[#EDE0F0]/20"
                                  }`}
                                >
                                  <div className="flex items-center space-x-4">
                                    <span className={`text-xl sm:text-2xl p-2.5 rounded-xl transition-all ${
                                      isSelected ? "bg-[#36C4D8] text-white" : "bg-[#EDE0F0] text-[#3A185C] group-hover:bg-[#36C4D8]/20"
                                    }`}>{opt.emoji}</span>
                                    <span className="text-xs sm:text-sm text-[#3A185C] leading-relaxed font-black">
                                      {opt.label}
                                    </span>
                                  </div>

                                  {/* High-visibility Selection Radio circle */}
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-2 ${
                                    isSelected 
                                      ? "border-[#36C4D8] bg-[#36C4D8]" 
                                      : "border-[#6E488A]/40 bg-white group-hover:border-[#36C4D8]"
                                  }`}>
                                    <div className={`w-2.5 h-2.5 rounded-full bg-white transition-all ${
                                      isSelected ? "scale-100" : "scale-0"
                                    }`} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* TYPE: MULTIPLE CHOICE */}
                        {currentQ.type === "multiple" && (
                          <div className="space-y-3">
                            {currentQ.options?.map((opt) => {
                              const selectedResponse = userResponses.find(r => r.questionId === currentQ.id);
                              const isSelected = selectedResponse?.value === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => handleOptionSelect(opt.value, currentQ.category)}
                                  className={`w-full p-4 sm:p-5 rounded-2xl transition-all text-left flex items-center justify-between cursor-pointer group shadow-sm hover:shadow-md border-2 ${
                                    isSelected 
                                      ? "border-[#36C4D8] bg-gradient-to-r from-[#36C4D8]/10 to-[#EDE0F0]/40 ring-2 ring-[#36C4D8]/40" 
                                      : "border-[#6E488A]/12 bg-[#FAF7F9] hover:border-[#36C4D8]/60 hover:bg-[#EDE0F0]/20"
                                  }`}
                                >
                                  <span className="text-xs sm:text-sm text-[#3A185C] font-black">
                                    {opt.label}
                                  </span>

                                  {/* High-visibility Selection Radio circle */}
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-2 ${
                                    isSelected 
                                      ? "border-[#36C4D8] bg-[#36C4D8]" 
                                      : "border-[#6E488A]/40 bg-white group-hover:border-[#36C4D8]"
                                  }`}>
                                    <div className={`w-2.5 h-2.5 rounded-full bg-white transition-all ${
                                      isSelected ? "scale-100" : "scale-0"
                                    }`} />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                      </div>

                      {/* Back button and indicators */}
                      <div className="flex items-center justify-between border-t-2 border-[#6E488A]/15 pt-4 text-xs sm:text-sm font-mono text-[#3A185C] font-extrabold">
                        <button
                          onClick={handlePrevQuestion}
                          disabled={currentQuestionIndex === 0}
                          className={`flex items-center space-x-1.5 ${
                            currentQuestionIndex === 0 ? "opacity-35 cursor-not-allowed" : "hover:text-[#E36DB4] cursor-pointer font-black"
                          }`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                          <span>Anterior</span>
                        </button>
                        <span className="font-black bg-[#EDE0F0] px-2.5 py-1 rounded-lg text-[#3A185C] border border-[#6E488A]/15">
                          Día {programProgress.currentDay} / 7 de Autoconocimiento
                        </span>
                      </div>

                    </div>

                    {/* Complete Action Button when ready */}
                    {isEvaluationReady && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="pt-4 text-center"
                      >
                        <button
                          onClick={handleDailyComplete}
                          className="px-10 py-5 rounded-2xl bg-[#36C4D8] hover:bg-[#2DB3C7] text-white font-display font-bold text-lg shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center space-x-3 w-full animate-pulse border-none outline-none"
                        >
                          <span>GUARDAR Y COMPLETAR EL DÍA {programProgress.currentDay} ➔</span>
                          <Sparkles className="w-5 h-5 text-white" />
                        </button>
                      </motion.div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* =========================================================
              PHASE 3 - NEURAL SYSTEM SCANNING & PROGRESS (FASE 7)
              ========================================================= */}
          {phase === "LOADING" && (
            <motion.div
              key="loading_phase"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto py-12 text-center space-y-8"
            >
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center bg-[#EDE0F0]/40 rounded-full border border-[#6E488A]/12 shadow-inner">
                {/* Dual Pulsing Rings */}
                <div className="absolute inset-2 border border-[#E36DB4]/30 rounded-full animate-ping" />
                <div className="absolute inset-8 border border-[#36C4D8]/40 rounded-full animate-pulse" />
                
                {/* Scanning Laser Line */}
                <div className="absolute w-[90%] h-[2px] bg-[#E36DB4] shadow-[0_0_15px_rgba(227,109,180,0.4)] top-4 animate-bounce" style={{ animationDuration: "2s" }} />
                
                <Compass className="w-14 h-14 text-[#E36DB4] animate-spin" style={{ animationDuration: "5s" }} />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-mono tracking-widest text-[#E36DB4] uppercase font-bold animate-pulse">
                  ESTABLECIENDO EVALUACIÓN POR IA
                </p>
                <h3 className="font-display font-semibold text-2xl text-[#6E488A]">
                  Construyendo tu M.A.P.A.™...
                </h3>
                <p className="text-[#56346F]/70 text-sm italic">
                  "Un momento... Calibrando tus factores para extraer el mensaje."
                </p>
              </div>

              {/* Progress visual percent container */}
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-[#EDE0F0] rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[#36C4D8] via-[#E86FA3] to-[#E36DB4] transition-all duration-500 rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-[#56346F]/70">
                  <span>Generando análisis M.A.P.A.™</span>
                  <span className="font-mono font-bold text-[#6E488A]">{loadingProgress}%</span>
                </div>
              </div>

              {/* Reassuring status messages */}
              <div className="bg-[#FAF4FC] border border-[#E36DB4]/25 p-4 rounded-2xl text-left text-[#56346F] space-y-2 shadow-2xs">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#6E488A]">
                  <span className="w-2 h-2 rounded-full bg-[#36C4D8] animate-ping shrink-0" />
                  <span>{loadingStepText || "Sintetizando información del perfil..."}</span>
                </div>
                <div className="text-[11.5px] font-sans text-[#56346F]/80 space-y-1 pl-4 border-l-2 border-[#E36DB4]/30">
                  <p>• Analizando respuestas de los pilares psicológicos M.A.P.A.™</p>
                  <p>• Calibrando tu informe de regulación y bienestar emocional</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              PHASE 4 - REPORT RESULTS HERO & WOW COMPASS (FASE 8-10)
              ========================================================= */}
          {phase === "RESULTS" && evaluationResult && (
            <motion.div
              key="results_phase"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              
              {/* Personalized Congratulations Header */}
              <div className="text-center space-y-2 py-4 border-b border-[#6E488A]/12 pb-6">
                <span className="text-xs font-mono uppercase bg-[#EDE0F0] text-[#E36DB4] border border-[#E36DB4]/20 py-1 px-3.5 rounded-full font-bold">
                  REPORTE DE ORIENTACIÓN M.A.P.A.™
                </span>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#6E488A] tracking-tight">
                  Tu Brújula Emocional, <span className="text-[#36C4D8]">{leadInfo.nombre || "Usuaria"}</span>
                </h1>
                <p className="text-[#56346F]/80 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                  Este informe ha sido procesado de manera única para <strong className="text-[#6E488A]">{leadInfo.nombre}</strong> ({leadInfo.email}). Contiene tu perfil dominante de alerta simpática, tus anclas de descompresión neuro-cognitiva y tu plan de acompañamiento recomendado.
                </p>
              </div>

              {/* FASE 8: MOMENTO WOW - PERFIL PRINCIPAL REDISEÑADO */}
              <div 
                id="results_hero" 
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
              >
                {/* CARD 1: PERFIL PRINCIPAL */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="lg:col-span-2 bg-white border border-[#6E488A]/12 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-[#6E488A]/20 transition-all duration-300 flex flex-col md:flex-row gap-8 items-center text-left"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#36C4D8]/5 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -left-12 -top-12 w-48 h-48 bg-gradient-to-br from-[#E36DB4]/3 to-transparent pointer-events-none" />
                  
                  {/* Giant Avatar with dynamic visual style */}
                  <motion.div 
                    whileHover={{ 
                      scale: 1.08, 
                      filter: "drop-shadow(0 12px 28px rgba(227, 109, 180, 0.45))" 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative group shrink-0 transition-all duration-500 ease-out"
                  >
                    {/* Soft background glow that expands on hover */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#E36DB4] to-[#36C4D8] opacity-20 blur-md group-hover:opacity-40 group-hover:blur-lg transition-all duration-500" />
                    
                    <div 
                      onClick={() => setIsProfileSettingsOpen(true)}
                      className="relative w-40 h-40 md:w-44 md:h-44 rounded-3xl bg-gradient-to-tr from-[#EDE0F0] to-[#FAF7F9] border-2 border-[#E36DB4] flex items-center justify-center text-7xl shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:border-[#36C4D8] hover:shadow-xl active:scale-95 group"
                      title="Configuración de Perfil - Cambiar foto o avatar"
                    >
                      {programProgress.customAvatar?.type === "image" ? (
                        <img 
                          src={programProgress.customAvatar.value} 
                          alt="Avatar de usuario" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span role="img" aria-label={evaluationResult.name} className="animate-pulse">
                          {programProgress.customAvatar?.value || evaluationResult.avatar}
                        </span>
                      )}
                      
                      {/* Hover Edit Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 text-white">
                        <svg className="w-7 h-7 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider">Personalizar</span>
                      </div>
                    </div>
                    
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#36C4D8] text-white font-mono text-[10px] px-3.5 py-1 rounded-full font-bold whitespace-nowrap shadow-sm z-10">
                      PERFIL DOMINANTE
                    </div>
                    
                    {/* Tiny Edit helper trigger badge for mobile devices without hover */}
                    <button 
                      onClick={() => setIsProfileSettingsOpen(true)}
                      className="absolute -top-2 -right-2 bg-white text-[#6E488A] border border-[#6E488A]/20 p-2 rounded-full shadow-md hover:bg-[#EDE0F0] transition-colors md:hidden"
                      aria-label="Configuración de Perfil"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </motion.div>

                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-[#E36DB4] tracking-widest uppercase font-bold">PERFIL EMOCIONAL REVELADO</span>
                      <span className="bg-[#EDE0F0]/50 border border-[#6E488A]/10 text-[#56346F]/70 py-0.5 px-2.5 rounded-full text-[10px] font-mono">ID: {evaluationResult.id}</span>
                      <button
                        onClick={() => setIsProfileSettingsOpen(true)}
                        className="ml-auto bg-[#6E488A]/10 hover:bg-[#6E488A]/20 text-[#6E488A] text-xs font-semibold py-1 px-3 rounded-full border border-[#6E488A]/20 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Configuración de Perfil</span>
                      </button>
                    </div>

                    <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#6E488A] tracking-tight">
                      {evaluationResult.name}
                      <span className="block text-lg font-sans font-normal text-[#56346F]/80 mt-1">{evaluationResult.subTitle}</span>
                    </h2>

                    <p className="text-[#56346F]/85 text-sm leading-relaxed max-w-2xl font-sans">
                      {evaluationResult.description}
                    </p>
                  </div>
                </motion.div>

                {/* CARD 2: NIVEL DE ACTIVACIÓN */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="col-span-1 bg-white border border-[#6E488A]/12 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-[#E36DB4]/20 transition-all duration-300 flex flex-col justify-between text-left"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E36DB4]/3 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-gray-400 tracking-wider uppercase font-bold">Carga de Alerta</span>
                      <div className="w-12 h-12 bg-pink-50 text-[#E36DB4] rounded-2xl flex items-center justify-center animate-pulse shadow-sm">
                        <Activity className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-5xl font-black text-[#E36DB4] font-display tracking-tight flex items-baseline">
                        {evaluationResult.activationLevel}
                        <span className="text-2xl text-[#E36DB4]/80 ml-0.5">%</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-[#EDE0F0] text-[#E36DB4] font-bold py-0.5 px-2 rounded-md">
                        {evaluationResult.activationLevel > 75 ? "🔴 Alerta Sostenida" : "💛 Alerta Moderada"}
                      </span>
                    </div>

                    <p className="text-xs text-[#56346F]/75 leading-relaxed font-sans">
                      Indica que tu sistema nervioso autónomo opera actualmente bajo una carga simpática sostenida que requiere descompresión guiada.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="w-full bg-[#EDE0F0] h-3 rounded-full overflow-hidden border border-[#6E488A]/12">
                      <div 
                        className="bg-gradient-to-r from-[#36C4D8] via-[#E36DB4] to-[#6E488A] h-full rounded-full transition-all duration-1000"
                        style={{ width: `${evaluationResult.activationLevel}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-[#56346F]/50 font-mono leading-tight">
                      Desciende progresivamente hacia la Calma Vagal realizando tu Ruta diaria.
                    </p>
                  </div>
                </motion.div>

                {/* CARD 3: ESPACIO DEDICADO A RECOMENDACIONES DE LA IA */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="col-span-1 lg:col-span-3 bg-gradient-to-br from-[#FAF7F9] via-white to-[#EDE0F0]/50 border-2 border-[#E36DB4]/25 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-[#E36DB4]/40 transition-all duration-300 text-left"
                >
                  {/* Decorative glowing gradient elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#36C4D8]/8 via-[#E36DB4]/5 to-transparent pointer-events-none blur-3xl" />
                  <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-gradient-to-tr from-[#6E488A]/5 via-transparent to-transparent pointer-events-none blur-2xl" />

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-[#6E488A]/12 pb-6 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-tr from-[#E36DB4] to-[#6E488A] text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-center shrink-0 animate-pulse">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase text-[#E36DB4] tracking-widest block">RECOMENDACIONES DE LA IA</span>
                      <h3 className="font-display font-bold text-2xl text-[#6E488A] tracking-tight">Lectura Psicológica & Plan Personalizado</h3>
                    </div>
                  </div>

                  {/* Psychological Insight Quotation Block */}
                  <div className="bg-[#6E488A]/5 p-6 rounded-2xl border-l-4 border-l-[#36C4D8] border border-[#6E488A]/5 my-6 text-sm italic text-[#56346F]/90 relative z-10 shadow-sm">
                    <span className="absolute -top-4 -left-1 text-6xl font-serif text-[#36C4D8] opacity-35 select-none">“</span>
                    <p className="relative z-10 leading-relaxed font-sans">{evaluationResult.psychologicalInsight}</p>
                  </div>

                  {/* Dynamic Actionable AI Recommendations Cards Grid */}
                  <div className="space-y-4 relative z-10">
                    <h4 className="text-xs font-mono font-extrabold uppercase text-[#6E488A] tracking-wider block mb-3">
                      🎯 ACCIONES DE CORRECCIÓN NEURO-COGNITIVA
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {getAiRecommendationsForArchetype(evaluationResult.id).map((rec) => (
                        <div 
                          key={rec.id} 
                          className="bg-white/80 backdrop-blur-sm border border-[#6E488A]/10 hover:border-[#E36DB4]/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-default"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="bg-[#EDE0F0] text-[#6E488A] text-[9px] font-mono font-black tracking-wider uppercase px-2.5 py-1 rounded-md">
                                {rec.badge}
                              </span>
                              <div className="text-[#36C4D8] group-hover:text-[#E36DB4] group-hover:scale-110 transition-all duration-300">
                                {renderRecommendationIcon(rec.icon, "w-8 h-8")}
                              </div>
                            </div>
                            <h5 className="font-display font-bold text-sm text-[#6E488A] leading-snug group-hover:text-[#E36DB4] transition-colors">
                              {rec.title}
                            </h5>
                          </div>
                          <p className="text-xs text-[#56346F]/80 leading-relaxed font-sans">
                            {rec.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* CARD 4: EVOLUCIÓN DE NIVEL DE ACTIVACIÓN (7 DÍAS) */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="col-span-1 lg:col-span-3 bg-white border border-[#6E488A]/12 rounded-3xl p-6 md:p-8 space-y-5 shadow-xl hover:shadow-2xl hover:border-[#6E488A]/15 transition-all duration-300 text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#6E488A]/5 p-4 rounded-2xl border border-[#6E488A]/10">
                    <div className="max-w-md">
                      <h3 className="font-display font-bold text-lg text-[#6E488A]">
                        Evolución del Nivel de Activación (7 Días)
                      </h3>
                      <p className="text-xs text-[#56346F]/70">
                        Comparativa diaria de tu estado de alerta simpática y regulación emocional durante el programa. Haz clic en la leyenda para ocultar o mostrar datos.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setShowActivationData(!showActivationData)}
                        className={`transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-left ${
                          showActivationData 
                            ? "bg-[#E36DB4]/10 border-[#E36DB4]/30 text-[#E36DB4] font-semibold shadow-sm" 
                            : "bg-gray-200/50 border-gray-300/40 text-gray-400 line-through"
                        }`}
                        title="Alternar visibilidad del Nivel de Activación"
                      >
                        <span className={`w-2.5 h-2.5 rounded-sm inline-block shrink-0 ${showActivationData ? "bg-[#E36DB4]" : "bg-gray-300"}`} />
                        <span>Activación (%)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowHealthyLimit(!showHealthyLimit)}
                        className={`transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-left ${
                          showHealthyLimit 
                            ? "bg-[#36C4D8]/10 border-[#36C4D8]/30 text-[#36C4D8] font-semibold shadow-sm" 
                            : "bg-gray-200/50 border-gray-300/40 text-gray-400 line-through"
                        }`}
                        title="Alternar visibilidad del Límite Saludable"
                      >
                        <span className={`w-3.5 h-0.5 inline-block shrink-0 border-t-2 border-dashed ${showHealthyLimit ? "border-[#36C4D8]" : "border-gray-300"}`} />
                        <span>Límite Saludable (45%)</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={get7DayActivationData()}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#6E488A" strokeOpacity={0.1} vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: "#56346F", fontSize: 11, fontWeight: 500 }}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: "#56346F", fontSize: 11 }}
                        />
                        <Tooltip 
                          cursor={{ fill: "rgba(110, 72, 138, 0.04)" }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length && showActivationData) {
                              const val = payload[0].value as number;
                              
                              let statusTitle = "";
                              let adviceTip = "";
                              let colorClass = "";
                              
                              if (val > 70) {
                                statusTitle = "⚠️ Activación Alta";
                                adviceTip = "Consejo: Practica la respiración prolongando la exhalación (p. ej., inhala en 4 tiempos y exhala en 8) para enviar señales de seguridad a tu cerebro.";
                                colorClass = "text-[#E36DB4]";
                              } else if (val > 45) {
                                statusTitle = "⚖️ Alerta Moderada";
                                adviceTip = "Consejo: Realiza un escaneo corporal rápido de 1 minuto para relajar hombros y mandíbula, manteniendo un ritmo constante.";
                                colorClass = "text-[#6E488A]";
                              } else {
                                statusTitle = "✅ Regulación Vagal";
                                adviceTip = "Consejo: Dedica unos segundos a registrar esta sensación de seguridad en tu memoria corporal para acceder a ella más tarde.";
                                colorClass = "text-[#36C4D8]";
                              }

                              const randomMessage = getMotivationalMessageForDay(payload[0].payload.name);

                              return (
                                <div className="bg-white border border-[#6E488A]/15 p-4 rounded-xl shadow-xl max-w-xs text-xs space-y-3">
                                  <div className="flex items-center justify-between gap-2 border-b border-[#6E488A]/10 pb-1.5">
                                    <p className="font-bold text-[#6E488A]">{payload[0].payload.name}</p>
                                    <span className={`font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#6E488A]/5 ${colorClass}`}>
                                      {statusTitle}
                                    </span>
                                  </div>
                                  <div className="bg-[#6E488A]/5 p-2.5 rounded-lg border border-[#6E488A]/10">
                                    <p className="text-[10px] font-semibold text-[#6E488A] uppercase tracking-wider mb-1 flex items-center gap-1">
                                      <span>✨ Mensaje de Regulación</span>
                                    </p>
                                    <p className="text-[#56346F] font-semibold leading-relaxed">
                                      "{randomMessage}"
                                    </p>
                                  </div>
                                  <p className="text-[#56346F]/80 text-[11px] leading-relaxed">
                                    {adviceTip}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {showHealthyLimit && (
                          <ReferenceLine 
                            y={45} 
                            stroke="#36C4D8" 
                            strokeDasharray="4 4" 
                            strokeWidth={1.5}
                          />
                        )}
                        <Bar 
                          dataKey="Nivel de Activación" 
                          radius={[6, 6, 0, 0]}
                          maxBarSize={32}
                          hide={!showActivationData}
                        >
                          {get7DayActivationData().map((entry, index) => {
                            const val = entry["Nivel de Activación"];
                            const fill = val > 70 
                              ? "#E36DB4" 
                              : val > 45 
                                ? "#6E488A" 
                                : "#36C4D8"; 
                            return <Cell key={`cell-${index}`} fill={fill} fillOpacity={0.85} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="text-[10px] text-center text-[#56346F]/50 font-mono leading-relaxed max-w-xl mx-auto">
                    💡 El gráfico muestra cómo tu sistema autónomo responde a las técnicas de descompresión neurocognitiva del programa M.A.P.A.™. Un descenso progresivo hacia el Límite Saludable (45%) refleja una exitosa transición de alerta a calma vagal.
                  </p>
                </motion.div>
              </div>

              {/* FASE 9: PREMIUM DASHBOARD WITH CUSTOM RADAR & PILLARS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                
                {/* Secondary Profiles & Radars Left Panel (Col span 5) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Custom SVG Compass Radar graph that is robust & highly stylized */}
                  <div className="bg-white border border-[#6E488A]/12 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#6E488A]/12 pb-3">
                      <h4 className="text-xs font-mono text-[#E36DB4] uppercase tracking-wider font-semibold">Brújula de Tensión Cerebral</h4>
                      <Compass className="w-4 h-4 text-[#E36DB4]" />
                    </div>

                    {/* CUSTOM RADAR SVG MAPA GENERATED IN REALTIME */}
                    <div className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center">
                      
                      {/* Animated radar sonar wave */}
                      <div className="absolute inset-2 border border-dashed border-[#6E488A]/10 rounded-full animate-spin" style={{ animationDuration: "120s" }} />
                      <div className="absolute inset-10 border border-double border-[#6E488A]/10 rounded-full" />
                      
                      {/* Draw radar axis coordinates in pure responsive SVG */}
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Background rings */}
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#6E488A" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="1 3" />
                        <circle cx="50" cy="50" r="30" fill="none" stroke="#6E488A" strokeWidth="0.5" strokeOpacity="0.12" />
                        <circle cx="50" cy="50" r="15" fill="none" stroke="#6E488A" strokeWidth="0.5" strokeOpacity="0.12" />

                        {/* Axes lines */}
                        <line x1="50" y1="5" x2="50" y2="95" stroke="#6E488A" strokeWidth="0.3" strokeOpacity="0.15" />
                        <line x1="5" y1="50" x2="95" y2="50" stroke="#6E488A" strokeWidth="0.3" strokeOpacity="0.15" />

                        {/* Outer polygon of user metrics */}
                        {/* Calculate coordinates dynamically based on actual scores */}
                        {(() => {
                          const getCoordinates = (index: number, val: number) => {
                            const angle = (index * 2 * Math.PI) / 5;
                            const r = (val * 40) / 100; // max length 40
                            const x = 50 + r * Math.cos(angle);
                            const y = 50 + r * Math.sin(angle);
                            return { x, y };
                          };

                          const p1 = getCoordinates(0, evaluationResult.radarData[0]?.A || 80);
                          const p2 = getCoordinates(1, evaluationResult.radarData[1]?.A || 70);
                          const p3 = getCoordinates(2, evaluationResult.radarData[2]?.A || 85);
                          const p4 = getCoordinates(3, evaluationResult.radarData[3]?.A || 50);
                          const p5 = getCoordinates(4, evaluationResult.radarData[4]?.A || 60);

                          const pointsStr = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y} ${p5.x},${p5.y}`;

                          return (
                            <>
                              <polygon 
                                points={pointsStr} 
                                fill="rgba(54, 196, 216, 0.12)" 
                                stroke="#36C4D8" 
                                strokeWidth="1" 
                              />
                              {/* Draw dots with glowing accent */}
                              <circle cx={p1.x} cy={p1.y} r="1.5" fill="#36C4D8" />
                              <circle cx={p2.x} cy={p2.y} r="1.5" fill="#36C4D8" />
                              <circle cx={p3.x} cy={p3.y} r="1.5" fill="#36C4D8" />
                              <circle cx={p4.x} cy={p4.y} r="1.5" fill="#36C4D8" />
                              <circle cx={p5.x} cy={p5.y} r="1.5" fill="#36C4D8" />
                            </>
                          );
                        })()}
                      </svg>

                      {/* Direction labels around radar */}
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#56346F]/60 font-semibold">Activación</span>
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#56346F]/60 font-semibold">Desgaste</span>
                      <span className="absolute top-1/2 -right-4 -translate-y-1/2 text-[9px] font-mono text-[#56346F]/60 font-semibold rotate-90">Patrones</span>
                      <span className="absolute top-1/2 -left-4 -translate-y-1/2 text-[9px] font-mono text-[#56346F]/60 font-semibold -rotate-90">Híper-Voz</span>
                    </div>

                    <p className="text-[10px] text-[#56346F]/50 font-mono text-center">
                      El polígono azul claro grafica tu huella ansiosa actual frente a la media saludable (círculo interior).
                    </p>
                  </div>

                  {/* Secondary Traits */}
                  <div className="bg-white border border-[#6E488A]/12 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h4 className="text-xs font-mono text-[#56346F]/60 uppercase tracking-wider font-semibold">Tensiones Co-existentes</h4>
                    <div className="space-y-3">
                      {evaluationResult.secondaryProfiles.map((p, idx) => (
                        <div key={p.name} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#56346F]/85 font-medium">{p.name}</span>
                            <span className="text-[#56346F]/60">{p.percentage}% de coincidencia</span>
                          </div>
                          <div className="w-full bg-[#EDE0F0] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#36C4D8] h-full rounded-full" 
                              style={{ width: `${p.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Indicators Detail - Right Panel (Col span 7) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* DETONANTES CARD */}
                  <div className="bg-white border border-[#6E488A]/12 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-display font-semibold text-lg text-[#6E488A] flex items-center space-x-2">
                      <span className="bg-[#EDE0F0] p-1.5 rounded-lg text-[#E36DB4]">⚠️</span>
                      <span>Principales Detonantes de Alerta</span>
                    </h3>
                    <ul className="space-y-3">
                      {evaluationResult.indicators.detonantes.map((d, index) => (
                        <li key={index} className="flex items-start space-x-3 text-sm">
                          <span className="text-[#E36DB4] mt-0.5 font-bold font-mono">0{index + 1}.</span>
                          <span className="text-[#56346F]/80 leading-relaxed">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* PATRONES DOMINANTES CARD */}
                  <div className="bg-white border border-[#6E488A]/12 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-display font-semibold text-lg text-[#6E488A] flex items-center space-x-2">
                      <span className="bg-[#EDE0F0] p-1.5 rounded-lg text-[#E36DB4]">🧠</span>
                      <span>Patrones Mentales Dominantes</span>
                    </h3>
                    <ul className="space-y-3">
                      {evaluationResult.indicators.patrones.map((pText, index) => (
                        <li key={index} className="flex items-start space-x-3 text-sm">
                          <span className="text-[#E36DB4] mt-0.5 font-bold font-mono">0{index + 1}.</span>
                          <span className="text-[#56346F]/80 leading-relaxed">{pText}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* FACTORES DE PROTECCIÓN */}
                  <div className="bg-white border border-[#6E488A]/12 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-display font-semibold text-lg text-[#6E488A] flex items-center space-x-2">
                      <span className="bg-emerald-50 p-1.5 rounded-lg text-emerald-600">🛡️</span>
                      <span>Tus Factores Activos de Protección</span>
                    </h3>
                    <ul className="space-y-3">
                      {evaluationResult.indicators.proteccion.map((pExt, index) => (
                        <li key={index} className="flex items-start space-x-3 text-sm">
                          <span className="text-emerald-600 mt-0.5 font-bold font-mono">0{index + 1}.</span>
                          <span className="text-[#56346F]/80 leading-relaxed">{pExt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </div>

              {/* FASE 10: RUTA DE TRANQUILIDAD - INTERACTIVE TIMELINE */}
              <section id="tranquility_route" className="space-y-6 text-left">
                <div className="text-center space-y-2">
                  <span className="text-[#E36DB4] font-mono text-xs uppercase tracking-wider block font-bold">LA RUTA DE TRANQUILIDAD</span>
                  <h3 className="font-display font-semibold text-2xl text-[#6E488A]">Tu Plan para Desactivar la Alerta</h3>
                  <p className="text-sm text-[#56346F]/80 max-w-md mx-auto">Te sugerimos un plan táctico de 3 pasos para regular tu amígdala gradualmente desde hoy.</p>
                </div>

                <div className="bg-white border border-[#6E488A]/12 rounded-3xl p-8 relative shadow-sm">
                  
                  {/* Connective lineage line */}
                  <div className="absolute top-[80px] bottom-[80px] left-12 md:left-1/2 w-[2px] bg-gradient-to-b from-[#36C4D8] via-[#E36DB4] to-[#6E488A] -translate-x-1/2 hidden sm:block z-0" />

                  <div className="space-y-12 relative z-10">
                    
                    {/* ACCIONES INMEDIATAS */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start relative">
                      <div className="md:col-span-2 flex justify-start md:justify-center">
                        <div className="w-12 h-12 rounded-xl bg-[#EDE0F0] border border-[#36C4D8] flex items-center justify-center font-mono font-bold text-[#36C4D8] shadow-sm">
                          1
                        </div>
                      </div>
                      <div className="md:col-span-10 space-y-2 bg-[#FAF7F9] p-6 rounded-2xl border border-[#6E488A]/12">
                        <span className="text-[9px] font-mono uppercase bg-[#36C4D8]/10 text-[#36C4D8] py-0.5 px-2.5 rounded-full font-bold">ACCIONES INMEDIATAS</span>
                        <h4 className="text-base font-display font-semibold text-[#6E488A]">Prácticas inmediatas para momentos de crisis</h4>
                        <div className="space-y-2 pt-2">
                          {evaluationResult.tranquilityRoute.acciones.slice(0, 3).map((a, idx) => (
                            <div key={idx} className="flex items-start space-x-2 text-xs text-[#56346F]/85 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-[#36C4D8] shrink-0 mt-0.5" />
                              <span>{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* HÁBITOS RECOMENDADOS */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start relative">
                      <div className="md:col-span-2 flex justify-start md:justify-center">
                        <div className="w-12 h-12 rounded-xl bg-[#EDE0F0] border border-[#E36DB4] flex items-center justify-center font-mono font-bold text-[#E36DB4] shadow-sm">
                          2
                        </div>
                      </div>
                      <div className="md:col-span-10 space-y-2 bg-[#FAF7F9] p-6 rounded-2xl border border-[#6E488A]/12">
                        <span className="text-[9px] font-mono uppercase bg-[#EDE0F0] text-[#E36DB4] py-0.5 px-2.5 rounded-full font-bold">HÁBITOS DE REGULACIÓN</span>
                        <h4 className="text-base font-display font-semibold text-[#6E488A]">Anclas diarias para reprogramar tu sistema nervioso</h4>
                        <div className="space-y-2 pt-2">
                          {evaluationResult.tranquilityRoute.habitos.slice(0, 3).map((h, idx) => (
                            <div key={idx} className="flex items-start space-x-2 text-xs text-[#56346F]/85 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-[#E36DB4] shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* FACTORES A OBSERVAR */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start relative">
                      <div className="md:col-span-2 flex justify-start md:justify-center">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-500 flex items-center justify-center font-mono font-bold text-emerald-600 shadow-sm">
                          3
                        </div>
                      </div>
                      <div className="md:col-span-10 space-y-2 bg-[#FAF7F9] p-6 rounded-2xl border border-[#6E488A]/12">
                        <span className="text-[9px] font-mono uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 py-0.5 px-2.5 rounded-full font-bold">MONITOREO DE ALARMAS</span>
                        <h4 className="text-base font-display font-semibold text-[#6E488A]">Señales débiles que debes empezar a calibrar</h4>
                        <div className="space-y-2 pt-2">
                          {evaluationResult.tranquilityRoute.observar.slice(0, 3).map((o, idx) => (
                            <div key={idx} className="flex items-start space-x-2 text-xs text-[#56346F]/85 leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{o}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* FASE 11: GENERATE POSTER CARD & COMPARTIR */}
              <section id="share_card_zone" className="space-y-6 text-left border-t border-[#6E488A]/12 pt-12">
                <div className="text-center space-y-2">
                  <h3 className="font-display font-semibold text-2xl text-[#6E488A]">Comparte tu Brújula M.A.P.A.™</h3>
                  <p className="text-sm text-[#56346F]/80 max-w-md mx-auto">Invita a otros a comprender su sistema de alerta. Presiona los botones rápidos para compartir o copiar tu ficha de autodescubrimiento.</p>
                </div>

                {/* Esthetic generated sharing card layout representation */}
                <div className="max-w-md mx-auto bg-white border-2 border-dashed border-[#E36DB4]/55 p-8 rounded-3xl text-center space-y-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-2 right-4 text-[7px] font-mono text-[#56346F]/50 uppercase tracking-widest font-semibold">MAPA OFICIAL DE AUTODESCUBRIMIENTO</div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-[#EDE0F0] border border-[#36C4D8] flex items-center justify-center text-4xl shadow-sm overflow-hidden">
                      {programProgress.customAvatar?.type === "image" ? (
                        <img 
                          src={programProgress.customAvatar.value} 
                          alt="Avatar de usuario" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>
                          {programProgress.customAvatar?.value || evaluationResult.avatar}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xl text-[#6E488A]">Mi Perfil M.A.P.A.™ es:</h4>
                      <h3 className="text-2xl font-display font-extrabold text-[#36C4D8] uppercase tracking-wide">
                        {evaluationResult.name}
                      </h3>
                      <p className="text-[11px] font-mono text-[#56346F]/60 mt-1 uppercase font-semibold">"{evaluationResult.subTitle}"</p>
                    </div>
                  </div>

                  {/* Micro comparison stat */}
                  <div className="bg-[#FAF7F9] py-3 px-4 rounded-xl border border-[#6E488A]/12 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#56346F]/60">Tensión Corporal:</span>
                    <span className="text-[#36C4D8] font-bold">{evaluationResult.activationLevel}% Alerta</span>
                  </div>

                  <div className="text-xs text-[#56346F]/85 italic px-2">
                    "La ansiedad no es mi enemiga. Es un mensajero que hoy empiezo a descodificar."
                  </div>

                  {/* Aesthetic watermarks */}
                  <div className="pt-2 border-t border-[#6E488A]/12 flex items-center justify-between text-[10px] font-mono text-[#56346F]/50">
                    <span>M.A.P.A.™ AI COGNITIVE</span>
                    <span>HTTPS://M-A-P-A.ES</span>
                  </div>
                </div>

                {/* Share interaction buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button 
                    onClick={() => handleShareClick("whatsapp")}
                    className="bg-[#25D366] text-black hover:scale-105 active:scale-95 transition-all text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 cursor-pointer shadow-lg shadow-green-500/10"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => handleShareClick("facebook")}
                    className="bg-[#1877F2] text-white hover:scale-105 active:scale-95 transition-all text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                    <span>Facebook</span>
                  </button>
                  <button 
                    onClick={() => handleShareClick("linkedin")}
                    className="bg-[#0A66C2] text-white hover:scale-105 active:scale-95 transition-all text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 cursor-pointer shadow-lg shadow-indigo-500/10"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </button>
                  <button 
                    onClick={() => handleShareClick("clipboard")}
                    className="bg-[#FAF7F9] text-[#56346F]/80 hover:text-[#56346F] border border-[#6E488A]/15 hover:scale-105 active:scale-95 transition-all text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center space-x-2 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copiar Tarjeta</span>
                  </button>
                </div>

                {shareAlert && (
                  <div className="max-w-xs mx-auto text-center text-xs font-mono text-emerald-600 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-200">
                    {shareAlert}
                  </div>
                )}
              </section>

              {/* FASE 12: CAPTURA DE LEAD PARA INFORME COMPLETO (Dual WhatsApp / Email) */}
              {!leadCaptured ? (
                <section id="lead_capture" className="bg-white border-3 border-[#36C4D8] p-8 rounded-3xl max-w-xl mx-auto text-left space-y-6 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#36C4D8]/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-2 bg-[#36C4D8]/20 text-[#127280] py-1 px-3 rounded-full text-xs font-mono uppercase tracking-wider font-black border border-[#36C4D8]/40">
                      <Lock className="w-3.5 h-3.5 animate-pulse" />
                      <span>Reporte Técnico y Clínico Avanzado</span>
                    </div>
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1C0630] tracking-tight">
                      Desbloquea tus 49 Marcadores Biológicos
                    </h3>
                    <p className="text-[#1C0630] text-sm sm:text-base leading-relaxed font-bold">
                      Clara Luz • Mentora M.A.P.A.™ Mujer ha compilado tu informe completo de 12 páginas con tus anclas cerebrales, análisis cognitivo-conductual de reactividad y el plan definitivo de descompresión simpática. Elige tu canal preferido para recibirlo de inmediato: <span className="text-[#E86FA3] font-black">Los datos se solicitan con el único fin de trazabilidad, guardar tu progreso y enviar tus informes personalizados. Si lo prefieres, puedes usar un nombre simbólico para proteger al máximo tu privacidad y total discreción.</span>
                    </p>
                  </div>

                  {isSendingEmail ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-14 h-14 border-4 border-[#36C4D8] border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-base font-black text-[#1C0630]">Compilando y firmando tu expediente clínico...</p>
                        <p className="text-sm text-[#27A1B2] font-mono font-bold animate-pulse">{emailSendingStep}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="nombre" className="block text-xs font-mono text-[#1C0630] uppercase font-black">¿Cómo quieres que te llamemos?</label>
                          <input 
                            type="text" 
                            id="nombre"
                            required
                            placeholder="Ej. Valentina (puedes usar un nombre simbólico)"
                            value={leadInfo.nombre}
                            onChange={(e)=>setLeadInfo(prev=>({...prev, nombre: e.target.value}))}
                            className="w-full bg-[#FAF7F9] border-2 border-[#6E488A]/25 focus:border-[#36C4D8] focus:bg-white placeholder:text-[#1C0630]/50 rounded-xl p-3.5 text-sm outline-none text-[#1C0630] font-bold transition-all font-sans"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label htmlFor="email" className="block text-xs font-mono text-[#1C0630] uppercase font-black">Correo Electrónico</label>
                          <input 
                            type="email" 
                            id="email"
                            required
                            placeholder="Ej. sofia@gmail.com"
                            value={leadInfo.email}
                            onChange={(e)=>setLeadInfo(prev=>({...prev, email: e.target.value}))}
                            className="w-full bg-[#FAF7F9] border-2 border-[#6E488A]/25 focus:border-[#36C4D8] focus:bg-white placeholder:text-[#1C0630]/50 rounded-xl p-3.5 text-sm outline-none text-[#1C0630] font-bold transition-all font-sans"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="confirmEmail" className="block text-xs font-mono text-[#1C0630] uppercase font-black">Confirmar Correo</label>
                          <input 
                            type="email" 
                            id="confirmEmail"
                            required
                            placeholder="Ej. sofia@gmail.com"
                            value={confirmEmail}
                            onChange={(e)=>setConfirmEmail(e.target.value)}
                            className="w-full bg-[#FAF7F9] border-2 border-[#6E488A]/25 focus:border-[#36C4D8] focus:bg-white placeholder:text-[#1C0630]/50 rounded-xl p-3.5 text-sm outline-none text-[#1C0630] font-bold transition-all font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono text-[#1C0630] uppercase font-black">Número de WhatsApp</label>
                          <div className="flex space-x-1.5">
                            <select
                              value={whatsappCountryCode}
                              onChange={(e)=>setWhatsappCountryCode(e.target.value)}
                              className="bg-[#FAF7F9] border-2 border-[#6E488A]/25 rounded-xl text-xs p-2 text-[#1C0630] font-bold focus:border-[#36C4D8] outline-none"
                            >
                              <option value="+34">🇪🇸 +34</option>
                              <option value="+52">🇲🇽 +52</option>
                              <option value="+57">🇨🇴 +57</option>
                              <option value="+54">🇦🇷 +54</option>
                              <option value="+56">🇨🇱 +56</option>
                              <option value="+51">🇵🇪 +51</option>
                              <option value="+1">🇺🇸 +1</option>
                              <option value="+58">🇻🇪 +58</option>
                              <option value="+593">🇪🇨 +593</option>
                              <option value="+506">🇨🇷 +506</option>
                              <option value="+502">🇬🇹 +502</option>
                            </select>
                            <input 
                              type="tel" 
                              placeholder="612345678"
                              value={whatsappNumber}
                              onChange={(e)=>setWhatsappNumber(e.target.value)}
                              className="w-full bg-[#FAF7F9] border-2 border-[#6E488A]/25 focus:border-[#36C4D8] focus:bg-white placeholder:text-[#1C0630]/50 rounded-xl p-3.5 text-sm outline-none text-[#1C0630] font-bold transition-all font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Remitente Info Box */}
                      <div className="bg-[#36C4D8]/10 border border-[#36C4D8]/30 p-4 rounded-2xl text-xs space-y-1">
                        <div className="flex items-center space-x-2 text-[#127280] font-black text-sm">
                          <Mail className="w-4 h-4 text-[#36C4D8] shrink-0" />
                          <span>Remisión y Seguridad Garantizada:</span>
                        </div>
                        <p className="text-[#1C0630] pl-6 leading-relaxed font-bold">
                          Recibirás el PDF remitido directamente de <strong className="text-[#27A1B2] font-mono select-all font-extrabold">mapa@podermentalia.club</strong> o vía nuestro canal oficial verificado de WhatsApp.
                        </p>
                      </div>

                      {/* Dual-Channel Submit Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        <button
                          type="button"
                          onClick={() => handleDualLeadSubmit("whatsapp")}
                          className="w-full py-4 rounded-xl font-display font-black tracking-wider bg-emerald-600 hover:bg-emerald-700 transition-all text-white cursor-pointer text-center text-xs shadow-md border border-emerald-500 inline-flex items-center justify-center space-x-2"
                        >
                          <Smartphone className="w-4 h-4 shrink-0 text-white" />
                          <span>ENVIAR REPORTE VÍA WHATSAPP</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDualLeadSubmit("email")}
                          className="w-full py-4 rounded-xl font-display font-black tracking-wider bg-gradient-to-r from-[#36C4D8] to-[#E36DB4] hover:opacity-95 transition-all text-white cursor-pointer text-center text-xs shadow-md border border-[#36C4D8]/30 inline-flex items-center justify-center space-x-2"
                        >
                          <Mail className="w-4 h-4 shrink-0 text-white" />
                          <span>ENVIAR REPORTE VÍA EMAIL</span>
                        </button>
                      </div>
                      
                      <p className="text-[10px] text-[#1C0630]/70 font-mono text-center font-bold">
                        🔒 Tratamiento de datos bajo secreto profesional. Nunca compartimos tu información personal.
                      </p>
                    </div>
                  )}
                </section>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl max-w-xl mx-auto text-left space-y-5 shadow-sm"
                >
                  <div className="flex items-center space-x-3 text-emerald-700">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <h4 className="font-display font-semibold text-lg">¡Dossier M.A.P.A.™ Enviado con Éxito!</h4>
                  </div>
                  <div className="text-xs text-[#56346F]/85 space-y-2 leading-relaxed">
                    <p>
                      Muchas gracias <strong className="text-[#6E488A]">{leadInfo.nombre}</strong>. Hemos calibrado y compilado tu informe personalizado de 12 páginas.
                    </p>
                    <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl space-y-1 text-[11px]">
                      <div>✓ <strong>Remitente Oficial:</strong> <span className="text-emerald-700 font-mono font-semibold">mapa@podermentalia.club</span></div>
                      <div>✓ <strong>Destinatario:</strong> <span className="text-[#6E488A] font-mono">{leadInfo.email}</span></div>
                      <div className="text-[#56346F]/50 mt-1">Sugerencia: Revisa tu carpeta de correos no deseados o Spam si no aparece en tu buzón principal en 5 minutos.</div>
                    </div>
                  </div>
                  <div className="pt-1 flex flex-wrap gap-3">
                    <button 
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 rounded-lg text-xs font-semibold hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Reporte PDF de Inmediato</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* FASE 13: PREMIUM OFFERING, COMUNIDAD & ACOMPAÑAMIENTO */}
              <section id="premium_offer_zone" className="bg-white border border-[#6E488A]/12 rounded-3xl p-8 md:p-12 text-left space-y-8 relative overflow-hidden shadow-md">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#36C4D8]/5 blur-3xl pointer-events-none" />
                
                <div className="text-center space-y-2 max-w-xl mx-auto">
                  <span className="text-xs font-mono uppercase bg-[#EDE0F0] text-[#E36DB4] py-1 px-3 rounded-full font-bold border border-[#E36DB4]/15">ACOMPAÑAMIENTO INTEGRATIVO</span>
                  <h3 className="font-display font-semibold text-3xl text-[#6E488A]">¿Quieres dar el paso definitivo de desactivación?</h3>
                  <p className="text-sm text-[#56346F]/65">Te invitamos a formar parte de nuestro programa premium guiado por facilitadores psicológicos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  
                  {/* Option 1: Comunidad Secreta */}
                  <div className="bg-[#FAF7F9] border border-[#6E488A]/12 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE0F0] flex items-center justify-center text-[#36C4D8]">
                      <Users className="w-5 h-5" />
                    </div>
                    <h4 className="font-display font-semibold text-base text-[#6E488A]">Comunidad M.A.P.A.™</h4>
                    <p className="text-xs text-[#56346F]/65 leading-relaxed">
                      Súmate a nuestro grupo interactivo de descompresión donde compartimos retos diarios y foros de debate libres de tabús.
                    </p>
                    <span className="block text-xs font-mono text-emerald-600 font-bold">Invitación Gratuita Inc.</span>
                  </div>

                  {/* Option 2: Programa de Mentores */}
                  <div className="bg-[#FAF7F9] border border-[#6E488A]/12 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE0F0] flex items-center justify-center text-[#36C4D8]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="font-display font-semibold text-base text-[#6E488A]">Masterclass del Alivio</h4>
                    <p className="text-xs text-[#56346F]/65 leading-relaxed">
                      8 módulos en vídeo de alta definición que recorren la des-mecanización del sobrepensamiento y liberación de la angustia muscular.
                    </p>
                    <span className="block text-xs font-mono text-[#36C4D8] font-bold">Descuento del 50% hoy</span>
                  </div>

                  {/* Option 3: Sesiones 1-on-1 */}
                  <div className="bg-[#FAF7F9] border border-[#6E488A]/12 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="font-display font-semibold text-base text-[#6E488A]">Acompañamiento Individual</h4>
                    <p className="text-xs text-[#56346F]/65 leading-relaxed">
                      Sesión de diagnóstico uno-a-uno de 45 minutos para estructurar tu bitácora de protección personalizada con un terapeuta cualificado.
                    </p>
                    <span className="block text-xs font-mono text-[#E36DB4] font-bold">Cupos limitados esta semana</span>
                  </div>

                </div>

                <div className="pt-6 border-t border-[#6E488A]/12 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[11px] font-mono uppercase text-[#56346F]/50 font-bold">¿Estás lista para soltar el sobrepensamiento?</span>
                    <p className="text-xs text-[#56346F]/80 font-sans font-medium">Usa el código temporal <strong className="text-emerald-600 font-semibold">SOYLIBRE50</strong> para iniciar tu programa guiado personalizado.</p>
                  </div>
                  <div>
                    <a
                      href={`https://wa.me/573005149055?text=${encodeURIComponent("😀 ¡Hola! He completado mi proceso de 7 días en M.A.P.A. Mujer y deseo continuar con el proceso completo en M.A.P.A.™ Care Ecosistema Clínico de Contención Femenina.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-display font-bold tracking-wider text-white bg-gradient-to-r from-[#36C4D8] to-emerald-500 hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs uppercase inline-flex items-center justify-center space-x-2 text-center decoration-none border-2 border-[#262222]"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-white shrink-0 animate-bounce" />
                      <span>Continuar en M.A.P.A.™ Care ➔</span>
                    </a>
                  </div>
                </div>

              </section>

              {/* M.A.P.A.™ Care Transition Banner (No restart option) */}
              <div className="pt-4 pb-8">
                <div className="bg-gradient-to-br from-[#EDE0F0]/80 via-white to-[#FDF9FE] border-2 border-[#6E488A]/20 rounded-2xl p-6 sm:p-8 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E488A]/10 text-[#6E488A] text-[11px] font-mono font-bold uppercase tracking-wider">
                    <span>✨ PROCESO M.A.P.A. MUJER COMPLETADO Y FINALIZADO</span>
                  </div>
                  <h4 className="font-display font-black text-xl text-[#3A185C]">
                    ¡Has cumplido el objetivo de tu viaje de 7 días!
                  </h4>
                  <p className="text-xs text-[#56346F]/80 leading-relaxed max-w-lg mx-auto font-medium">
                    Tu cuenta sigue activa para que entres cuantas veces quieras a revisar tus sesiones, consultar tus audios en Audio Experience, tus libros, registros y retos.
                  </p>
                  <p className="text-xs text-[#3A185C] font-bold">
                    Si deseas continuar con el proceso completo de acompañamiento especializado, nuestro equipo de soporte está listo para orientarte en <span className="text-[#E86FA3] font-black">M.A.P.A.™ Care Ecosistema Clínico de Contención Femenina</span>.
                  </p>
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/573005149055?text=${encodeURIComponent("😀 ¡Hola! He completado mi proceso de 7 días en M.A.P.A. Mujer y deseo continuar con el proceso completo en M.A.P.A.™ Care Ecosistema Clínico de Contención Femenina.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-display font-bold text-xs text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md decoration-none border-2 border-[#262222]"
                    >
                      <Smartphone className="w-4 h-4 text-white shrink-0" />
                      <span>SOLICITAR ACOMPAÑAMIENTO EN M.A.P.A.™ CARE ➔</span>
                    </a>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* FOOTER */}
      {!(focusMode && phase === "DASHBOARD") && (
        <footer id="app_footer" className="bg-[#0b0314] px-6 py-4 border-t border-white/10 relative z-10 text-white">
          <div className="max-w-5xl mx-auto space-y-3 text-center">
            <div className="flex flex-col justify-center items-center gap-1 pb-2 border-b border-white/5">
              <p className="text-sm font-extrabold text-white tracking-wider uppercase font-display mb-1" style={{ color: "#ffffff" }}>
                MAPA™ Mujer • By Tu Poder Mental
              </p>
              <p className="text-xs text-slate-300 max-w-2xl" style={{ color: "#cbd5e1" }}>
                El Ecosistema Inteligente para el Bienestar Emocional Femenino. Fortalece tu mente - Reconecta contigo - Transforma tu vida.
              </p>
            </div>
            
            <p className="text-[10px] text-slate-400 font-sans leading-relaxed max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
              Aviso legal: M.A.P.A.™ no sustituye el consejo clínico, diagnóstico ni tratamiento de profesionales sanitarios o de salud mental. Si experimentas síntomas agudos de emergencia psicológica, por favor consulta de inmediato con un psiquiatra o servicio oficial de urgencias.
            </p>

            <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-slate-300">
              <button 
                onClick={() => setActiveDocumentModal("PRIVACY")}
                className="hover:text-[#36C4D8] transition-colors cursor-pointer bg-transparent border-none p-0 text-white font-mono text-xs outline-none"
                style={{ color: "#ffffff" }}
              >
                Política de Privacidad
              </button>
              <span style={{ color: "#64748b" }}>•</span>
              <button 
                onClick={() => setActiveDocumentModal("TERMS")}
                className="hover:text-[#36C4D8] transition-colors cursor-pointer bg-transparent border-none p-0 text-white font-mono text-xs outline-none"
                style={{ color: "#ffffff" }}
              >
                Términos de la Experiencia
              </button>
            </div>

            <div className="pt-1">
              <p className="text-xs font-mono text-slate-300" style={{ color: "#cbd5e1" }}>
                <br />
                © 2026 MAPA™ - Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* LEGAL AGREEMENTS MODALS */}
      <TermsAndPrivacy
        isOpen={activeDocumentModal !== null}
        type={activeDocumentModal}
        onClose={() => setActiveDocumentModal(null)}
      />

      {/* PREMIUM REWARD MODALS */}
      <RewardModal
        isOpen={unlockedAudioModal.isOpen}
        type={unlockedAudioModal.type}
        onClose={() => setUnlockedAudioModal({ isOpen: false, type: null })}
        userName={leadInfo.nombre || "Usuaria"}
      />

      {/* AVATAR PICKER MODAL */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={saveCustomAvatar}
        currentAvatar={programProgress.customAvatar}
        defaultEmoji={evaluationResult?.avatar || "🧘"}
      />

      {/* PROFILE SETTINGS MODAL */}
      <ProfileSettings
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
        userEmail={currentUserEmail}
        userName={leadInfo.nombre || "Usuaria M.A.P.A.™"}
        currentProfilePicture={programProgress.customAvatar?.type === "image" ? programProgress.customAvatar.value : undefined}
        customAvatar={programProgress.customAvatar}
        defaultEmoji={evaluationResult?.avatar || "🧘"}
        onProfileUpdated={(data) => {
          if (data.customAvatar) {
            saveCustomAvatar(data.customAvatar);
          }
        }}
        onLogout={handleUserLogout}
      />

      {/* ADMIN MASTER LOGIN MODAL */}
      <AnimatePresence>
        {isAdminLoginModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border-2 border-[#6E488A]/20 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative text-left font-sans"
            >
              {/* Decorative top bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#6E488A] via-[#E86FA3] to-[#36C4D8]" />

              <button
                onClick={() => {
                  setIsAdminLoginModalOpen(false);
                  setAdminLoginError(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200">
                    <ShieldCheck className="w-5 h-5 text-[#B5179E]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg text-[#1C0630]">
                      Acceso de Administración
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                      Exclusivo para el Administrador Principal
                    </p>
                  </div>
                </div>

                {adminLoginError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-sans font-bold"
                  >
                    ⚠️ {adminLoginError}
                  </motion.div>
                )}

                <form onSubmit={handleAdminModalSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-black">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={adminFormEmail}
                        onChange={(e) => setAdminFormEmail(e.target.value)}
                        placeholder="contacto@tupodermental.club"
                        className="w-full bg-[#FAF7F9] border-2 border-[#6E488A]/15 focus:border-[#36C4D8] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#1C0630] placeholder-slate-400 outline-none transition-all font-sans font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-black">
                      Contraseña Maestra
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={adminFormPass}
                        onChange={(e) => setAdminFormPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#FAF7F9] border-2 border-[#6E488A]/15 focus:border-[#36C4D8] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#1C0630] placeholder-slate-400 outline-none transition-all font-sans font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminLoggingIn}
                    className="w-full py-3 mt-2 bg-gradient-to-r from-[#6E488A] to-[#E86FA3] hover:opacity-95 text-white font-display font-black text-xs rounded-xl tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-purple-400/10 disabled:opacity-50 disabled:pointer-events-none uppercase"
                  >
                    <span>{isAdminLoggingIn ? "VERIFICANDO..." : "INGRESAR AL PANEL ADMIN"}</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MILESTONE CONGRATULATORY BADGE MODALS */}
      <MilestoneModal
        isOpen={milestoneModal.isOpen}
        daysCount={milestoneModal.daysCount}
        onClose={() => setMilestoneModal({ ...milestoneModal, isOpen: false })}
        userName={leadInfo.nombre || "Usuaria"}
      />

      {/* MANDATORY ONBOARDING WELCOME MODAL */}
      <WelcomeOnboardingModal
        isOpen={!!currentUserEmail && phase !== "ADMIN" && !programProgress.onboardingCompletado}
        userName={leadInfo.nombre || "Usuaria"}
        userEmail={currentUserEmail}
        onComplete={handleOnboardingComplete}
      />

      {/* CLARA LUZ PROFILE & MENTOR BIOGRAPHY MODAL */}
      <ClaraLuzProfileModal
        isOpen={isClaraProfileOpen}
        onClose={() => setIsClaraProfileOpen(false)}
        userFirstName={leadInfo?.nombre}
      />

      {/* TECHNICAL SUPPORT & ASSISTANCE DRAWER */}
      <TechnicalSupportDrawer
        userEmail={currentUserEmail || loginEmail || leadInfo?.email}
        isLoggedIn={!!currentUserEmail}
      />

      {/* FLOATING LEAD TOAST NOTIFICATION */}
      <AnimatePresence>
        {leadSubmitToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4"
          >
            <div className="bg-[#56346F] border border-[#36C4D8]/50 text-white p-5 rounded-2xl shadow-2xl flex items-start space-x-3.5 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-[#36C4D8]/20 flex items-center justify-center text-[#36C4D8] shrink-0 animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-left">
                <p className="text-xs font-mono text-[#36C4D8] uppercase tracking-wider font-bold">✓ Envío Iniciado con Éxito</p>
                <p className="text-xs text-white/95 leading-relaxed font-sans">
                  {leadSubmitToast}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION UTILITIES CONTAINER (BOTTOM RIGHT - COMPACT & COLLISION-FREE) */}
      {!(focusMode && phase === "DASHBOARD") && (
        <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[999] flex items-center gap-1.5 sm:gap-2">
          {/* Floating Ambient Music Control Button */}
          <motion.button
            onClick={toggleAmbientAudio}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center cursor-pointer transition-all shrink-0 ${
              isAmbientPlaying 
                ? "bg-[#9D4EDD] hover:bg-[#7b2cbf]" 
                : "bg-slate-600 hover:bg-slate-700"
            }`}
            title={isAmbientPlaying ? "Pausar música de fondo" : "Reproducir música de fondo"}
          >
            {isAmbientPlaying ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
            )}
          </motion.button>

          {/* Floating WhatsApp Share Button */}
          <motion.button
            onClick={() => {
              const message = "¡Hola! Te recomiendo de todo corazón M.A.P.A.™ Mujer. Mi experiencia con esta aplicación ha sido excelente para mi calma y equilibrio emocional. Descubre tu mapa hoy y pruébala tú también en: https://quizmapa.tupodermental.club/quiz";
              const link = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
              window.open(link, "_blank", "noopener,noreferrer");
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#25D366] text-white border-2 border-white shadow-lg hover:bg-[#20ba5a] transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Compartir M.A.P.A.™ Mujer en WhatsApp"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white" />
          </motion.button>

          {/* Floating Alarm Toggle Button */}
          <motion.button
            onClick={() => setAlarmPanelOpen(!alarmPanelOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center cursor-pointer transition-all shrink-0 ${
              activeTaskAlarm && activeTaskAlarm.isRunning 
                ? "bg-emerald-500 hover:bg-emerald-600 animate-pulse" 
                : "bg-[#411F66] hover:bg-[#522b7d]"
            }`}
            title="Sintonizador de Alarmas y Recordatorios"
          >
            {activeTaskAlarm && activeTaskAlarm.isRunning ? (
              <div className="relative">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border border-white flex items-center justify-center text-[7px] font-black">
                  !
                </span>
              </div>
            ) : (
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </motion.button>

          {/* Back to top indicator */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                key="scroll-to-top"
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E86FA3] text-white border-2 border-white shadow-lg hover:bg-[#d55d91] hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center group shrink-0"
                title="Volver arriba"
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ALARM MANAGER DRAWER / SHEET */}
      <AnimatePresence>
        {alarmPanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setAlarmPanelOpen(false)}
              className="fixed inset-0 bg-black/50 z-[9998]"
            />
            {/* Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed bottom-0 sm:bottom-24 right-0 sm:right-6 w-full sm:max-w-md bg-white border-t-4 sm:border-4 border-[#E86FA3] sm:rounded-2xl shadow-2xl z-[9999] p-5 text-left text-black overflow-y-auto max-h-[85vh] sm:max-h-[580px] flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#E86FA3]/10 rounded-lg text-[#E86FA3]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm text-[#411F66] tracking-wide">
                      Sintonizador de Alarmas
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono">BIENESTAR Y MINDFULNESS M.A.P.A.</p>
                  </div>
                </div>
                <button
                  onClick={() => setAlarmPanelOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Quick Test Audio Button */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <Volume2 className="w-4 h-4 text-[#E86FA3]" />
                  <span className="font-bold">Probar sonido de alarma:</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isAlarmPlaying) {
                      stopAlarm();
                    } else {
                      triggerAlarm("Prueba de sonido del sintonizador de calma");
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    isAlarmPlaying 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "bg-[#E86FA3] text-white hover:bg-[#d55d91]"
                  }`}
                >
                  {isAlarmPlaying ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Silenciar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Probar ↻</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preset Exercises Alarm Selector */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-mono uppercase tracking-wider text-[#411F66] font-extrabold">
                  ⏰ PROGRAMAR ALARMA DE EJERCICIO
                </h5>
                <p className="text-[11px] text-gray-600 leading-snug">
                  Selecciona un ejercicio y te avisaremos con una señal sonora cuando sea momento de realizarlo:
                </p>
                <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {[
                    { name: "Respiración de Caja", duration: 120, label: "Respiración de Caja (2 min)" },
                    { name: "Pausa Vagotónica", duration: 60, label: "Pausa Vagotónica (1 min)" },
                    { name: "Estiramiento Corporal", duration: 180, label: "Estiramiento Corporal (3 min)" },
                    { name: "Interrupción muscular M.A.P.A.", duration: 120, label: "Interrupción muscular (2 min)" },
                    { name: "Taza de Té Consciente", duration: 300, label: "Taza de Té Consciente (5 min)" },
                    { name: "Silencio Mental", duration: 600, label: "Silencio Mental (10 min)" }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveTaskAlarm({
                          taskName: preset.name,
                          secondsLeft: preset.duration,
                          isRunning: true
                        });
                        setAlarmPanelOpen(false);
                        setDashboardNotice(`⏰ Alarma establecida para "${preset.name}" en ${preset.duration / 60} min.`);
                        setTimeout(() => setDashboardNotice(null), 4000);
                      }}
                      className="w-full text-left text-xs p-2.5 rounded-lg border border-gray-100 hover:border-[#E86FA3]/50 hover:bg-[#E86FA3]/5 transition-all flex justify-between items-center group cursor-pointer"
                    >
                      <span className="font-bold text-gray-800 group-hover:text-[#411F66]">{preset.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E86FA3]" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Active countdown display */}
              {activeTaskAlarm && (
                <div className="border-t border-gray-100 pt-3">
                  <div className="bg-[#411F66]/5 rounded-xl p-3 border border-[#411F66]/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#411F66] animate-spin" style={{ animationDuration: '6s' }} />
                      <div className="text-left">
                        <span className="text-xs font-bold text-[#411F66] block truncate max-w-[130px]">
                          {activeTaskAlarm.taskName}
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          Faltan: {Math.floor(activeTaskAlarm.secondsLeft / 60)}m {activeTaskAlarm.secondsLeft % 60}s
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setCompletedTaskFeedback({
                            taskName: activeTaskAlarm.taskName,
                            timestamp: new Date().toISOString()
                          });
                          setActiveTaskAlarm(null);
                        }}
                        className="px-2 py-1 text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                      >
                        ✓ Listo
                      </button>
                      <button
                        onClick={() => setActiveTaskAlarm(null)}
                        className="px-2 py-1 text-[10px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback "¿Cómo te sientes?" selection when an exercise completes */}
              {completedTaskFeedback && (
                <div className="border-t border-pink-100 pt-3 space-y-2 animate-fadeIn">
                  <div className="bg-pink-50/40 rounded-xl p-3.5 border border-pink-100/70 text-left space-y-2.5">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-[#411F66] leading-tight">
                        ✨ ¡Buen trabajo con <span className="italic text-[#E86FA3]">"{completedTaskFeedback.taskName}"</span>!
                      </p>
                      <button 
                        onClick={() => setCompletedTaskFeedback(null)}
                        className="text-[10px] font-bold text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        Ignorar
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium leading-normal">
                      ¿Cómo te sientes después de completar esta práctica de sintonización?
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {[
                        { emoji: "🙂", label: "Mejor", value: "bien" },
                        { emoji: "😐", label: "Igual", value: "neutral" },
                        { emoji: "😟", label: "Abrumada", value: "ansiosa" }
                      ].map((feeling) => (
                        <button
                          key={feeling.value}
                          type="button"
                          onClick={() => {
                            logExerciseFeeling(completedTaskFeedback.taskName, feeling.value);
                            setCompletedTaskFeedback(null);
                            setDashboardNotice(`❤️ ¡Sentimiento guardado! Gracias por registrar tu asimilación.`);
                            setTimeout(() => setDashboardNotice(null), 3000);
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg border border-pink-200 bg-white hover:bg-pink-50 text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 text-[#411F66]"
                        >
                          <span className="text-lg leading-none">{feeling.emoji}</span>
                          <span className="text-[9px] font-semibold text-gray-500 uppercase font-mono tracking-wider">{feeling.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ACTIVE ALARM OVERLAY BANNER REMOVED */}

    </div>
  );
}

// Helper functions for AI Recommendations
function getAiRecommendationsForArchetype(id: string) {
  switch (id) {
    case "VIGILANTE":
      return [
        {
          id: 1,
          icon: "Activity",
          badge: "Somático",
          title: "Descompresión Diafragmática",
          desc: "Tu amígdala escanea micro-tensiones constantemente. Realiza respiraciones 4-7-8 al mediodía para inducir calma vagal profunda y relajar el diafragma."
        },
        {
          id: 2,
          icon: "ShieldCheck",
          badge: "Cognitivo",
          title: "Bitácora de Seguridad",
          desc: "Anota las situaciones cotidianas donde temías juicio ajeno o tensión pero terminaron en paz. Reentrena tu cerebro en la percepción de seguridad social."
        },
        {
          id: 3,
          icon: "Zap",
          badge: "Conductual",
          title: "Ritual de Transición Fisiológica",
          desc: "Lávate las manos al llegar a casa. Dile a tu mente consciente: 'Mi turno de protección ha terminado, puedo bajar la armadura'."
        }
      ];
    case "ANTICIPADOR":
      return [
        {
          id: 1,
          icon: "Sparkles",
          badge: "Mental",
          title: "Deconstrucción de Películas Futuras",
          desc: "Cuando tu mente empiece a simular escenarios catastróficos, escribe de inmediato el desenlace más positivo posible para contrarrestar el sesgo de supervivencia."
        },
        {
          id: 2,
          icon: "Compass",
          badge: "Presencia",
          title: "Presencia Sensorial Plena",
          desc: "Haz caminatas diarias de 5 minutos reconociendo conscientemente 3 sonidos y 2 texturas físicas en el presente absoluto, rompiendo la inercia del mañana."
        },
        {
          id: 3,
          icon: "Clock",
          badge: "Regulación",
          title: "Filtro de Desgaste Anticipado",
          desc: "Planifica tus actividades en bloques cerrados de 1 hora. Reducir el horizonte temporal de planificación reduce drásticamente el nivel de alerta simpática."
        }
      ];
    case "HIPERCONTROLADOR":
      return [
        {
          id: 1,
          icon: "Lock",
          badge: "Asimilación",
          title: "Permiso de Caos Controlado",
          desc: "Elige una pequeña tarea cotidiana sin importancia al día (p. ej., dejar un vaso sin secar o un correo no urgente sin archivar) y asimila la incomodidad sin actuar."
        },
        {
          id: 2,
          icon: "Brain",
          badge: "Cognitivo",
          title: "Caja de Preocupaciones Cerrada",
          desc: "Asigna 15 minutos fijos al final del día para preocuparte libremente. Si surge un control impulsivo fuera de ese horario, escríbelo y pospónlo ahí."
        },
        {
          id: 3,
          icon: "Heart",
          badge: "Soma",
          title: "Descarga Somática Intencionada",
          desc: "Sacude tus extremidades y estira tu cuerpo durante 1 minuto cada tarde. El control mental se acumula como rigidez severa en hombros y mandíbula."
        }
      ];
    case "SOBRECARGADO":
      return [
        {
          id: 1,
          icon: "Eye",
          badge: "Desconexión",
          title: "Pausa de Vacío Cognitivo",
          desc: "Establece 3 pausas de 5 minutos al día sin pantallas ni lecturas. Mira al horizonte o cierra los ojos para permitir que tus redes neuronales se enfríen."
        },
        {
          id: 2,
          icon: "Award",
          badge: "Límite",
          title: "Blindaje de Agenda Semanal",
          desc: "Bloquea un espacio sagrado de 2 horas los fines de semana donde esté estrictamente prohibido planificar, ordenar, limpiar, organizar o ser productiva."
        },
        {
          id: 3,
          icon: "Zap",
          badge: "Sueño",
          title: "Regulación de Ritmo Circadiano",
          desc: "Saca el móvil de tu habitación 30 minutos antes de dormir y haz un vaciado mental en papel anotando tus pendientes para asegurar un sueño reparador."
        }
      ];
    case "PROTECTOR":
    default:
      return [
        {
          id: 1,
          icon: "MessageCircle",
          badge: "Límites",
          title: "Declaración de Límites Seguros",
          desc: "Expresa una necesidad menor hoy en voz alta ('necesito un momento de silencio', 'prefiero otra opción') para validar tu presencia y espacio en el entorno."
        },
        {
          id: 2,
          icon: "Heart",
          badge: "Auto-Amor",
          title: "Auto-Compasión Somática Radical",
          desc: "Dedica 3 minutos al día a respirar sosteniendo tu mano derecha sobre el corazón, reconociendo con cariño que sostener el peso ajeno también agota."
        },
        {
          id: 3,
          icon: "Volume2",
          badge: "Filtro",
          title: "Sintonización Sonora de Calma",
          desc: "Escucha un audio de descompresión neurocognitiva M.A.P.A.™ con auriculares aislantes para silenciar el peso de la responsabilidad del entorno ajeno."
        }
      ];
  }
}

function renderRecommendationIcon(iconName: string, className: string = "w-6 h-6") {
  switch (iconName) {
    case "Activity": return <Activity className={className} />;
    case "ShieldCheck": return <ShieldCheck className={className} />;
    case "Zap": return <Zap className={className} />;
    case "Sparkles": return <Sparkles className={className} />;
    case "Compass": return <Compass className={className} />;
    case "Clock": return <Clock className={className} />;
    case "Lock": return <Lock className={className} />;
    case "Brain": return <Layers className={className} />;
    case "Heart": return <Heart className={className} />;
    case "Eye": return <Eye className={className} />;
    case "Award": return <Award className={className} />;
    case "MessageCircle": return <MessageCircle className={className} />;
    case "Volume2": return <Volume2 className={className} />;
    default: return <Sparkles className={className} />;
  }
}


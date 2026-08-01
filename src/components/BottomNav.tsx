import React from "react";
import { 
  Home, 
  Calendar, 
  Play, 
  Pause, 
  Sparkles, 
  User, 
  Compass, 
  Music,
  Sliders,
  Bell
} from "lucide-react";
import { motion } from "motion/react";

export type NavTab = "home" | "program" | "tools" | "profile";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isAudioPlaying?: boolean;
  onToggleAudioPlay?: () => void;
  activeAudioTitle?: string;
  hasUnread?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isAudioPlaying = false,
  onToggleAudioPlay,
  activeAudioTitle,
  hasUnread = false,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "program", label: "7 Días", icon: Calendar },
    { id: "tools", label: "Herramientas", icon: Sparkles },
    { id: "profile", label: "Mi Perfil", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none max-w-md mx-auto sm:max-w-xl">
      <div className="bg-white/95 backdrop-blur-md border-2 border-[#6E488A]/15 shadow-[0_-4px_25px_rgba(110,72,138,0.12)] rounded-2xl px-3 py-2 flex items-center justify-around pointer-events-auto relative">
        {/* Central Audio Play Float Button if audio is active or playing */}
        {onToggleAudioPlay && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleAudioPlay}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white cursor-pointer transition-all ${
                isAudioPlaying 
                  ? "bg-gradient-to-r from-[#36C4D8] to-[#27A1B2] animate-pulse" 
                  : "bg-gradient-to-r from-[#E86FA3] to-[#6E488A]"
              }`}
              title={isAudioPlaying ? `Pausar: ${activeAudioTitle || 'Audio'}` : "Reproducir Audio M.A.P.A."}
            >
              {isAudioPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </motion.button>
          </div>
        )}

        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          // Add extra margin around center if audio play button is shown
          const isCenterAdjacent = onToggleAudioPlay && (index === 1 || index === 2);

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-300 cursor-pointer outline-none border-none ${
                isCenterAdjacent ? (index === 1 ? "mr-3" : "ml-3") : ""
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isActive
                      ? "text-[#6E488A] scale-110"
                      : "text-[#56346F]/50 hover:text-[#6E488A]"
                  }`}
                />
                
                {item.id === "profile" && hasUnread && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#E86FA3] rounded-full animate-ping" />
                )}
              </div>

              <span
                className={`text-[10px] font-sans font-bold mt-0.5 transition-colors duration-300 ${
                  isActive ? "text-[#6E488A]" : "text-[#56346F]/50"
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1 w-5 h-1 bg-gradient-to-r from-[#E86FA3] to-[#36C4D8] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

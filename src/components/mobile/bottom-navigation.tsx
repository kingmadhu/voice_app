"use client";

import { useState } from "react";
import { Home, Mic, Settings, Download, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHapticFeedback } from "@/hooks/use-haptic-feedback";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "settings", label: "Settings", icon: Settings },
];

export function BottomNavigation({
  activeTab,
  onTabChange,
  className,
}: BottomNavigationProps) {
  const { triggerHaptic } = useHapticFeedback(); // <-- correct

  const handleTabChange = (tab: string) => {
    triggerHaptic("light");
    onTabChange(tab);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50",
        "md:hidden", // Only show on mobile
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-all duration-200",
                "min-w-[60px] max-w-[80px]",
                "active:scale-95 transition-transform duration-150",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium truncate",
                  isActive ? "text-blue-600" : "text-gray-500"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Android-style navigation indicator */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent transition-all duration-300"
        style={{
          opacity: activeTab ? 1 : 0,
          transform: `translateX(${
            (navItems.findIndex((item) => item.id === activeTab) /
              (navItems.length - 1)) *
            100
          }%)`,
        }}
      />
    </div>
  );
}

import React from "react";
import { ShieldCheck, Moon, Sun } from "lucide-react";
import { SystemStatusBadges } from "@/components/shell/SystemStatusBadges";
import { useTheme } from "@/context/ThemeContext";

export const TopInstitutionalHeader: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#0d1522] border-b border-gov-border dark:border-slate-800 shadow-sm select-none transition-colors">
      {/* Tri-color national accent strip */}
      <div className="h-1 w-full flex">
        <div className="h-full flex-1 bg-gov-saffron" />
        <div className="h-full flex-1 bg-white dark:bg-gray-400" />
        <div className="h-full flex-1 bg-gov-green" />
      </div>

      <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: BIS / GOI Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gov-navy dark:bg-slate-800 flex items-center justify-center text-white shadow-sm shrink-0 border border-transparent dark:border-slate-700">
            <ShieldCheck className="w-5 h-5 text-gov-saffron" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-wider uppercase text-gov-navy dark:text-gray-300">
                भारत सरकार / Government of India
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gov-navy dark:text-white tracking-tight">
                BIS-SpecAI
              </span>
              <span className="text-xs text-gov-text-secondary dark:text-gray-400 hidden sm:inline">
                | Bureau of Indian Standards Procurement Platform
              </span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry & Theme Switcher */}
        <div className="flex items-center gap-3">
          <SystemStatusBadges />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gov-navy dark:text-gray-200 border border-gray-200 dark:border-slate-700 transition-colors"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-gov-saffron" /> : <Moon className="w-4 h-4 text-gov-navy" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopInstitutionalHeader;

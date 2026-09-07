import React from "react";
import { Globe, Trash2, Radio } from "lucide-react";
import type { VoiceStatusResponse } from "@/types";

export interface VoiceControlsToolbarProps {
  language: string;
  setLanguage: (lang: string) => void;
  status: VoiceStatusResponse | null;
  onClear: () => void;
  hasMessages: boolean;
}

export const VoiceControlsToolbar: React.FC<VoiceControlsToolbarProps> = ({
  language,
  setLanguage,
  status,
  onClear,
  hasMessages,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gov-offwhite dark:bg-[#0c1626] rounded-lg border border-gov-border dark:border-slate-800 text-xs">
      {/* Language Selector */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded border border-gov-border dark:border-slate-700">
        <Globe className="w-3.5 h-3.5 text-gov-blue ml-1" />
        <span className="text-xs text-gov-text-secondary dark:text-gray-400 font-medium mr-1">Language:</span>
        {(["auto", "en", "hi"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              language === lang
                ? "bg-gov-blue text-white shadow-sm"
                : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white"
            }`}
          >
            {lang === "auto" ? "Auto Detect" : lang === "en" ? "English" : "हिन्दी (Hindi)"}
          </button>
        ))}
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gov-text-secondary dark:text-gray-400">
          <Radio
            className={`w-3.5 h-3.5 ${status?.stt_available ? "text-gov-green animate-pulse" : "text-amber-500"}`}
          />
          <span className="hidden sm:inline font-medium">
            {status?.stt_available ? "Voice Speech Engine Ready" : "Voice Engine Standby"}
          </span>
        </div>
        {hasMessages && (
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 text-gov-text-secondary hover:text-gov-red hover:bg-red-50 dark:hover:bg-red-950/30 rounded border border-gov-border dark:border-slate-700 transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceControlsToolbar;

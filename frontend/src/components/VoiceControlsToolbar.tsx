import React from "react";
import { Globe, Zap, Brain, Trash2, Radio } from "lucide-react";
import type { VoiceStatusResponse } from "../types";

interface VoiceControlsToolbarProps {
  mode: "fast" | "thinking";
  setMode: (mode: "fast" | "thinking") => void;
  language: string;
  setLanguage: (lang: string) => void;
  status: VoiceStatusResponse | null;
  onClear: () => void;
  hasMessages: boolean;
}

export const VoiceControlsToolbar: React.FC<VoiceControlsToolbarProps> = ({
  mode,
  setMode,
  language,
  setLanguage,
  status,
  onClear,
  hasMessages,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 apple-glass rounded-2xl border border-white/10 text-sm">
      {/* Language Selector */}
      <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
        <Globe className="w-4 h-4 text-blue-400 ml-1.5" />
        <span className="text-xs text-slate-400 font-medium mr-1">Voice Lang:</span>
        {(["auto", "en", "hi"] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              language === lang
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {lang === "auto" ? "Auto (Detect)" : lang === "en" ? "English" : "हिन्दी (Hindi)"}
          </button>
        ))}
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
        <button
          type="button"
          onClick={() => setMode("fast")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            mode === "fast"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Fast (3B)
        </button>
        <button
          type="button"
          onClick={() => setMode("thinking")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            mode === "thinking"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          Thinking (7B)
        </button>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Radio
            className={`w-3.5 h-3.5 ${status?.stt_available ? "text-emerald-400 animate-pulse" : "text-amber-400"}`}
          />
          <span className="hidden sm:inline">
            {status?.stt_available ? `${status.stt_device.toUpperCase()} STT & TTS Ready` : "Voice Offline"}
          </span>
        </div>
        {hasMessages && (
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

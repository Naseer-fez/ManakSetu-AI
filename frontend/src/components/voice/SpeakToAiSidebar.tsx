import React from "react";
import { Mic, Radio, Volume2 } from "lucide-react";
import { AudioStatusCard } from "@/components/voice/AudioStatusCard";
import { clsx } from "clsx";

interface SpeakToAiSidebarProps {
  voiceMode: "interactive" | "live";
  setVoiceMode: (mode: "interactive" | "live") => void;
}

export const SpeakToAiSidebar: React.FC<SpeakToAiSidebarProps> = ({
  voiceMode,
  setVoiceMode,
}) => {
  return (
    <aside className="lg:col-span-4 bg-white dark:bg-[#111927] rounded-lg p-5 border border-gov-border dark:border-slate-800 shadow-sm space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Volume2 className="w-5 h-5 text-gov-navy dark:text-blue-400" />
          <h2 className="text-base font-bold text-gov-navy dark:text-white tracking-tight">Voice Assistant</h2>
        </div>
        <p className="text-xs text-gov-text-secondary dark:text-gray-400 leading-relaxed">
          Choose interaction mode with the Bureau of Indian Standards voice engine.
        </p>
      </div>

      <div className="space-y-2.5">
        <button
          onClick={() => setVoiceMode("interactive")}
          className={clsx(
            "w-full text-left p-3.5 rounded-lg border transition-all relative overflow-hidden select-none",
            voiceMode === "interactive"
              ? "bg-blue-50 dark:bg-blue-950/40 border-gov-blue dark:border-blue-700 shadow-sm"
              : "bg-gov-offwhite dark:bg-slate-800/60 border-gov-border dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  "p-1.5 rounded",
                  voiceMode === "interactive" ? "bg-gov-blue text-white" : "bg-gray-200 dark:bg-slate-700 text-gov-text-secondary dark:text-gray-300"
                )}
              >
                <Mic className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gov-navy dark:text-white">Interactive Voice (Push-to-Talk)</span>
            </div>
            {voiceMode === "interactive" && (
              <span className="w-2 h-2 rounded-full bg-gov-blue animate-pulse" />
            )}
          </div>
          <p className="text-xs text-gov-text-secondary dark:text-gray-400 pl-7 leading-relaxed">
            Push-to-talk query with neural speech transcription and auto-playing audio response.
          </p>
        </button>

        <button
          onClick={() => setVoiceMode("live")}
          className={clsx(
            "w-full text-left p-3.5 rounded-lg border transition-all relative overflow-hidden select-none",
            voiceMode === "live"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-gov-green dark:border-emerald-700 shadow-sm"
              : "bg-gov-offwhite dark:bg-slate-800/60 border-gov-border dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  "p-1.5 rounded",
                  voiceMode === "live" ? "bg-gov-green text-white" : "bg-gray-200 dark:bg-slate-700 text-gov-text-secondary dark:text-gray-300"
                )}
              >
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-gov-navy dark:text-white">Real-Time Streaming (Live VAD)</span>
            </div>
            {voiceMode === "live" && (
              <span className="w-2 h-2 rounded-full bg-gov-green animate-ping" />
            )}
          </div>
          <p className="text-xs text-gov-text-secondary dark:text-gray-400 pl-7 leading-relaxed">
            Low-latency duplex WebSocket stream with live Silero Voice Activity Detection.
          </p>
        </button>
      </div>

      <AudioStatusCard />
    </aside>
  );
};

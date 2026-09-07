import React from "react";
import { Mic, Radio, Volume2 } from "lucide-react";
import { AudioStatusCard } from "./AudioStatusCard";
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
    <aside className="lg:col-span-4 apple-glass rounded-3xl p-5 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Volume2 className="w-5 h-5 text-apple-indigo" />
          <h2 className="text-base font-semibold text-white tracking-tight">Speak to AI</h2>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          Choose how you wish to communicate with the Bureau of Indian Standards voice engine.
        </p>
      </div>

      <div className="space-y-2.5">
        <button
          onClick={() => setVoiceMode("interactive")}
          className={clsx(
            "w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group",
            voiceMode === "interactive"
              ? "bg-apple-blue/15 border-apple-blue/60 shadow-lg shadow-apple-blue/10"
              : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15"
          )}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  "p-2 rounded-xl transition-colors",
                  voiceMode === "interactive" ? "bg-apple-blue text-white" : "bg-white/10 text-white/60"
                )}
              >
                <Mic className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white">Interactive Voice</span>
            </div>
            {voiceMode === "interactive" && (
              <span className="w-2 h-2 rounded-full bg-apple-blue animate-pulse" />
            )}
          </div>
          <p className="text-xs text-white/50 pl-9 leading-relaxed">
            Push-to-talk query with neural speech transcription and high-fidelity audio playback.
          </p>
        </button>

        <button
          onClick={() => setVoiceMode("live")}
          className={clsx(
            "w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group",
            voiceMode === "live"
              ? "bg-apple-mint/15 border-apple-mint/60 shadow-lg shadow-apple-mint/10"
              : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15"
          )}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  "p-2 rounded-xl transition-colors",
                  voiceMode === "live" ? "bg-apple-mint text-black font-bold" : "bg-white/10 text-white/60"
                )}
              >
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white">Real-Time Streaming</span>
            </div>
            {voiceMode === "live" && (
              <span className="w-2 h-2 rounded-full bg-apple-mint animate-ping" />
            )}
          </div>
          <p className="text-xs text-white/50 pl-9 leading-relaxed">
            Low-latency continuous duplex audio stream with live voice activity detection (VAD).
          </p>
        </button>
      </div>

      <AudioStatusCard />
    </aside>
  );
};

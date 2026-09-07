import React from "react";
import { Sparkles, Trash2, Zap, Brain } from "lucide-react";
import { clsx } from "clsx";

import { MacStatusIndicator } from "./MacStatusIndicator";

interface ChatViewHeaderProps {
  mode: "fast" | "heavy";
  setMode: (mode: "fast" | "heavy") => void;
  onClear: () => void;
}

export const ChatViewHeader: React.FC<ChatViewHeaderProps> = ({
  mode,
  setMode,
  onClear,
}) => {
  return (
    <header className="px-6 py-4 border-b border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-apple-indigo/20 border border-apple-indigo/30 flex items-center justify-center text-apple-indigo shadow-md shadow-apple-indigo/10">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            BIS AI Intelligence Hub
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-apple-mint/20 text-apple-mint border border-apple-mint/30">
              Online
            </span>
          </h2>
          <p className="text-xs text-white/50">Semantic reasoning & normative specification assistant</p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-3">
        <MacStatusIndicator />

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setMode("fast")}
            type="button"
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
              mode === "fast"
                ? "bg-apple-blue text-white shadow-md shadow-apple-blue/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Zap className="w-3.5 h-3.5 text-apple-amber" />
            <span>Fast Response</span>
          </button>
          <button
            onClick={() => setMode("heavy")}
            type="button"
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
              mode === "heavy"
                ? "bg-apple-indigo text-white shadow-md shadow-apple-indigo/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Brain className="w-3.5 h-3.5 text-apple-indigo" />
            <span>Deep Reasoning</span>
          </button>
        </div>

        <button
          onClick={onClear}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/60 hover:text-apple-red hover:bg-apple-red/10 border border-white/5 hover:border-apple-red/20 transition-all"
          title="Clear conversation and reset context"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>
    </header>
  );
};

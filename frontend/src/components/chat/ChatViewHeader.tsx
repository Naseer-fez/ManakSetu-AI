import React from "react";
import { Sparkles, Trash2, Zap, Brain } from "lucide-react";
import { clsx } from "clsx";

import { MacStatusIndicator } from "@/components/chat/MacStatusIndicator";

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
    <header className="px-5 py-3.5 border-b border-gov-border dark:border-slate-800 bg-white dark:bg-[#111927] flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gov-navy dark:bg-slate-800 flex items-center justify-center text-white shadow-sm border border-transparent dark:border-slate-700">
          <Sparkles className="w-4 h-4 text-gov-saffron" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gov-navy dark:text-white tracking-tight flex items-center gap-2">
            BIS AI Intelligence Hub
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-gov-green dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase">
              Online
            </span>
          </h2>
          <p className="text-xs text-gov-text-secondary dark:text-gray-400">Dual-mode semantic reasoning & normative specification assistant</p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        <MacStatusIndicator />

        <div className="flex items-center gap-1 bg-gov-offwhite dark:bg-slate-800/80 p-1 rounded border border-gov-border dark:border-slate-700">
          <button
            onClick={() => setMode("fast")}
            type="button"
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all",
              mode === "fast"
                ? "bg-gov-blue text-white shadow-sm"
                : "text-gov-text-secondary dark:text-gray-300 hover:text-gov-navy dark:hover:text-white hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            <Zap className="w-3.5 h-3.5 text-gov-saffron" />
            <span>Fast Advisory</span>
          </button>
          <button
            onClick={() => setMode("heavy")}
            type="button"
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all",
              mode === "heavy"
                ? "bg-gov-navy dark:bg-blue-600 text-white shadow-sm"
                : "text-gov-text-secondary dark:text-gray-300 hover:text-gov-navy dark:hover:text-white hover:bg-white dark:hover:bg-slate-700"
            )}
          >
            <Brain className="w-3.5 h-3.5 text-gov-saffron" />
            <span>Deep Reasoning</span>
          </button>
        </div>

        <button
          onClick={onClear}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium text-gov-text-secondary dark:text-gray-300 hover:text-gov-red hover:bg-red-50 dark:hover:bg-red-950/30 border border-gov-border dark:border-slate-700 transition-colors"
          title="Clear conversation and reset context"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </header>
  );
};

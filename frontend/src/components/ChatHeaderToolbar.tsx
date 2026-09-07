import React from "react";
import { Zap, Brain, RefreshCw, X, Trash2, Sparkles } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  mode: "fast" | "heavy";
  setMode: (m: "fast" | "heavy") => void;
  onRefreshContext: () => void;
  refreshing: boolean;
  onClearChat?: () => void;
  onClose: () => void;
}

export const ChatHeaderToolbar: React.FC<Props> = ({
  mode,
  setMode,
  onRefreshContext,
  refreshing,
  onClearChat,
  onClose,
}) => {
  return (
    <div className="p-3.5 border-b border-gov-border dark:border-slate-800 flex flex-col gap-2.5 bg-gov-offwhite dark:bg-slate-900/50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-950 text-gov-blue dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-gov-navy dark:text-white tracking-tight">
              BIS AI Assistant
            </span>
            <span className="block text-[10px] text-gov-text-secondary dark:text-gray-400">Semantic Context Active</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onClearChat && (
            <button
              onClick={onClearChat}
              title="Clear Chat & Start Fresh"
              className="p-1.5 rounded text-gov-text-secondary hover:text-gov-red dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onRefreshContext}
            disabled={refreshing}
            title="Compress & Refresh Context"
            className="p-1.5 rounded text-gov-text-secondary hover:text-gov-navy dark:text-gray-400 dark:hover:text-white transition-colors disabled:opacity-40"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", refreshing && "animate-spin text-gov-green dark:text-emerald-400")} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-gov-text-secondary hover:text-gov-navy dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reasoning Mode Switcher */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg text-xs border border-gov-border dark:border-slate-700">
        <button
          onClick={() => setMode("fast")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded font-semibold transition-all text-xs",
            mode === "fast" ? "bg-gov-blue text-white shadow-sm" : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white"
          )}
        >
          <Zap className="w-3 h-3 text-gov-saffron" /> Fast Advisory
        </button>
        <button
          onClick={() => setMode("heavy")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded font-semibold transition-all text-xs",
            mode === "heavy" ? "bg-gov-navy dark:bg-blue-600 text-white shadow-sm" : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white"
          )}
        >
          <Brain className="w-3 h-3 text-gov-saffron" /> Deep Reasoning
        </button>
      </div>
    </div>
  );
};

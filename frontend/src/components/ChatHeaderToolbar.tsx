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
    <div className="p-3.5 border-b border-white/10 flex flex-col gap-2.5 bg-white/5 backdrop-blur-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-apple-indigo/20 text-apple-indigo">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white/95 tracking-tight">
              BIS AI Assistant
            </span>
            <span className="block text-[10px] text-white/50">Semantic Context Active</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onClearChat && (
            <button
              onClick={onClearChat}
              title="Clear Chat & Start Fresh"
              className="p-1.5 rounded-lg text-white/60 hover:text-apple-red hover:bg-apple-red/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onRefreshContext}
            disabled={refreshing}
            title="Compress & Refresh Context"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", refreshing && "animate-spin text-apple-mint")} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reasoning Mode Switcher */}
      <div className="flex gap-1 bg-black/40 p-1 rounded-xl text-xs border border-white/5">
        <button
          onClick={() => setMode("fast")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all text-xs",
            mode === "fast" ? "bg-apple-blue text-white shadow-sm font-semibold" : "text-white/60 hover:text-white"
          )}
        >
          <Zap className="w-3 h-3 text-apple-amber" /> Fast Response
        </button>
        <button
          onClick={() => setMode("heavy")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all text-xs",
            mode === "heavy" ? "bg-apple-indigo text-white shadow-sm font-semibold" : "text-white/60 hover:text-white"
          )}
        >
          <Brain className="w-3 h-3 text-apple-indigo" /> Deep Reasoning
        </button>
      </div>
    </div>
  );
};

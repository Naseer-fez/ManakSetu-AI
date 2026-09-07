import React from "react";
import { Check, X, Sparkles, AlertCircle } from "lucide-react";
import type { PendingAiAction } from "@/context/remembrance.types";

interface WorkspaceAiConfirmationCardProps {
  action: PendingAiAction;
  onConfirm: () => void;
  onCancel: () => void;
}

export const WorkspaceAiConfirmationCard: React.FC<WorkspaceAiConfirmationCardProps> = ({
  action,
  onConfirm,
  onCancel,
}) => {
  const isHigh = action.severity.toLowerCase() === "high";

  return (
    <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2.5 shadow-sm animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gov-navy dark:text-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-gov-saffron shrink-0" />
          <span>Statutory Audit Query</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
          isHigh
            ? "bg-red-50 dark:bg-red-950/60 text-gov-red dark:text-rose-400 border-red-200 dark:border-red-900/50"
            : "bg-amber-50 dark:bg-amber-950/60 text-gov-amber dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
        }`}>
          {action.severity} Severity
        </span>
      </div>

      <div className="text-xs space-y-1">
        <div className="font-semibold text-gov-navy dark:text-white flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">{action.category}</span>
        </div>
        <p className="text-[11px] text-gov-text-secondary dark:text-gray-300 line-clamp-2 leading-relaxed pl-5">
          {action.message}
        </p>
      </div>

      <div className="pt-1 flex items-center justify-end gap-2 border-t border-blue-100 dark:border-blue-900/40">
        <button
          onClick={onCancel}
          type="button"
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gov-text-secondary dark:text-gray-300 text-xs font-medium border border-gov-border dark:border-slate-700 transition-colors"
          title="Dismiss this query"
        >
          <X className="w-3.5 h-3.5 text-gov-red" />
          <span>No, Cancel</span>
        </button>

        <button
          onClick={onConfirm}
          type="button"
          className="flex items-center gap-1 px-3 py-1 rounded bg-gov-blue hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          title="Ask AI Copilot to analyze and provide corrective actions"
        >
          <Check className="w-3.5 h-3.5 text-emerald-300" />
          <span>Yes, Ask AI</span>
        </button>
      </div>
    </div>
  );
};

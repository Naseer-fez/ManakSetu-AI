import React from "react";
import { Check, X, MessageSquareQuote, Undo2 } from "lucide-react";
import type { ComplianceFindingItem } from "@/components/workspace_desk/types";

interface FindingCardActionsProps {
  finding: ComplianceFindingItem;
  onApply: (id: string) => void;
  onIgnore: (id: string) => void;
  onReset: (id: string) => void;
  onAskAi: (finding: ComplianceFindingItem) => void;
}

export const FindingCardActions: React.FC<FindingCardActionsProps> = ({
  finding,
  onApply,
  onIgnore,
  onReset,
  onAskAi,
}) => {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-gov-border/60 dark:border-slate-800 text-xs">
      <div className="flex items-center gap-1.5">
        {finding.resolution === "ignored" ? (
          <button
            type="button"
            onClick={() => onReset(finding.id)}
            className="px-3 py-1 rounded bg-gov-blue hover:bg-blue-700 text-white flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm"
            title="Bring back to active findings"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Bring Back</span>
          </button>
        ) : finding.resolution === "applied" ? (
          <button
            type="button"
            onClick={() => onReset(finding.id)}
            className="px-2.5 py-1 rounded bg-gov-offwhite dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gov-text-secondary dark:text-gray-300 border border-gov-border dark:border-slate-700 flex items-center gap-1 text-[11px] cursor-pointer"
            title="Reset resolution"
          >
            <Undo2 className="w-3 h-3" /> Reopen finding
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onApply(finding.id)}
              disabled={!finding.sourceText.trim() || !finding.replacementText.trim()}
              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-gov-green dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3" /> Apply
            </button>
            <button
              type="button"
              onClick={() => onIgnore(finding.id)}
              className="px-2.5 py-1 rounded bg-gov-offwhite hover:bg-gray-100 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-gov-text-secondary dark:text-gray-400 border border-gov-border dark:border-slate-700 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" /> Ignore
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onAskAi(finding)}
        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-gov-blue dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
        aria-label={`Ask AI about ${finding.clauseLocation}`}
      >
        <MessageSquareQuote className="w-3.5 h-3.5" />
        <span>Ask AI</span>
      </button>
    </div>
  );
};

export default FindingCardActions;

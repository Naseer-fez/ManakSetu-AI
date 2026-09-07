import React from "react";
import { Check, X, MessageSquareQuote, Undo2 } from "lucide-react";
import type { ComplianceFindingItem } from "@/components/workspace_desk/types";
import { FindingStatusBadge } from "@/components/workspace_desk/FindingStatusBadge";

interface FindingCardProps {
  finding: ComplianceFindingItem;
  onApply: (id: string) => void;
  onIgnore: (id: string) => void;
  onReset: (id: string) => void;
  onAskAi: (finding: ComplianceFindingItem) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onApply,
  onIgnore,
  onReset,
  onAskAi,
}) => {
  const isResolved = finding.resolution !== "pending";

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-150 ${
        finding.resolution === "applied"
          ? "bg-apple-mint/5 border-apple-mint/30"
          : finding.resolution === "ignored"
          ? "bg-white/[0.02] border-white/10 opacity-60"
          : "bg-white/[0.04] border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="min-w-0">
          <span className="text-[11px] font-mono text-white/50 block truncate">{finding.clauseLocation}</span>
          <h4 className="text-xs font-semibold text-white/90 mt-0.5">{finding.category}</h4>
        </div>
        <FindingStatusBadge status={finding.status} size="sm" />
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-3">{finding.explanation}</p>

      {finding.suggestedCorrection && (
        <div className="rounded-xl bg-black/40 border border-white/5 p-2.5 mb-3 text-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-apple-mint/80 block mb-1">
            Suggested Correction
          </span>
          <p className="text-slate-200 text-[11px] leading-relaxed">{finding.suggestedCorrection}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
        <div className="flex items-center gap-1.5">
          {isResolved ? (
            <button
              onClick={() => onReset(finding.id)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 flex items-center gap-1 text-[11px]"
              title="Reset resolution"
            >
              <Undo2 className="w-3 h-3" /> Undo ({finding.resolution})
            </button>
          ) : (
            <>
              <button
                onClick={() => onApply(finding.id)}
                className="px-2.5 py-1 rounded-lg bg-apple-mint/20 hover:bg-apple-mint/30 text-apple-mint flex items-center gap-1 text-[11px] font-medium"
              >
                <Check className="w-3 h-3" /> Apply
              </button>
              <button
                onClick={() => onIgnore(finding.id)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 flex items-center gap-1 text-[11px]"
              >
                <X className="w-3 h-3" /> Ignore
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onAskAi(finding)}
          className="px-2.5 py-1 rounded-lg bg-apple-blue/20 hover:bg-apple-blue/30 text-apple-blue hover:text-white flex items-center gap-1 text-[11px] font-medium transition-colors"
          aria-label={`Ask AI about ${finding.clauseLocation}`}
        >
          <MessageSquareQuote className="w-3.5 h-3.5" />
          <span>Ask AI</span>
        </button>
      </div>
    </div>
  );
};

import React from "react";
import type { ComplianceFindingItem } from "@/components/workspace_desk/types";
import { FindingStatusBadge } from "@/components/workspace_desk/FindingStatusBadge";
import { FindingCardActions } from "@/components/workspace_desk/FindingCardActions";

interface FindingCardProps {
  finding: ComplianceFindingItem;
  onApply: (id: string) => void;
  onIgnore: (id: string) => void;
  onReset: (id: string) => void;
  onAskAi: (finding: ComplianceFindingItem) => void;
  onCorrectionChange: (id: string, value: string) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onApply,
  onIgnore,
  onReset,
  onAskAi,
  onCorrectionChange,
}) => {
  return (
    <div
      className={`rounded-lg border p-3.5 transition-all duration-150 ${
        finding.resolution === "applied"
          ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
          : finding.resolution === "ignored"
          ? "bg-gray-50/60 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800 opacity-60"
          : "bg-white dark:bg-slate-900/80 border-gov-border dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-700 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <span className="text-[11px] font-mono text-gov-text-secondary dark:text-gray-400 block truncate">
            {finding.clauseLocation}
          </span>
          <h4 className="text-xs font-bold text-gov-navy dark:text-white mt-0.5">{finding.category}</h4>
        </div>
        <FindingStatusBadge status={finding.status} size="sm" />
      </div>

      <p className="text-xs text-gov-text dark:text-gray-300 leading-relaxed mb-3">{finding.explanation}</p>

      {finding.suggestedCorrection && (
        <div className="rounded bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-800 p-2.5 mb-3 text-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gov-green dark:text-emerald-400 block mb-1">
            Suggested Statutory Correction
          </span>
          <textarea
            value={finding.replacementText}
            onChange={(event) => onCorrectionChange(finding.id, event.target.value)}
            rows={3}
            className="w-full resize-y rounded bg-white dark:bg-[#080d15] border border-gov-border dark:border-slate-700 text-gov-text dark:text-gray-100 text-[11px] leading-relaxed p-2 outline-none focus:border-gov-blue dark:focus:border-blue-500"
            aria-label={`Replacement text for ${finding.clauseLocation}`}
          />
        </div>
      )}

      {finding.applyError && <p className="text-[11px] text-gov-red dark:text-red-400 mb-3">{finding.applyError}</p>}

      <FindingCardActions
        finding={finding}
        onApply={onApply}
        onIgnore={onIgnore}
        onReset={onReset}
        onAskAi={onAskAi}
      />
    </div>
  );
};


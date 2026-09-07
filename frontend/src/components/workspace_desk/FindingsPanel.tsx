import React, { useState } from "react";
import { AlertCircle, EyeOff, ShieldCheck } from "lucide-react";
import type { ComplianceFindingItem, FindingFilterTab } from "@/components/workspace_desk/types";
import { FindingCard } from "@/components/workspace_desk/FindingCard";
import { filterFindings, getIgnoredCount } from "@/components/workspace_desk/workspace.utils";
import { FindingsFilterBar } from "@/components/workspace_desk/FindingsFilterBar";

interface FindingsPanelProps {
  findings: ComplianceFindingItem[];
  onApplyFinding: (id: string) => void;
  onIgnoreFinding: (id: string) => void;
  onResetFinding: (id: string) => void;
  onRestoreAllIgnored?: () => void;
  onAskAiForFinding: (finding: ComplianceFindingItem) => void;
  onCorrectionChange: (id: string, value: string) => void;
}

export const FindingsPanel: React.FC<FindingsPanelProps> = ({
  findings,
  onApplyFinding,
  onIgnoreFinding,
  onResetFinding,
  onRestoreAllIgnored,
  onAskAiForFinding,
  onCorrectionChange,
}) => {
  const [filter, setFilter] = useState<FindingFilterTab>("all");
  const filtered = filterFindings(findings, filter);
  const ignoredCount = getIgnoredCount(findings);

  return (
    <section className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Statutory Findings Header */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/40 px-3.5 py-2 flex items-center justify-between text-amber-800 dark:text-amber-300 text-[11px] shrink-0">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="font-semibold uppercase tracking-wider">Statutory Audit Findings</span>
        </div>
        <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-mono">
          BIS & QCO Clause Matrix
        </span>
      </div>

      {/* Filter Tabs with Left Active and Right Ignored Tabs */}
      <FindingsFilterBar
        filter={filter}
        onSelectFilter={setFilter}
        filteredCount={filtered.length}
        ignoredCount={ignoredCount}
        onRestoreAllIgnored={onRestoreAllIgnored}
      />

      {/* Scrollable Findings Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 bg-gov-offwhite dark:bg-[#0a0f18]">
        {filtered.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-gov-text-secondary dark:text-gray-400 text-xs space-y-2">
            {filter === "ignored" ? (
              <>
                <EyeOff className="w-6 h-6 text-amber-500 opacity-60 mb-1" />
                <p className="font-medium text-gov-navy dark:text-gray-200">No ignored findings</p>
                <p className="text-[11px] max-w-xs">
                  Findings marked as ignored will appear here so you can review or restore them at any time.
                </p>
              </>
            ) : (
              <>
                <ShieldCheck className="w-6 h-6 text-gov-green dark:text-emerald-400 opacity-60 mb-1" />
                <p className="font-medium text-gov-navy dark:text-gray-200">No findings matching "{filter}"</p>
                <p className="text-[11px] max-w-xs">All specification clauses conform to evaluated standards in this category.</p>
              </>
            )}
          </div>
        ) : (
          filtered.map((item) => (
            <FindingCard
              key={item.id}
              finding={item}
              onApply={onApplyFinding}
              onIgnore={onIgnoreFinding}
              onReset={onResetFinding}
              onAskAi={onAskAiForFinding}
              onCorrectionChange={onCorrectionChange}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default FindingsPanel;

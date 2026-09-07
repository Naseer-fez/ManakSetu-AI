import React, { useState } from "react";
import { AlertCircle, Filter } from "lucide-react";
import type { ComplianceFindingItem, FindingStatus } from "@/components/workspace_desk/types";
import { FindingCard } from "@/components/workspace_desk/FindingCard";
import { filterFindings } from "@/components/workspace_desk/workspace.utils";

interface FindingsPanelProps {
  findings: ComplianceFindingItem[];
  onApplyFinding: (id: string) => void;
  onIgnoreFinding: (id: string) => void;
  onResetFinding: (id: string) => void;
  onAskAiForFinding: (finding: ComplianceFindingItem) => void;
  onCorrectionChange: (id: string, value: string) => void;
}

export const FindingsPanel: React.FC<FindingsPanelProps> = ({
  findings,
  onApplyFinding,
  onIgnoreFinding,
  onResetFinding,
  onAskAiForFinding,
  onCorrectionChange,
}) => {
  const [filter, setFilter] = useState<"all" | FindingStatus>("all");
  const filtered = filterFindings(findings, filter);

  return (
    <section className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Sample UI Non-authoritative Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/40 px-3.5 py-2 flex items-center gap-2 text-amber-800 dark:text-amber-300 text-[11px] shrink-0">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="font-semibold uppercase tracking-wider">Statutory Audit Findings</span>
      </div>

      {/* Filter Tabs Header */}
      <div className="px-4 py-2.5 border-b border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/50 flex items-center justify-between shrink-0 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-xs text-gov-navy dark:text-gray-200 shrink-0">
          <Filter className="w-3.5 h-3.5 text-gov-text-secondary dark:text-gray-400" />
          <span className="font-bold">Filter ({filtered.length})</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(["all", "critical", "warning", "passed", "needs_verification"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                filter === tab
                  ? "bg-gov-navy text-white dark:bg-blue-600 dark:text-white shadow-sm"
                  : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
              }`}
            >
              {tab === "all" ? "All" : tab === "needs_verification" ? "Verify" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Findings Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 bg-gov-offwhite dark:bg-[#0a0f18]">
        {filtered.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-gov-text-secondary dark:text-gray-400 text-xs">
            <p>No findings matching the selected filter.</p>
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

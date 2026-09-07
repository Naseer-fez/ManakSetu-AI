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
    <section className="flex flex-col h-full min-h-0 apple-glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Sample UI Non-authoritative Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3.5 py-2 flex items-center gap-2 text-amber-300 text-[11px] shrink-0">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span className="font-semibold uppercase tracking-wider">Sample UI — connect audit service</span>
      </div>

      {/* Filter Tabs Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-xs text-white/70 shrink-0">
          <Filter className="w-3.5 h-3.5 text-white/50" />
          <span className="font-medium">Filter ({filtered.length})</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(["all", "critical", "warning", "passed", "needs_verification"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filter === tab
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {tab === "all" ? "All" : tab === "needs_verification" ? "Verify" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Findings Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3">
        {filtered.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-white/40 text-xs">
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

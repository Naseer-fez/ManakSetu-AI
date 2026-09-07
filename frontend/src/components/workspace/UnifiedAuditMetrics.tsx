import React from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, Layers, FileCheck } from "lucide-react";
import { clsx } from "clsx";
import type { WorkspaceAnalysis } from "../../types";

interface UnifiedAuditMetricsProps {
  analysis: WorkspaceAnalysis;
}

export const UnifiedAuditMetrics: React.FC<UnifiedAuditMetricsProps> = ({ analysis }) => {
  const { compliance_run, report } = analysis;
  const isBlocked = compliance_run.export_blocked;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-white/10 bg-black/20 shrink-0">
      {/* QCO Mandatory Coverage */}
      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/40 block">QCO Coverage</span>
          <span className="text-xl font-bold text-apple-mint mt-0.5 block">{compliance_run.coverage}%</span>
        </div>
        <div className="p-2 rounded-xl bg-apple-mint/15 text-apple-mint">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Compliance Gate Status */}
      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/40 block">Audit Gate</span>
          <span className={clsx("text-xs font-semibold mt-1 inline-flex items-center gap-1", isBlocked ? "text-apple-amber" : "text-apple-mint")}>
            {isBlocked ? <><AlertTriangle className="w-3.5 h-3.5" /> Action Req.</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Ready</>}
          </span>
        </div>
        <div className={clsx("p-2 rounded-xl", isBlocked ? "bg-apple-amber/15 text-apple-amber" : "bg-apple-mint/15 text-apple-mint")}>
          <FileCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Extracted Specification Items */}
      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/40 block">Extracted Items</span>
          <span className="text-xl font-bold text-white mt-0.5 block">{report.extracted_items_count}</span>
        </div>
        <div className="p-2 rounded-xl bg-apple-blue/15 text-apple-blue">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* Audit Findings Count */}
      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/40 block">Total Findings</span>
          <span className="text-xl font-bold text-apple-amber mt-0.5 block">{compliance_run.findings.length}</span>
        </div>
        <div className="p-2 rounded-xl bg-apple-amber/15 text-apple-amber">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, Layers, FileCheck } from "lucide-react";
import { clsx } from "clsx";
import type { WorkspaceAnalysis } from "@/types";

interface UnifiedAuditMetricsProps {
  analysis: WorkspaceAnalysis;
}

export const UnifiedAuditMetrics: React.FC<UnifiedAuditMetricsProps> = ({ analysis }) => {
  const { compliance_run, report } = analysis;
  const isBlocked = compliance_run.export_blocked;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/40 shrink-0">
      {/* QCO Mandatory Coverage */}
      <div className="p-3 rounded-lg bg-white dark:bg-[#0c1626] border border-gov-border dark:border-slate-800 flex items-center justify-between shadow-2xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 block">QCO Coverage</span>
          <span className="text-xl font-bold text-gov-green dark:text-emerald-400 mt-0.5 block">{compliance_run.coverage}%</span>
        </div>
        <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Compliance Gate Status */}
      <div className="p-3 rounded-lg bg-white dark:bg-[#0c1626] border border-gov-border dark:border-slate-800 flex items-center justify-between shadow-2xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 block">Audit Gate</span>
          <span className={clsx("text-xs font-semibold mt-1 inline-flex items-center gap-1", isBlocked ? "text-gov-amber dark:text-amber-400" : "text-gov-green dark:text-emerald-400")}>
            {isBlocked ? <><AlertTriangle className="w-3.5 h-3.5" /> Action Req.</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Ready</>}
          </span>
        </div>
        <div className={clsx("p-2 rounded", isBlocked ? "bg-amber-50 dark:bg-amber-950/40 text-gov-amber dark:text-amber-400" : "bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400")}>
          <FileCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Extracted Specification Items */}
      <div className="p-3 rounded-lg bg-white dark:bg-[#0c1626] border border-gov-border dark:border-slate-800 flex items-center justify-between shadow-2xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 block">Extracted Items</span>
          <span className="text-xl font-bold text-gov-navy dark:text-white mt-0.5 block">{report.extracted_items_count}</span>
        </div>
        <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 text-gov-blue dark:text-blue-400">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* Audit Findings Count */}
      <div className="p-3 rounded-lg bg-white dark:bg-[#0c1626] border border-gov-border dark:border-slate-800 flex items-center justify-between shadow-2xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 block">Total Findings</span>
          <span className="text-xl font-bold text-gov-amber dark:text-amber-400 mt-0.5 block">{compliance_run.findings.length}</span>
        </div>
        <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-gov-amber dark:text-amber-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

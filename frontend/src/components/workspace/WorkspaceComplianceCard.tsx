import React from "react";
import { CheckCircle2, AlertTriangle, Download, FileCheck } from "lucide-react";
import { clsx } from "clsx";
import type { WorkspaceAnalysis } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface WorkspaceComplianceCardProps {
  analysis: WorkspaceAnalysis;
  onExport: (format: "pdf" | "docx") => void;
  exportBusy: boolean;
}

export const WorkspaceComplianceCard: React.FC<WorkspaceComplianceCardProps> = ({
  analysis,
  onExport,
  exportBusy,
}) => {
  const { compliance_run } = analysis;

  return (
    <section className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Fixed Card Header */}
      <div className="px-5 py-3 border-b border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-gov-green dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-gov-navy dark:text-white tracking-tight">Compliance Evaluation Results</h3>
        </div>
        <span className="text-[10px] text-gov-text-secondary dark:text-gray-400 px-2.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-gov-border dark:border-slate-700">
          Dataset: {compliance_run.dataset_version}
        </span>
      </div>

      {/* Internal Scrollable Content Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gov-offwhite dark:bg-[#0a0f18]">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 block">QCO Coverage</span>
            <span className="text-xl font-bold text-gov-green dark:text-emerald-400 mt-1 block">{compliance_run.coverage}%</span>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 block">Status</span>
            <span className={clsx("text-xs font-semibold mt-2 inline-flex items-center gap-1", compliance_run.export_blocked ? "text-amber-600 dark:text-amber-400" : "text-gov-green dark:text-emerald-400")}>
              {compliance_run.export_blocked ? <><AlertTriangle className="w-3 h-3" /> Review</> : <><CheckCircle2 className="w-3 h-3" /> Ready</>}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-center shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 block">Findings</span>
            <span className="text-xl font-bold text-gov-navy dark:text-white mt-1 block">{compliance_run.findings.length}</span>
          </div>
        </div>

        {/* Detailed Findings List */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-gov-navy dark:text-gray-200 uppercase tracking-wider block">
            Detailed Audit Findings ({compliance_run.findings.length})
          </span>
          <div className="space-y-2">
            {compliance_run.findings.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-gov-border dark:border-slate-700/80 flex items-start gap-2.5 text-xs shadow-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-gov-navy dark:text-white truncate">{item.category.replace(/^\*+\s*|\*+/g, "").trim()}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gov-offwhite dark:bg-slate-700 text-gov-text-secondary dark:text-gray-300 uppercase font-semibold border border-gov-border dark:border-slate-600">{item.severity}</span>
                  </div>
                  <div className="text-gov-text dark:text-gray-300 leading-relaxed text-[11px]">
                    <MarkdownRenderer content={item.message} className="text-[11px] leading-relaxed" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Export Footer */}
      <div className="p-3 border-t border-gov-border dark:border-slate-800 bg-white dark:bg-[#111927] flex items-center justify-between shrink-0">
        <span className="text-[11px] text-gov-text-secondary dark:text-gray-400">Export Official Package:</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onExport("pdf")} disabled={exportBusy} className="flex items-center gap-1 px-3 py-1.5 rounded bg-gov-blue hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-sm">
            <Download className="w-3 h-3" /> PDF
          </button>
          <button onClick={() => onExport("docx")} disabled={exportBusy} className="flex items-center gap-1 px-3 py-1.5 rounded bg-gov-offwhite dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gov-border dark:border-slate-700 disabled:opacity-50 text-gov-navy dark:text-gray-200 text-xs font-semibold transition-colors">
            <Download className="w-3 h-3" /> Word (.docx)
          </button>
        </div>
      </div>
    </section>
  );
};

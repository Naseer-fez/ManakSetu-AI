import React from "react";
import { CheckCircle2, AlertTriangle, Download, FileCheck } from "lucide-react";
import { clsx } from "clsx";
import type { WorkspaceAnalysis } from "../../types";

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
    <section className="flex flex-col h-full min-h-0 apple-glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Fixed Card Header */}
      <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-apple-mint" />
          <h3 className="text-sm font-bold text-white tracking-tight">Compliance Evaluation Results</h3>
        </div>
        <span className="text-[10px] text-white/50 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
          Dataset: {compliance_run.dataset_version}
        </span>
      </div>

      {/* Internal Scrollable Content Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-white/40 block">QCO Coverage</span>
            <span className="text-xl font-bold text-apple-mint mt-1 block">{compliance_run.coverage}%</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-white/40 block">Status</span>
            <span className={clsx("text-xs font-semibold mt-2 inline-flex items-center gap-1", compliance_run.export_blocked ? "text-apple-amber" : "text-apple-mint")}>
              {compliance_run.export_blocked ? <><AlertTriangle className="w-3 h-3" /> Review</> : <><CheckCircle2 className="w-3 h-3" /> Ready</>}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
            <span className="text-[10px] uppercase font-bold text-white/40 block">Findings</span>
            <span className="text-xl font-bold text-white mt-1 block">{compliance_run.findings.length}</span>
          </div>
        </div>

        {/* Detailed Findings List */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block">
            Detailed Audit Findings ({compliance_run.findings.length})
          </span>
          <div className="space-y-2">
            {compliance_run.findings.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-apple-amber shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-white truncate">{item.category}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 uppercase">{item.severity}</span>
                  </div>
                  <p className="text-white/80 leading-relaxed text-[11px]">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Export Footer */}
      <div className="p-3 border-t border-white/10 bg-white/5 flex items-center justify-between shrink-0">
        <span className="text-[11px] text-white/50">Export Official Package:</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onExport("pdf")} disabled={exportBusy} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-semibold transition-colors border border-white/10">
            <Download className="w-3 h-3" /> PDF
          </button>
          <button onClick={() => onExport("docx")} disabled={exportBusy} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-semibold transition-colors border border-white/10">
            <Download className="w-3 h-3" /> Word (.docx)
          </button>
        </div>
      </div>
    </section>
  );
};

import React from "react";
import { CheckCircle2, AlertTriangle, Layers, BookOpen } from "lucide-react";
import type { TenderAnalysisReport } from "../../types";

interface WorkspaceAuditContentProps {
  report?: TenderAnalysisReport | null;
}

export const WorkspaceAuditContent: React.FC<WorkspaceAuditContentProps> = ({ report }) => {
  if (!report) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-white/50">
        <AlertTriangle className="w-8 h-8 text-apple-amber mb-2" />
        <p className="text-xs font-semibold text-white">Parsed audit details unavailable</p>
        <p className="text-[11px] text-white/40 mt-1">Switch to "PDF View" to inspect original file.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
          <span className="text-[10px] uppercase font-bold text-white/40 block">Line Items</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{report.extracted_items_count}</span>
        </div>
        <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
          <span className="text-[10px] uppercase font-bold text-white/40 block">Violations</span>
          <span className="text-lg font-bold text-apple-amber mt-0.5 block">{report.compliance_issues.length}</span>
        </div>
        <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-center">
          <span className="text-[10px] uppercase font-bold text-white/40 block">QCO Coverage</span>
          <span className="text-lg font-bold text-apple-mint mt-0.5 block">{report.mandatory_qco_coverage}%</span>
        </div>
      </div>

      {/* Extracted Items */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold px-1">
          <Layers className="w-3.5 h-3.5 text-apple-blue" />
          <span>Extracted Tender Clauses & Items ({report.items.length})</span>
        </div>
        {report.items.map(item => (
          <div key={item.item_id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-2">
            <div className="font-semibold text-white">Item #{item.item_id}: {item.product_title}</div>
            <p className="text-white/60 text-[11px] leading-relaxed">{item.spec_summary}</p>
            {item.recommended_standards.length > 0 && (
              <div className="p-2 rounded-xl bg-apple-blue/10 border border-apple-blue/20 text-blue-300 flex items-start gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-apple-mint shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">{item.recommended_standards[0].standard.is_code}</strong>: {item.recommended_standards[0].standard.title}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Spec Clause Text preview if present */}
      {report.complete_spec_clause_text && (
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-white/70">
            <BookOpen className="w-3.5 h-3.5 text-apple-mint" />
            <span>Harmonized BIS Tender Clause</span>
          </div>
          <pre className="text-[11px] text-white/60 whitespace-pre-wrap font-mono bg-black/40 p-2.5 rounded-xl max-h-40 overflow-y-auto">
            {report.complete_spec_clause_text}
          </pre>
        </div>
      )}
    </div>
  );
};

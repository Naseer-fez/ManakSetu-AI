import React from "react";
import { CheckCircle2, AlertTriangle, Layers, BookOpen } from "lucide-react";
import type { TenderAnalysisReport } from "@/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface WorkspaceAuditContentProps {
  report?: TenderAnalysisReport | null;
}

export const WorkspaceAuditContent: React.FC<WorkspaceAuditContentProps> = ({ report }) => {
  if (!report) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gov-text-secondary dark:text-gray-400">
        <AlertTriangle className="w-8 h-8 text-gov-amber mb-2" />
        <p className="text-xs font-semibold text-gov-navy dark:text-white">Parsed audit details unavailable</p>
        <p className="text-[11px] text-gov-text-secondary dark:text-gray-400 mt-1">Switch to "PDF View" to inspect original file.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-gov-offwhite dark:bg-[#0a0f18]">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 block">Line Items</span>
          <span className="text-lg font-bold text-gov-navy dark:text-white mt-0.5 block">{report.extracted_items_count}</span>
        </div>
        <div className="p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 block">Violations</span>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">{report.compliance_issues.length}</span>
        </div>
        <div className="p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 block">QCO Coverage</span>
          <span className="text-lg font-bold text-gov-green dark:text-emerald-400 mt-0.5 block">{report.mandatory_qco_coverage}%</span>
        </div>
      </div>

      {/* Extracted Items */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-gov-navy dark:text-gray-200 text-xs font-bold px-1">
          <Layers className="w-3.5 h-3.5 text-gov-blue dark:text-blue-400" />
          <span>Extracted Tender Clauses & Items ({report.items.length})</span>
        </div>
        {report.items.map(item => (
          <div key={item.item_id} className="p-3.5 rounded-lg bg-white dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-xs space-y-2 shadow-sm">
            <div className="font-bold text-gov-navy dark:text-white">Item #{item.item_id}: {item.product_title.replace(/^\*+\s*|\*+/g, "").trim()}</div>
            <div className="text-gov-text-secondary dark:text-gray-300 text-[11px] leading-relaxed">
              <MarkdownRenderer content={item.spec_summary} className="text-[11px] leading-relaxed" />
            </div>
            {item.recommended_standards.length > 0 && (
              <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-gov-navy dark:text-blue-300 flex items-start gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-gov-green dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gov-blue dark:text-blue-300 font-bold">{item.recommended_standards[0].standard.is_code}</strong>: {item.recommended_standards[0].standard.title}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Spec Clause Text preview if present */}
      {report.complete_spec_clause_text && (
        <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800/80 border border-gov-border dark:border-slate-700 text-xs space-y-2 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-gov-navy dark:text-gray-200">
            <BookOpen className="w-3.5 h-3.5 text-gov-green dark:text-emerald-400" />
            <span>Harmonized BIS Tender Clause</span>
          </div>
          <pre className="text-[11px] text-gov-text dark:text-gray-300 whitespace-pre-wrap font-mono bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-800 p-3 rounded-lg max-h-40 overflow-y-auto">
            {report.complete_spec_clause_text}
          </pre>
        </div>
      )}
    </div>
  );
};

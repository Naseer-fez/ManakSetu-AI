import React from "react";
import { CheckCircle } from "lucide-react";
import type { TenderAnalysisReport } from "@/types";

interface TenderReportViewProps {
  report: TenderAnalysisReport;
}

export const TenderReportView: React.FC<TenderReportViewProps> = ({ report }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-lg border border-gov-border dark:border-slate-800">
          <div className="text-xs text-gov-text-secondary dark:text-slate-400">Extracted Items</div>
          <div className="text-2xl font-bold text-gov-navy dark:text-white mt-1">{report.extracted_items_count}</div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-lg border border-gov-border dark:border-slate-800">
          <div className="text-xs text-gov-text-secondary dark:text-slate-400">Compliance Issues</div>
          <div className="text-2xl font-bold text-gov-amber dark:text-amber-400 mt-1">{report.compliance_issues.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-lg border border-gov-border dark:border-slate-800">
          <div className="text-xs text-gov-text-secondary dark:text-slate-400">Mandatory QCO Coverage</div>
          <div className="text-2xl font-bold text-gov-green dark:text-emerald-400 mt-1">{report.mandatory_qco_coverage}%</div>
        </div>
      </div>

      <div className="space-y-3">
        {report.items.map((item) => (
          <div key={item.item_id} className="bg-white dark:bg-slate-900/60 p-4 rounded-lg border border-gov-border dark:border-slate-800 text-xs">
            <div className="font-bold text-gov-navy dark:text-white mb-1">Item #{item.item_id}: {item.product_title}</div>
            <div className="text-gov-text-secondary dark:text-slate-400 mb-2">{item.spec_summary}</div>
            {item.recommended_standards.length > 0 && (
              <div className="bg-blue-50 dark:bg-slate-800/60 p-2 rounded text-gov-blue dark:text-blue-300 flex items-center gap-2 border border-blue-200 dark:border-slate-700">
                <CheckCircle className="w-4 h-4 text-gov-green dark:text-emerald-400 shrink-0" />
                <span>Recommended Standard: {item.recommended_standards[0].standard.is_code} ({item.recommended_standards[0].standard.title})</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

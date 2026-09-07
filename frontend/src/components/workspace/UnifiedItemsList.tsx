import React from "react";
import { CheckCircle2, Layers } from "lucide-react";
import type { ExtractedLineItem } from "@/types";

interface UnifiedItemsListProps {
  items: ExtractedLineItem[];
}

export const UnifiedItemsList: React.FC<UnifiedItemsListProps> = ({ items }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-gov-navy dark:text-gray-200 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gov-blue dark:text-blue-400" />
          <span>Extracted Tender Clauses & Items ({items.length})</span>
        </div>
        <span className="text-[10px] text-gov-text-secondary dark:text-gray-400">Grounded from document</span>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.item_id} className="p-4 rounded-lg bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 space-y-2.5 transition-all shadow-2xs hover:border-gray-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-gov-navy dark:text-white tracking-tight">Item #{item.item_id}: {item.product_title}</span>
              {item.cited_standards.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gov-text-secondary dark:text-gray-300 border border-gray-200 dark:border-slate-700 font-mono">
                  Cited: {item.cited_standards.join(", ")}
                </span>
              )}
            </div>

            <p className="text-xs text-gov-text dark:text-gray-200 leading-relaxed bg-gov-offwhite dark:bg-[#0c1421] p-2.5 rounded border border-gov-border dark:border-slate-800">
              {item.spec_summary}
            </p>

            {item.recommended_standards.length > 0 && (
              <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-gov-blue dark:text-blue-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-gov-green dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gov-navy dark:text-white">{item.recommended_standards[0].standard.is_code}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">Mandatory BIS</span>
                  </div>
                  <p className="text-[11px] text-gov-text-secondary dark:text-gray-400 mt-0.5 truncate">{item.recommended_standards[0].standard.title}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

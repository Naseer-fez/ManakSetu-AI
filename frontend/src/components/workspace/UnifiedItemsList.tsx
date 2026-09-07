import React from "react";
import { CheckCircle2, Layers } from "lucide-react";
import type { ExtractedLineItem } from "../../types";

interface UnifiedItemsListProps {
  items: ExtractedLineItem[];
}

export const UnifiedItemsList: React.FC<UnifiedItemsListProps> = ({ items }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-white/80 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-apple-blue" />
          <span>Extracted Tender Clauses & Items ({items.length})</span>
        </div>
        <span className="text-[10px] text-white/40">Grounded from document</span>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.item_id} className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 space-y-2.5 transition-all hover:border-white/15 hover:bg-white/[0.06]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white tracking-tight">Item #{item.item_id}: {item.product_title}</span>
              {item.cited_standards.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white/60 font-mono">
                  Cited: {item.cited_standards.join(", ")}
                </span>
              )}
            </div>

            <p className="text-xs text-white/70 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
              {item.spec_summary}
            </p>

            {item.recommended_standards.length > 0 && (
              <div className="p-2.5 rounded-xl bg-apple-blue/10 border border-apple-blue/20 text-blue-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-apple-mint shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{item.recommended_standards[0].standard.is_code}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-apple-mint/20 text-apple-mint font-semibold">Mandatory BIS</span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-0.5 truncate">{item.recommended_standards[0].standard.title}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

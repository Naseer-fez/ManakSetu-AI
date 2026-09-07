import React, { useState } from "react";
import { ShoppingCart, Search, AlertCircle, Building2, CheckCircle2 } from "lucide-react";
import { useRemembrance } from "@/context/RemembranceContext";
import type { ExtractedLineItem } from "@/types";

export const TenderGemQcoSection: React.FC<{ items: ExtractedLineItem[] }> = ({ items }) => {
  const { setGemSimItem, setActiveTab } = useRemembrance();
  const [filter, setFilter] = useState("");

  const itemsWithMeta = items.map((item) => {
    const hasStd = item.recommended_standards.length > 0;
    const std = hasStd ? item.recommended_standards[0].standard : null;
    const hasQco = Boolean(std?.mandatory_qco?.is_mandatory);
    const ministry = std?.mandatory_qco?.issuing_ministry || (hasStd ? "Ministry of Commerce & Industry (BIS)" : "Unassigned Ministry");
    const isLackOfStandard = !hasStd || item.cited_standards.length === 0;
    return { item, hasStd, std, hasQco, ministry, isLackOfStandard };
  });

  const filtered = itemsWithMeta.filter((x) =>
    x.item.product_title.toLowerCase().includes(filter.toLowerCase()) ||
    x.ministry.toLowerCase().includes(filter.toLowerCase()) ||
    (x.std?.is_code || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-800 space-y-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-border dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/40 text-gov-blue dark:text-blue-400"><ShoppingCart className="w-4 h-4" /></div>
          <div>
            <h4 className="text-xs font-bold text-gov-navy dark:text-white flex items-center gap-2">
              GeM & QCO Statutory Radar
              <span className="text-[10px] font-normal text-gov-text-secondary dark:text-gray-400">(GDS Cross-Mapping)</span>
            </h4>
          </div>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute left-2.5 top-2.5" />
          <input
            value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder="Search ministry or item..."
            className="w-full bg-gov-offwhite dark:bg-[#0c1626] border border-gov-border dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-gov-text dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gov-blue"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {filtered.map(({ item, std, hasQco, ministry, isLackOfStandard }) => (
          <div key={item.item_id} className="p-3 rounded bg-gov-offwhite dark:bg-[#0c1421] border border-gov-border dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gov-navy dark:text-white truncate max-w-xs">{item.product_title}</span>
                {isLackOfStandard ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-gov-amber dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Lack of Cited Standard
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-gov-green dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Standard Grounded: {std?.is_code}
                  </span>
                )}
                {hasQco && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-gov-red dark:text-rose-400 border border-red-200 dark:border-red-900/50">QCO Mandatory</span>}
              </div>
              <div className="text-[11px] text-gov-text-secondary dark:text-gray-400 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-gov-blue dark:text-blue-400 shrink-0" />
                <span className="truncate">Ministry: <strong className="text-gov-text dark:text-gray-200">{ministry}</strong></span>
              </div>
            </div>

            <button
              onClick={() => {
                setGemSimItem(item);
                setActiveTab("gem");
              }}
              className="px-3 py-1 rounded bg-blue-50 dark:bg-blue-950/40 hover:bg-gov-blue dark:hover:bg-blue-700 text-gov-blue dark:text-blue-400 hover:text-white dark:hover:text-white text-[11px] font-semibold border border-blue-200 dark:border-blue-900/50 transition-colors shrink-0"
              title="Preload this tender line item into GeM Simulator tab"
            >
              Simulate in GeM
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { ShoppingCart, Search, AlertCircle, Building2, CheckCircle2 } from "lucide-react";
import { useRemembrance } from "../../context/RemembranceContext";
import type { ExtractedLineItem } from "../../types";

export const TenderGemQcoSection: React.FC<{ items: ExtractedLineItem[] }> = ({ items }) => {
  const { setGemSimItem } = useRemembrance();
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
    <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-apple-mint/15 text-apple-mint"><ShoppingCart className="w-4 h-4" /></div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              GeM & QCO Statutory Radar
              <span className="text-[10px] font-normal text-white/50">(GDS Cross-Mapping)</span>
            </h4>
          </div>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-2.5" />
          <input
            value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder="Search ministry or item..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-apple-mint"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {filtered.map(({ item, std, hasQco, ministry, isLackOfStandard }) => (
          <div key={item.item_id} className="p-3 rounded-2xl bg-black/30 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white truncate max-w-xs">{item.product_title}</span>
                {isLackOfStandard ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-apple-amber/20 text-apple-amber inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Lack of Cited Standard
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-apple-mint/20 text-apple-mint inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Standard Grounded: {std?.is_code}
                  </span>
                )}
                {hasQco && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-apple-red/20 text-apple-red">QCO Mandatory</span>}
              </div>
              <div className="text-[11px] text-white/50 flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-apple-blue shrink-0" />
                <span className="truncate">Ministry: <strong className="text-white/80">{ministry}</strong></span>
              </div>
            </div>

            <button
              onClick={() => setGemSimItem(item)}
              className="px-3 py-1 rounded-xl bg-apple-mint/20 hover:bg-apple-mint/30 text-apple-mint text-[11px] font-semibold border border-apple-mint/30 transition-colors shrink-0"
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

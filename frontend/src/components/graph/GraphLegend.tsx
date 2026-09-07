import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

export const GraphLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-6 left-6 z-20 pointer-events-auto">
      <div className="apple-glass-dark rounded-2xl p-3 border border-white/10 shadow-2xl backdrop-blur-xl text-xs space-y-2 select-none">
        <div
          className="flex items-center justify-between gap-3 cursor-pointer text-white/70 hover:text-white"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-white/50">
            <Info className="w-3.5 h-3.5 text-apple-blue" /> Graph Key
          </span>
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>

        {!collapsed && (
          <div className="space-y-1.5 pt-1 text-[11px] text-white/70">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-apple-red border border-white/40" />
              <span>Mandatory QCO Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-apple-blue border border-white/40" />
              <span>Voluntary Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-gradient-to-r from-apple-indigo to-apple-blue" />
              <span>Normative Reference</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t border-dashed border-white/60" />
              <span>Test Method Code</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-apple-mint" />
              <span>Connected / Focused Path</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

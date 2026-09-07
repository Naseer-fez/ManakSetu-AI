import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

export const GraphLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-6 left-6 z-20 pointer-events-auto">
      <div className="bg-white/95 dark:bg-[#0c1626]/95 rounded-lg p-3 border border-gov-border dark:border-slate-700 shadow-2xl backdrop-blur-md text-xs space-y-2 select-none">
        <div
          className="flex items-center justify-between gap-3 cursor-pointer text-gov-text hover:text-gov-navy dark:text-gray-300 dark:hover:text-white"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-gov-text-secondary dark:text-gray-400">
            <Info className="w-3.5 h-3.5 text-gov-blue dark:text-blue-400" /> Graph Key
          </span>
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>

        {!collapsed && (
          <div className="space-y-1.5 pt-1 text-[11px] text-gov-text dark:text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-red-200 dark:border-white/40" />
              <span>Mandatory QCO Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-200 dark:border-white/40" />
              <span>Voluntary Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500" />
              <span>Normative Reference</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t border-dashed border-gray-400 dark:border-white/60" />
              <span>Test Method Code</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-emerald-500" />
              <span>Connected / Focused Path</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from "react";
import { Filter, EyeOff, RotateCcw } from "lucide-react";
import type { FindingFilterTab } from "@/components/workspace_desk/types";

interface FindingsFilterBarProps {
  filter: FindingFilterTab;
  onSelectFilter: (tab: FindingFilterTab) => void;
  filteredCount: number;
  ignoredCount: number;
  onRestoreAllIgnored?: () => void;
}

export const FindingsFilterBar: React.FC<FindingsFilterBarProps> = ({
  filter,
  onSelectFilter,
  filteredCount,
  ignoredCount,
  onRestoreAllIgnored,
}) => {
  const activeTabs: Array<{ id: FindingFilterTab; label: string }> = [
    { id: "all", label: "All" },
    { id: "critical", label: "Critical" },
    { id: "warning", label: "Warning" },
    { id: "passed", label: "Passed" },
    { id: "needs_verification", label: "Verify" },
  ];

  return (
    <div className="px-3.5 py-2 border-b border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/50 flex items-center justify-between shrink-0 gap-2 overflow-x-auto">
      {/* Left-aligned Active Filter Tabs */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex items-center gap-1 text-xs text-gov-navy dark:text-gray-200 mr-1.5 shrink-0">
          <Filter className="w-3.5 h-3.5 text-gov-text-secondary dark:text-gray-400" />
          <span className="font-bold">({filteredCount})</span>
        </div>
        {activeTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectFilter(tab.id)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              filter === tab.id
                ? "bg-gov-navy text-white dark:bg-blue-600 dark:text-white shadow-sm"
                : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white hover:bg-white dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right-aligned Ignored Tab & Bulk Actions */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto pl-2 border-l border-gov-border/60 dark:border-slate-800">
        {filter === "ignored" && ignoredCount > 0 && onRestoreAllIgnored && (
          <button
            type="button"
            onClick={onRestoreAllIgnored}
            className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gov-blue dark:text-blue-400 border border-gov-border dark:border-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
            title="Restore all ignored findings back to active audit"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Restore All</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelectFilter("ignored")}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            filter === "ignored"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-gov-text-secondary dark:text-gray-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          }`}
        >
          <EyeOff className="w-3 h-3" />
          <span>Ignored</span>
          {ignoredCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filter === "ignored"
                  ? "bg-white text-amber-700"
                  : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
              }`}
            >
              {ignoredCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default FindingsFilterBar;

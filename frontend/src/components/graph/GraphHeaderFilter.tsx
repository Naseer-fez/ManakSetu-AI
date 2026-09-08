import React from "react";
import { Layers, Search, X } from "lucide-react";
import { clsx } from "clsx";
import { getDivisionLabel, getDivisionDescription } from "@/components/graph/graph-division.constants";

interface GraphHeaderFilterProps {
  divisions: string[];
  selectedDivision: string;
  onSelectDivision: (div: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const GraphHeaderFilter: React.FC<GraphHeaderFilterProps> = ({
  divisions,
  selectedDivision,
  onSelectDivision,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-3 pointer-events-none">
      {/* Division Section: flex-1, no horizontal scroll, fits available width */}
      <div className="pointer-events-auto bg-[#0c1626]/95 p-1.5 rounded-2xl border border-slate-700/80 flex items-center gap-1.5 shadow-2xl backdrop-blur-md flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 flex items-center gap-1 shrink-0">
          <Layers className="w-3.5 h-3.5 text-gov-saffron" /> Divisions
        </span>

        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {divisions.map((div) => {
            const label = getDivisionLabel(div);
            const desc = getDivisionDescription(div);
            const isActive = selectedDivision === div;
            return (
              <button
                key={div}
                onClick={() => onSelectDivision(div)}
                title={`${div}: ${desc}`}
                className={clsx(
                  "flex-1 min-w-0 py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all flex flex-col items-center justify-center text-center leading-tight truncate",
                  isActive
                    ? "bg-gov-blue text-white shadow-md ring-1 ring-blue-300/40"
                    : "text-gray-300 hover:text-white hover:bg-slate-800/80 bg-slate-900/40 border border-slate-700/40"
                )}
              >
                <span className="truncate w-full block font-medium">{label}</span>
                <span className="text-[9px] opacity-65 truncate w-full hidden xl:block font-normal">
                  {div === "All" ? "All Bureau codes" : desc.split(",")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar: compact 44px shrink-0 */}
      <div className="pointer-events-auto bg-[#0c1626]/95 px-3 py-2 rounded-2xl border border-slate-700/80 flex items-center gap-2 shadow-2xl backdrop-blur-md w-44 shrink-0">
        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search IS..."
          className="bg-transparent text-xs text-gray-100 placeholder-gray-400 focus:outline-none w-full"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="text-gray-400 hover:text-white p-0.5"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

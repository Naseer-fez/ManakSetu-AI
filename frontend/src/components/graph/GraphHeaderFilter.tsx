import React from "react";
import { Layers, Search, X } from "lucide-react";
import { clsx } from "clsx";

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
    <div className="absolute top-6 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
      {/* Division Filter Pills */}
      <div className="pointer-events-auto apple-glass-dark px-2 py-1.5 rounded-full border border-white/10 flex items-center gap-1 shadow-2xl backdrop-blur-xl max-w-[calc(100%-18rem)] overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2 flex items-center gap-1 shrink-0">
          <Layers className="w-3 h-3 text-apple-indigo" /> Division
        </span>
        {divisions.map((div) => (
          <button
            key={div}
            onClick={() => onSelectDivision(div)}
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0",
              selectedDivision === div
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {div}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="pointer-events-auto apple-glass-dark px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl backdrop-blur-xl w-64 shrink-0">
        <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by IS standard..."
          className="bg-transparent text-xs text-white placeholder-white/40 focus:outline-none w-full"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="text-white/40 hover:text-white p-0.5"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

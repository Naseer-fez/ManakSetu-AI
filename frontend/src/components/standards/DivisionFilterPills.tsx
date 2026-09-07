import React from "react";
import { Filter } from "lucide-react";
import { clsx } from "clsx";

interface DivisionFilterPillsProps {
  division: string;
  onSelectDivision: (div: string) => void;
}

const DIVISIONS = ["All", "Civil", "Electrical", "Electronics", "Solar"];

export const DivisionFilterPills: React.FC<DivisionFilterPillsProps> = ({
  division,
  onSelectDivision,
}) => (
  <div className="flex justify-center">
    <div className="apple-glass-dark p-1 rounded-full flex items-center gap-1 border border-white/10 shadow-lg">
      <span className="text-[10px] uppercase font-bold text-white/40 px-2.5 flex items-center gap-1">
        <Filter className="w-3 h-3 text-apple-indigo" /> Division
      </span>
      {DIVISIONS.map(div => (
        <button
          key={div}
          onClick={() => onSelectDivision(div)}
          className={clsx(
            "px-3.5 py-1 rounded-full text-xs font-medium transition-all",
            division === div || (div === "All" && !division)
              ? "bg-white/20 text-white shadow-md font-semibold"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          {div}
        </button>
      ))}
    </div>
  </div>
);

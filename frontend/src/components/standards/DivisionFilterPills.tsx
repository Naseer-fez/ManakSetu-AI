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
    <div className="bg-white dark:bg-[#111927] p-1 rounded-full flex items-center gap-1 border border-gov-border dark:border-slate-800 shadow-sm">
      <span className="text-[10px] uppercase font-bold text-gov-text-secondary dark:text-gray-400 px-2.5 flex items-center gap-1">
        <Filter className="w-3 h-3 text-gov-blue dark:text-blue-400" /> Division
      </span>
      {DIVISIONS.map(div => (
        <button
          key={div}
          onClick={() => onSelectDivision(div)}
          className={clsx(
            "px-3.5 py-1 rounded-full text-xs font-semibold transition-all",
            division === div || (div === "All" && !division)
              ? "bg-gov-navy text-white dark:bg-blue-600 dark:text-white shadow-sm"
              : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white hover:bg-gov-offwhite dark:hover:bg-slate-800"
          )}
        >
          {div}
        </button>
      ))}
    </div>
  </div>
);

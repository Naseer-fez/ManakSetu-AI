import React from "react";
import { clsx } from "clsx";

export interface DivisionFilterBarProps {
  division: string;
  onSelectDivision: (div: string) => void;
}

const DIVISIONS = [
  { id: "All", label: "All Divisions" },
  { id: "Civil", label: "Civil Engineering" },
  { id: "Electrical", label: "Electrotechnical" },
  { id: "Electronics", label: "Electronics & Solar" },
  { id: "Mechanical", label: "Mechanical & Safety" },
];

export const DivisionFilterBar: React.FC<DivisionFilterBarProps> = ({
  division,
  onSelectDivision,
}) => {
  const current = division || "All";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-gov-text-secondary dark:text-gray-400 mr-1">
        Division:
      </span>
      {DIVISIONS.map((d) => {
        const active = current === d.id;
        return (
          <button
            key={d.id}
            onClick={() => onSelectDivision(d.id)}
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors border select-none",
              active
                ? "bg-gov-blue text-white border-gov-blue shadow-sm"
                : "bg-white dark:bg-slate-800 text-gov-text dark:text-gray-300 hover:bg-gov-offwhite dark:hover:bg-slate-700 border-gov-border dark:border-slate-700"
            )}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
};

export default DivisionFilterBar;

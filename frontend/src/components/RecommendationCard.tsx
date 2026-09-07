import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, ChevronRight } from "lucide-react";
import type { StandardRecommendation } from "@/types";

interface RecommendationCardProps {
  rec: StandardRecommendation;
  isSelected: boolean;
  onSelect: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  rec,
  isSelected,
  onSelect,
}) => {
  const std = rec.standard;
  const isQco = std.mandatory_qco.is_mandatory;
  const isSuperseded = Boolean(rec.deprecation_warning);

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "bg-blue-50/80 dark:bg-slate-800/90 border-gov-blue ring-2 ring-gov-blue/20 shadow-md"
          : "bg-white dark:bg-[#111927] border-gov-border dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 hover:bg-gov-offwhite dark:hover:bg-slate-800/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base text-gov-navy dark:text-white tracking-wide">{std.is_code}</span>
            <span className="text-xs text-gov-text-secondary dark:text-slate-400">:{std.year}</span>
            {std.reaffirmation_year && (
              <span className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-gov-blue dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 rounded">
                Reaffirmed {std.reaffirmation_year}
              </span>
            )}
            <span className="text-[10px] uppercase font-bold bg-gray-100 dark:bg-slate-800 text-gov-text dark:text-slate-300 px-2 py-0.5 rounded">
              {std.division}
            </span>
          </div>
          <h3 className="font-medium text-sm text-gov-text dark:text-slate-200 mt-1 leading-snug">{std.title}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-gov-green dark:text-emerald-400">
            {Math.round(rec.relevance_score * 100)}% Match
          </div>
          <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-gov-green dark:bg-emerald-400 rounded-full"
              style={{ width: `${Math.min(rec.relevance_score * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-gov-text-secondary dark:text-slate-400 line-clamp-2 mb-3">{std.scope}</p>

      {isSuperseded && (
        <div className="mb-2.5 flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 p-2 rounded-lg text-xs text-gov-red dark:text-red-300">
          <AlertTriangle className="w-4 h-4 text-gov-red dark:text-red-400 shrink-0" />
          <span>{rec.deprecation_warning}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gov-border dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {isQco ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-gov-amber dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded">
              <ShieldAlert className="w-3 h-3 text-gov-amber dark:text-amber-400" />
              {std.mandatory_qco.scheme} Mandatory
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-gov-text-secondary dark:text-slate-400 bg-gray-100 dark:bg-slate-800/60 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-gray-400 dark:text-slate-500" />
              Voluntary
            </span>
          )}
          {std.amendments.length > 0 && (
            <span className="text-[11px] text-gov-text-secondary dark:text-slate-400 bg-gray-100 dark:bg-slate-800/60 px-2 py-0.5 rounded">
              {std.amendments.length} Amendments
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-gov-blue dark:text-blue-400 font-medium text-[11px]">
          <span>View Spec & Graph</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Layers, Crosshair, X } from "lucide-react";
import { useRemembrance } from "@/context/RemembranceContext";

export const GraphTenderBanner: React.FC<{ tenderCount: number }> = ({ tenderCount }) => {
  const { file, graphFocusTender, setGraphFocusTender } = useRemembrance();

  if (!file || tenderCount === 0) return null;

  return (
    <div className="absolute top-20 left-6 z-20 bg-white/95 dark:bg-[#0c1626]/95 rounded-lg px-3.5 py-2 border border-emerald-500/40 flex items-center gap-3 text-xs shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-gov-green dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-bold text-gov-navy dark:text-white truncate max-w-[200px] block">{file.name}</span>
          <span className="text-[10px] text-gov-text-secondary dark:text-gray-400">{tenderCount} Indian Standards Mapped</span>
        </div>
      </div>

      <button
        onClick={() => setGraphFocusTender(!graphFocusTender)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
          graphFocusTender
            ? "bg-emerald-500 text-white dark:text-black shadow-md"
            : "bg-gov-offwhite hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gov-text dark:text-gray-200 border border-gov-border dark:border-slate-700"
        }`}
      >
        <Crosshair className="w-3 h-3" />
        <span>{graphFocusTender ? "Tender Focus Active" : "Focus Tender ISM"}</span>
      </button>

      {graphFocusTender && (
        <button
          onClick={() => setGraphFocusTender(false)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gov-text-secondary dark:text-white/50 hover:text-gov-navy dark:hover:text-white"
          title="Clear tender focus"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

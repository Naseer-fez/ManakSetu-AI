import React from "react";
import { Layers, Crosshair, X } from "lucide-react";
import { useRemembrance } from "../../context/RemembranceContext";

export const GraphTenderBanner: React.FC<{ tenderCount: number }> = ({ tenderCount }) => {
  const { file, graphFocusTender, setGraphFocusTender } = useRemembrance();

  if (!file || tenderCount === 0) return null;

  return (
    <div className="absolute top-20 left-6 z-20 apple-glass rounded-2xl px-3.5 py-2 border border-apple-mint/30 flex items-center gap-3 text-xs shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-lg bg-apple-mint/20 text-apple-mint">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-semibold text-white truncate max-w-[200px] block">{file.name}</span>
          <span className="text-[10px] text-white/50">{tenderCount} Indian Standards Mapped</span>
        </div>
      </div>

      <button
        onClick={() => setGraphFocusTender(!graphFocusTender)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
          graphFocusTender
            ? "bg-apple-mint text-black shadow-md shadow-apple-mint/20"
            : "bg-white/10 hover:bg-white/15 text-white/80"
        }`}
      >
        <Crosshair className="w-3 h-3" />
        <span>{graphFocusTender ? "Tender Focus Active" : "Focus Tender ISM"}</span>
      </button>

      {graphFocusTender && (
        <button
          onClick={() => setGraphFocusTender(false)}
          className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
          title="Clear tender focus"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

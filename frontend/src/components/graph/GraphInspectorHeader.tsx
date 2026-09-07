import React from "react";
import { X, ShieldAlert, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";
import type { PositionedNode } from "@/components/graph/types";

interface GraphInspectorHeaderProps {
  selectedNode: PositionedNode;
  zoom: number;
  onClose: () => void;
}

export const GraphInspectorHeader: React.FC<GraphInspectorHeaderProps> = ({
  selectedNode,
  zoom,
  onClose,
}) => {
  const isZoomedIn = zoom >= 1.25;

  return (
    <div className="flex justify-between items-start gap-3">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={clsx(
              "font-bold text-white tracking-tight transition-all",
              isZoomedIn ? "text-xl md:text-2xl" : "text-base md:text-lg"
            )}
          >
            {selectedNode.label}
          </h3>
          {selectedNode.is_mandatory ? (
            <span
              className={clsx(
                "inline-flex items-center font-bold bg-apple-red/20 text-apple-red border border-apple-red/30 rounded-full transition-all",
                isZoomedIn ? "text-xs px-3 py-1 gap-1.5" : "text-[10px] px-2.5 py-0.5 gap-1"
              )}
            >
              <ShieldAlert className={isZoomedIn ? "w-3.5 h-3.5 shrink-0" : "w-3 h-3 shrink-0"} />
              <span>Mandatory QCO</span>
            </span>
          ) : (
            <span
              className={clsx(
                "inline-flex items-center font-bold bg-apple-mint/20 text-apple-mint border border-apple-mint/30 rounded-full transition-all",
                isZoomedIn ? "text-xs px-3 py-1 gap-1.5" : "text-[10px] px-2.5 py-0.5 gap-1"
              )}
            >
              <ShieldCheck className={isZoomedIn ? "w-3.5 h-3.5 shrink-0" : "w-3 h-3 shrink-0"} />
              <span>Voluntary</span>
            </span>
          )}
        </div>
        <p
          className={clsx(
            "text-white/70 leading-relaxed line-clamp-3 transition-all",
            isZoomedIn ? "text-sm" : "text-xs"
          )}
        >
          {selectedNode.title}
        </p>
      </div>

      <button
        onClick={onClose}
        type="button"
        className={clsx(
          "rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0",
          isZoomedIn ? "p-2" : "p-1.5"
        )}
        title="Close details card"
      >
        <X className={isZoomedIn ? "w-4 h-4" : "w-3.5 h-3.5"} />
      </button>
    </div>
  );
};

import React from "react";
import { ZoomIn, ZoomOut, RotateCcw, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

interface GraphZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onReload: () => void;
  loading: boolean;
}

export const GraphZoomControls: React.FC<GraphZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onReload,
  loading,
}) => {
  return (
    <div className="absolute top-24 left-6 z-20 pointer-events-auto flex flex-col gap-2">
      <div className="apple-glass-dark rounded-2xl p-1.5 flex flex-col gap-1 shadow-2xl border border-white/10 backdrop-blur-xl">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-px bg-white/10 mx-2" />
        <button
          onClick={onReset}
          title="Reset View"
          className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onReload}
          title="Reload Knowledge Graph"
          className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin text-apple-mint")} />
        </button>
      </div>
    </div>
  );
};

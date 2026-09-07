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
      <div className="bg-white/95 dark:bg-[#0c1626]/95 rounded-lg p-1 flex flex-col gap-1 shadow-2xl border border-gov-border dark:border-slate-700 backdrop-blur-md">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-2 text-gov-text-secondary dark:text-gray-300 hover:text-gov-navy dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-2 text-gov-text-secondary dark:text-gray-300 hover:text-gov-navy dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="h-px bg-gov-border dark:bg-slate-700 mx-2" />
        <button
          onClick={onReset}
          title="Reset View"
          className="p-2 text-gov-text-secondary dark:text-gray-300 hover:text-gov-navy dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onReload}
          title="Reload Knowledge Graph"
          className="p-2 text-gov-text-secondary dark:text-white/70 hover:text-gov-navy dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-all"
        >
          <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin text-gov-green dark:text-emerald-400")} />
        </button>
      </div>
    </div>
  );
};

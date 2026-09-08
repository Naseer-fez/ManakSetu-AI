import React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

interface PdfViewerZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const PdfViewerZoomControls: React.FC<PdfViewerZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  return (
    <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">
      <button
        onClick={onZoomOut}
        disabled={scale <= 0.5}
        className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onResetZoom}
        className="font-mono px-1 hover:text-white text-slate-300"
        title="Reset Zoom to 100%"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        onClick={onZoomIn}
        disabled={scale >= 2.5}
        className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

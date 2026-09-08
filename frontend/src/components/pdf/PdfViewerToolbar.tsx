import React from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ExternalLink, Download } from "lucide-react";

interface PdfViewerToolbarProps {
  title?: string;
  pageNumber: number;
  numPages: number | null;
  scale: number;
  downloadUrl?: string;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const PdfViewerToolbar: React.FC<PdfViewerToolbarProps> = ({
  title = "PDF Document",
  pageNumber,
  numPages,
  scale,
  downloadUrl,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  return (
    <div className="px-3 py-1.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0 select-none">
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        <span className="text-[11px] font-mono text-slate-400 truncate max-w-[160px] sm:max-w-xs">{title}</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Page navigation */}
        <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">
          <button
            onClick={onPrevPage}
            disabled={pageNumber <= 1}
            className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono px-1 min-w-[36px] text-center">
            {pageNumber} / {numPages || "..."}
          </span>
          <button
            onClick={onNextPage}
            disabled={!numPages || pageNumber >= numPages}
            className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
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

        {/* External Link & Download */}
        {downloadUrl && (
          <div className="flex items-center gap-1 ml-1">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Open in new window"
              aria-label="Open PDF in new window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={downloadUrl}
              download={title.endsWith(".pdf") ? title : `${title}.pdf`}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Download PDF"
              aria-label="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

import React from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Download, Eye, Layers } from "lucide-react";
import { PdfViewerZoomControls } from "@/components/pdf/PdfViewerZoomControls";

interface PdfViewerToolbarProps {
  title?: string;
  pageNumber: number;
  numPages: number | null;
  scale: number;
  downloadUrl?: string;
  viewMode: "canvas" | "native";
  onToggleViewMode: () => void;
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
  viewMode,
  onToggleViewMode,
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
        <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px] sm:max-w-xs">{title}</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={onToggleViewMode}
          className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors"
          title={viewMode === "canvas" ? "Switch to Native Browser PDF Viewer" : "Switch to Interactive Canvas"}
        >
          {viewMode === "canvas" ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <Layers className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="hidden sm:inline">{viewMode === "canvas" ? "Native View" : "Canvas View"}</span>
        </button>

        {viewMode === "canvas" && (
          <>
            <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[11px]">
              <button
                onClick={onPrevPage}
                disabled={pageNumber <= 1}
                className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono px-1 min-w-[36px] text-center">{pageNumber} / {numPages || "..."}</span>
              <button
                onClick={onNextPage}
                disabled={!numPages || pageNumber >= numPages}
                className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <PdfViewerZoomControls scale={scale} onZoomIn={onZoomIn} onZoomOut={onZoomOut} onResetZoom={onResetZoom} />
          </>
        )}

        {downloadUrl && (
          <div className="flex items-center gap-1 ml-1">
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Open in new window">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a href={downloadUrl} download={title.endsWith(".pdf") ? title : `${title}.pdf`} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Download PDF">
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};


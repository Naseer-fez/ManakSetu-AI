import React from "react";
import { FileText, Download, RefreshCw, BarChart3, Eye, Sparkles } from "lucide-react";
import { clsx } from "clsx";

interface UnifiedAuditHeaderProps {
  viewMode?: "audit" | "pdf" | "both";
  fileName: string;
  fileSize: number;
  pdfBlobUrl: string | null;
  activeView: "audit" | "pdf";
  onViewChange: (v: "audit" | "pdf") => void;
  onReplaceFile: (f: File) => void;
  onExport: (format: "pdf" | "docx") => void;
  exportBusy: boolean;
  aiOpen: boolean;
  onToggleAi: () => void;
}

export const UnifiedAuditHeader: React.FC<UnifiedAuditHeaderProps> = ({
  viewMode = "both",
  fileName,
  fileSize,
  activeView,
  onViewChange,
  onReplaceFile,
  onExport,
  exportBusy,
  aiOpen,
  onToggleAi,
}) => {
  return (
    <div className="px-4 py-3 bg-black/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Document Information & Replace */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 rounded-xl bg-apple-blue/20 text-apple-blue shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="font-semibold text-white truncate text-xs sm:text-sm block" title={fileName}>{fileName}</span>
          <span className="text-[10px] text-white/50 block">{(fileSize / 1024).toFixed(1)} KB · Active Procurement Tender</span>
        </div>
        <label className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors text-[11px] ml-1">
          <RefreshCw className="w-3 h-3" />
          <span className="hidden md:inline">Replace</span>
          <input type="file" accept=".pdf,.docx,.txt" onChange={e => e.target.files?.[0] && onReplaceFile(e.target.files[0])} className="hidden" />
        </label>
      </div>

      {/* Center View Mode Switcher: [ 📋 Audit Matrix ] [ 📄 Original PDF ] */}
      {viewMode === "both" && (
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => onViewChange("audit")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all",
              activeView === "audit" ? "bg-apple-blue text-white shadow-sm shadow-apple-blue/30" : "text-white/60 hover:text-white"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Audit Matrix</span>
          </button>
          <button
            onClick={() => onViewChange("pdf")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all",
              activeView === "pdf" ? "bg-apple-indigo text-white shadow-sm shadow-apple-indigo/30" : "text-white/60 hover:text-white"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original PDF</span>
          </button>
        </div>
      )}

      {/* Right Controls: Export Buttons & AI Assistant Trigger */}
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onExport("pdf")} disabled={exportBusy} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white text-xs font-medium transition-colors border border-white/10">
          <Download className="w-3 h-3" /> PDF
        </button>
        <button onClick={() => onExport("docx")} disabled={exportBusy} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white text-xs font-medium transition-colors border border-white/10">
          <Download className="w-3 h-3" /> Word
        </button>
        <button
          onClick={onToggleAi}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
            aiOpen ? "bg-apple-indigo text-white border-apple-indigo shadow-md shadow-apple-indigo/30" : "bg-white/10 hover:bg-white/15 text-white border-white/15"
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-apple-indigo" />
          <span>{aiOpen ? "Close AI" : "AI Copilot"}</span>
        </button>
      </div>
    </div>
  );
};

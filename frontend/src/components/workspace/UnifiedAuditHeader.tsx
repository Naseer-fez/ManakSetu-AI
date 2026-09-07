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
    <div className="px-4 py-3 bg-white dark:bg-[#111927] border-b border-gov-border dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Document Information & Replace */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/40 text-gov-blue dark:text-blue-400 shrink-0 border border-blue-200 dark:border-blue-900/50">
          <FileText className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-gov-navy dark:text-white truncate text-xs sm:text-sm block" title={fileName}>{fileName}</span>
          <span className="text-[10px] text-gov-text-secondary dark:text-gray-400 block">{(fileSize / 1024).toFixed(1)} KB · Active Procurement Tender</span>
        </div>
        <label className="flex items-center gap-1 px-2.5 py-1 rounded bg-gov-offwhite dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gov-text dark:text-gray-200 cursor-pointer transition-colors text-[11px] ml-1 border border-gov-border dark:border-slate-700">
          <RefreshCw className="w-3 h-3" />
          <span className="hidden md:inline">Replace</span>
          <input type="file" accept=".pdf,.docx,.txt" onChange={e => e.target.files?.[0] && onReplaceFile(e.target.files[0])} className="hidden" />
        </label>
      </div>

      {/* Center View Mode Switcher: [ 📋 Audit Matrix ] [ 📄 Original PDF ] */}
      {viewMode === "both" && (
        <div className="flex items-center bg-gov-offwhite dark:bg-slate-800/80 p-1 rounded border border-gov-border dark:border-slate-700 shrink-0">
          <button
            onClick={() => onViewChange("audit")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all",
              activeView === "audit" ? "bg-gov-blue text-white shadow-sm" : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Audit Matrix</span>
          </button>
          <button
            onClick={() => onViewChange("pdf")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all",
              activeView === "pdf" ? "bg-gov-navy dark:bg-blue-600 text-white shadow-sm" : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original PDF</span>
          </button>
        </div>
      )}

      {/* Right Controls: Export Buttons & AI Assistant Trigger */}
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onExport("pdf")} disabled={exportBusy} className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 hover:bg-gov-offwhite dark:hover:bg-slate-700 disabled:opacity-50 text-gov-text dark:text-gray-200 text-xs font-medium transition-colors border border-gov-border dark:border-slate-700">
          <Download className="w-3 h-3" /> PDF
        </button>
        <button onClick={() => onExport("docx")} disabled={exportBusy} className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 hover:bg-gov-offwhite dark:hover:bg-slate-700 disabled:opacity-50 text-gov-text dark:text-gray-200 text-xs font-medium transition-colors border border-gov-border dark:border-slate-700">
          <Download className="w-3 h-3" /> Word
        </button>
        <button
          onClick={onToggleAi}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all border",
            aiOpen ? "bg-gov-navy dark:bg-blue-600 text-white border-gov-navy dark:border-blue-600 shadow-sm" : "bg-white dark:bg-slate-800 hover:bg-gov-offwhite dark:hover:bg-slate-700 text-gov-text dark:text-gray-200 border-gov-border dark:border-slate-700"
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
          <span>{aiOpen ? "Close AI" : "AI Copilot"}</span>
        </button>
      </div>
    </div>
  );
};

import React from "react";
import { FileText, Download, ExternalLink, RefreshCw, BarChart3, Eye } from "lucide-react";
import { clsx } from "clsx";

interface WorkspacePdfHeaderProps {
  fileName: string;
  fileSize: number;
  pdfBlobUrl: string | null;
  activeTab: "pdf" | "audit";
  onTabChange: (tab: "pdf" | "audit") => void;
  onReplaceFile: (f: File) => void;
}

export const WorkspacePdfHeader: React.FC<WorkspacePdfHeaderProps> = ({
  fileName,
  fileSize,
  pdfBlobUrl,
  activeTab,
  onTabChange,
  onReplaceFile,
}) => {
  return (
    <div className="px-4 py-2.5 bg-gov-offwhite dark:bg-slate-900/50 border-b border-gov-border dark:border-slate-800 flex items-center justify-between text-xs shrink-0 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1 rounded bg-blue-100 dark:bg-blue-950 text-gov-blue dark:text-blue-300 shrink-0">
          <FileText className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold text-gov-navy dark:text-white truncate text-xs" title={fileName}>{fileName}</span>
        <span className="text-[10px] text-gov-text-secondary dark:text-gray-400 shrink-0 hidden sm:inline">({(fileSize / 1024).toFixed(1)} KB)</span>
      </div>

      <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded border border-gov-border dark:border-slate-700 shrink-0">
        <button
          onClick={() => onTabChange("pdf")}
          className={clsx(
            "flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all",
            activeTab === "pdf"
              ? "bg-gov-blue text-white shadow-sm"
              : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white"
          )}
          title="Show PDF"
        >
          <Eye className="w-3 h-3" /><span>PDF</span>
        </button>
        <button
          onClick={() => onTabChange("audit")}
          className={clsx(
            "flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all",
            activeTab === "audit"
              ? "bg-gov-navy dark:bg-blue-600 text-white shadow-sm"
              : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white"
          )}
          title="Show Audit Results"
        >
          <BarChart3 className="w-3 h-3" /><span>Audit Results</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <label className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gov-border dark:border-slate-700 text-gov-navy dark:text-gray-200 cursor-pointer transition-colors text-[11px] font-medium shadow-sm">
          <RefreshCw className="w-3 h-3" /><span className="hidden md:inline">Replace</span>
          <input type="file" accept=".pdf,.docx,.txt" onChange={e => e.target.files?.[0] && onReplaceFile(e.target.files[0])} className="hidden" />
        </label>
        {pdfBlobUrl && <a href={pdfBlobUrl} download={fileName} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white transition-colors" title="Download PDF"><Download className="w-3.5 h-3.5" /></a>}
        {pdfBlobUrl && <a href={pdfBlobUrl} target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white transition-colors" title="Expand in new tab"><ExternalLink className="w-3.5 h-3.5" /></a>}
      </div>
    </div>
  );
};

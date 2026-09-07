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
    <div className="px-4 py-2.5 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs shrink-0 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1 rounded-lg bg-apple-blue/20 text-apple-blue shrink-0">
          <FileText className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-white truncate text-xs" title={fileName}>{fileName}</span>
        <span className="text-[10px] text-white/50 shrink-0 hidden sm:inline">({(fileSize / 1024).toFixed(1)} KB)</span>
      </div>

      <div className="flex items-center bg-white/5 p-0.5 rounded-xl border border-white/10 shrink-0">
        <button onClick={() => onTabChange("pdf")} className={clsx("flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all", activeTab === "pdf" ? "bg-apple-blue text-white shadow-sm" : "text-white/60 hover:text-white")} title="Show PDF">
          <Eye className="w-3 h-3" /><span>PDF</span>
        </button>
        <button onClick={() => onTabChange("audit")} className={clsx("flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all", activeTab === "audit" ? "bg-apple-indigo text-white shadow-sm" : "text-white/60 hover:text-white")} title="Show Audit Results">
          <BarChart3 className="w-3 h-3" /><span>Audit Results</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <label className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer transition-colors text-[11px]">
          <RefreshCw className="w-3 h-3" /><span className="hidden md:inline">Replace</span>
          <input type="file" accept=".pdf,.docx,.txt" onChange={e => e.target.files?.[0] && onReplaceFile(e.target.files[0])} className="hidden" />
        </label>
        {pdfBlobUrl && <a href={pdfBlobUrl} download={fileName} className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Download PDF"><Download className="w-3.5 h-3.5" /></a>}
        {pdfBlobUrl && <a href={pdfBlobUrl} target="_blank" rel="noreferrer" className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Expand in new tab"><ExternalLink className="w-3.5 h-3.5" /></a>}
      </div>
    </div>
  );
};

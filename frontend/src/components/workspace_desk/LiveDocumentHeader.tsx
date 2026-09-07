import React from "react";
import { FileText, FileCode2, Pencil, Sparkles, Loader2 } from "lucide-react";
import type { DocumentSource } from "@/components/workspace_desk/types";
import { formatFileSize } from "@/components/workspace_desk/workspace.utils";

export type DocumentViewMode = "original" | "edit" | "revised";

interface LiveDocumentHeaderProps {
  document: DocumentSource;
  mode: DocumentViewMode;
  onSelectMode: (mode: DocumentViewMode) => void;
  isCompiling?: boolean;
}

export const LiveDocumentHeader: React.FC<LiveDocumentHeaderProps> = ({
  document,
  mode,
  onSelectMode,
  isCompiling = false,
}) => {
  return (
    <div className="border-b border-gov-border dark:border-slate-800 shrink-0">
      <div className="px-4 py-2.5 bg-gov-offwhite dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-gov-blue dark:text-blue-400 shrink-0" />
          <h3 className="text-xs font-bold text-gov-navy dark:text-white truncate" title={document.name}>
            {document.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gov-text-secondary dark:text-gray-400 shrink-0">
          <span className="uppercase font-mono bg-white dark:bg-slate-800 border border-gov-border dark:border-slate-700 px-1.5 py-0.5 rounded">
            {document.type}
          </span>
          <span>{document.sizeBytes > 0 ? formatFileSize(document.sizeBytes) : `${document.wordCount} words`}</span>
        </div>
      </div>

      <div className="px-3 py-1.5 bg-white dark:bg-[#111927] flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelectMode("original")}
          disabled={!document.pdfUrl}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            mode === "original"
              ? "bg-gov-blue text-white shadow-sm"
              : "text-gov-text-secondary dark:text-gray-400 hover:bg-gov-offwhite dark:hover:bg-slate-800 disabled:opacity-30"
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" /> Original PDF
        </button>

        <button
          type="button"
          onClick={() => onSelectMode("edit")}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            mode === "edit"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-gov-text-secondary dark:text-gray-400 hover:bg-gov-offwhite dark:hover:bg-slate-800"
          }`}
        >
          <Pencil className="w-3.5 h-3.5" /> Edit Document
        </button>

        <button
          type="button"
          onClick={() => onSelectMode("revised")}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            mode === "revised"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gov-text-secondary dark:text-gray-400 hover:bg-gov-offwhite dark:hover:bg-slate-800"
          }`}
        >
          {isCompiling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span>Preview Updated PDF</span>
        </button>
      </div>
    </div>
  );
};

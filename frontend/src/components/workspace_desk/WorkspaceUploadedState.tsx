import React from "react";
import { FileText, Trash2, RefreshCw, Play, FileCode } from "lucide-react";
import type { DocumentSource } from "@/components/workspace_desk/types";
import { formatFileSize } from "@/components/workspace_desk/workspace.utils";

interface WorkspaceUploadedStateProps {
  document: DocumentSource;
  onRemove: () => void;
  onReplace: () => void;
  onRunAudit: () => void;
}

export const WorkspaceUploadedState: React.FC<WorkspaceUploadedStateProps> = ({
  document,
  onRemove,
  onReplace,
  onRunAudit,
}) => {
  return (
    <div className="max-w-2xl mx-auto w-full bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 p-6 space-y-5 shadow-sm">
      {/* File Details Banner */}
      <div className="flex items-center justify-between p-3.5 rounded bg-gov-offwhite dark:bg-slate-800/80 border border-gov-border dark:border-slate-700">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-950/40 text-gov-blue dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/50">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-gov-navy dark:text-white truncate">{document.name}</h4>
            <p className="text-xs text-gov-text-secondary dark:text-gray-400">
              {document.type.toUpperCase()} &middot; {document.sizeBytes > 0 ? formatFileSize(document.sizeBytes) : `${document.wordCount} words`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReplace}
            className="p-2 rounded bg-white dark:bg-slate-700 text-gov-text dark:text-gray-200 hover:text-gov-navy dark:hover:text-white border border-gov-border dark:border-slate-600 transition-colors"
            title="Replace document"
            aria-label="Replace document"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 rounded bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-gov-red dark:text-rose-400 border border-red-200 dark:border-red-900/50 transition-colors"
            title="Remove document"
            aria-label="Remove document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Extracted Document Preview */}
      <div className="rounded border border-gov-border dark:border-slate-700 bg-gov-offwhite dark:bg-[#0c1421] p-4 min-h-[160px] flex flex-col justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-gov-navy dark:text-gray-200 mb-2">
          <FileCode className="w-4 h-4 text-gov-green dark:text-emerald-400" />
          <span>Extracted Document Preview</span>
        </div>
        <div className="font-mono text-xs text-gov-text dark:text-gray-200 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap select-text">
          {document.contentSnippet || "No preview extract available."}
        </div>
        <span className="text-[10px] text-gov-text-secondary dark:text-gray-400 mt-3 block">
          * Extraction complete. Run the audit to open the editable review desk.
        </span>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onRunAudit}
          className="px-5 py-2.5 rounded bg-gov-blue hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Run Audit</span>
        </button>
      </div>
    </div>
  );
};

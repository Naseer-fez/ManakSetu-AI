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
    <div className="max-w-2xl mx-auto w-full apple-glass rounded-3xl border border-white/10 p-6 space-y-5">
      {/* File Details Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-apple-blue/20 text-apple-blue flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">{document.name}</h4>
            <p className="text-xs text-white/50">
              {document.type.toUpperCase()} &middot; {document.sizeBytes > 0 ? formatFileSize(document.sizeBytes) : `${document.wordCount} words`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReplace}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Replace document"
            aria-label="Replace document"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 rounded-xl bg-apple-red/10 hover:bg-apple-red/20 text-apple-red transition-colors"
            title="Remove document"
            aria-label="Remove document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Preview Placeholder Area */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 min-h-[160px] flex flex-col justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-white/70 mb-2">
          <FileCode className="w-4 h-4 text-apple-mint" />
          <span>Document Preview Placeholder</span>
        </div>
        <div className="font-mono text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap select-text">
          {document.contentSnippet || "No preview extract available."}
        </div>
        <span className="text-[10px] text-white/40 mt-3 block">
          * Ready for review. Real OCR/parsing is bypassed in UI preview mode.
        </span>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onRunAudit}
          className="px-5 py-2.5 rounded-xl bg-apple-blue hover:bg-apple-blue/90 active:scale-95 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-apple-blue/25 transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Run Audit</span>
        </button>
      </div>
    </div>
  );
};

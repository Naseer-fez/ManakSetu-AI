import React, { useState } from "react";
import { Upload, FileText, Play } from "lucide-react";
import { WorkspaceUploadDropzone } from "@/components/workspace_desk/WorkspaceUploadDropzone";
import { WorkspacePasteBox } from "@/components/workspace_desk/WorkspacePasteBox";

interface WorkspaceEmptyStateProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
}

export const WorkspaceEmptyState: React.FC<WorkspaceEmptyStateProps> = ({
  onFileSelect,
  onTextSubmit,
}) => {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");

  const sampleTenderText = `Section 3.2: Technical Specifications for High Strength Deformed Steel Bars.
Clause 3.2.4: All materials shall conform to statutory quality standards. Primary manufacturer must provide test certificates conforming to IS 1786.
Section 4.1, Clause 4.1.8: Mandatory sampling and verification shall be performed as per reaffirmed norms.
Section 7.0, Clause 7.1.2: Packaging and identification bundles shall carry batch numbers and manufacturer mark.`;

  return (
    <div className="max-w-2xl mx-auto w-full bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-700 p-6 space-y-5 shadow-sm">
      {/* Mode Selector */}
      <div className="flex items-center gap-2 border-b border-gov-border dark:border-slate-700 pb-3">
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
            mode === "upload"
              ? "bg-gov-blue text-white shadow-sm"
              : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white hover:bg-gov-offwhite dark:hover:bg-slate-800"
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload Document (.pdf, .docx, .txt)
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
            mode === "paste"
              ? "bg-gov-blue text-white shadow-sm"
              : "text-gov-text-secondary dark:text-gray-400 hover:text-gov-navy dark:hover:text-white hover:bg-gov-offwhite dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Paste Specification Clauses
        </button>
      </div>

      {/* Input Form Body */}
      {mode === "upload" ? (
        <WorkspaceUploadDropzone onFileSelect={onFileSelect} />
      ) : (
        <WorkspacePasteBox
          text={pastedText}
          onChange={setPastedText}
          onUseSampleText={() => setPastedText(sampleTenderText)}
        />
      )}

      {/* Run Audit Button */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
        <span className="text-xs text-gov-text-secondary dark:text-gray-400">
          Upload a tender document or paste technical clauses to initiate statutory compliance audit.
        </span>
        <button
          onClick={() => mode === "paste" && pastedText.trim() && onTextSubmit(pastedText)}
          disabled={mode === "upload" || !pastedText.trim()}
          className="px-4 py-2 rounded bg-gov-blue hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Run Audit</span>
        </button>
      </div>
    </div>
  );
};

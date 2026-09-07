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
    <div className="max-w-2xl mx-auto w-full apple-glass rounded-3xl border border-white/10 p-6 space-y-5">
      {/* Mode Selector */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setMode("upload")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            mode === "upload"
              ? "bg-apple-blue text-white shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload Document
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            mode === "paste"
              ? "bg-apple-blue text-white shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Paste Text
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

      {/* Run Audit Button (Disabled until text entered if paste mode) */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-white/40">
          Upload a tender document or paste clauses to activate audit.
        </span>
        <button
          onClick={() => mode === "paste" && pastedText.trim() && onTextSubmit(pastedText)}
          disabled={mode === "upload" || !pastedText.trim()}
          className="px-5 py-2.5 rounded-xl bg-apple-blue hover:bg-apple-blue/90 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Run Audit</span>
        </button>
      </div>
    </div>
  );
};

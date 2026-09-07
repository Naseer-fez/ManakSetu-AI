import React, { useState } from "react";
import { Upload, FileText, Sparkles, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";

interface WorkspaceDropzoneProps {
  onFileSelected: (f: File) => void;
  loading: boolean;
}

export const WorkspaceDropzone: React.FC<WorkspaceDropzoneProps> = ({
  onFileSelected,
  loading,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) onFileSelected(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div
        onDragOver={e => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={clsx(
          "w-full max-w-2xl min-h-[300px] max-h-[380px] flex flex-col items-center justify-center p-8 text-center cursor-pointer relative transition-all border-2 border-dashed rounded-3xl apple-glass shadow-2xl",
          dragActive
            ? "border-apple-blue bg-apple-blue/15 shadow-[0_0_40px_rgba(0,113,227,0.3)] scale-[1.01]"
            : "border-white/10 hover:border-white/20 hover:bg-white/5"
        )}
      >
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          disabled={loading}
          onChange={e => e.target.files?.[0] && onFileSelected(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />

        <div className="w-14 h-14 rounded-2xl bg-apple-blue/20 border border-apple-blue/30 text-apple-blue flex items-center justify-center mb-4 shadow-lg shadow-apple-blue/10">
          <Upload className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Upload Tender Document
        </h3>
        <p className="text-xs text-white/50 mt-1.5 max-w-md leading-relaxed">
          Drop a PDF, DOCX, or text specification here to activate the dual-panel
          document workstation with statutory BIS compliance auditing.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-medium text-white/70 flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-apple-blue" /> Interactive PDF Viewer
          </span>
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-medium text-white/70 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-apple-mint" /> QCO Compliance Audit
          </span>
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-medium text-white/70 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-apple-indigo" /> On-Demand AI Copilot
          </span>
        </div>
      </div>
    </div>
  );
};

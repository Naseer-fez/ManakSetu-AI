import React, { useState } from "react";
import { Upload, FileCheck, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

export interface WorkspaceDropzoneProps {
  onFileSelected: (f: File) => void;
  loading: boolean;
}

export const WorkspaceDropzone: React.FC<WorkspaceDropzoneProps> = ({ onFileSelected, loading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) onFileSelected(e.dataTransfer.files[0]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={clsx(
          "w-full flex flex-col items-center justify-center p-8 text-center cursor-pointer relative transition-all border-2 border-dashed rounded-lg bg-white dark:bg-[#111927] shadow-sm",
          dragActive
            ? "border-gov-blue bg-blue-50/60 dark:bg-blue-950/30 scale-[1.01]"
            : "border-gov-border dark:border-slate-700 hover:border-gov-blue dark:hover:border-blue-500"
        )}
      >
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          disabled={loading}
          onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />

        <div className="w-14 h-14 rounded-lg bg-gov-blue-light dark:bg-blue-950/60 text-gov-blue dark:text-blue-400 flex items-center justify-center mb-3">
          <Upload className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-gov-navy dark:text-white">
          Upload Procurement Tender or Technical Specification
        </h3>
        <p className="text-xs text-gov-text-secondary dark:text-gray-400 mt-1 max-w-lg leading-relaxed">
          Upload official tender documents including Notice Inviting Tender (NIT), RFP, Technical Specs, or GeM Bid PDFs (.pdf, .docx, .txt).
        </p>
        <span className="mt-3 px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gov-navy dark:text-gray-200 text-xs font-semibold">
          Click or Drag & Drop File Here
        </span>
      </div>

      <div className="w-full bg-white dark:bg-[#111927] border border-gov-border dark:border-slate-700 rounded-lg p-5 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gov-navy dark:text-gray-200 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-gov-green" />
          Automated Deliverables After Document Intake
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gov-text dark:text-gray-300">
          <div className="flex items-start gap-2 bg-gov-offwhite dark:bg-slate-800/60 p-2.5 rounded border border-gov-border dark:border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-gov-blue shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gov-navy dark:text-white block">BIS Standard Matching</span>
              <span className="text-gov-text-secondary dark:text-gray-400 text-[11px]">Identifies cited Indian Standards and flags superseded or obsolete codes.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-gov-offwhite dark:bg-slate-800/60 p-2.5 rounded border border-gov-border dark:border-slate-700">
            <ShieldAlert className="w-4 h-4 text-gov-red shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gov-navy dark:text-white block">Mandatory QCO Audit</span>
              <span className="text-gov-text-secondary dark:text-gray-400 text-[11px]">Enforces statutory Quality Control Orders and highlights compliance barriers.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-gov-offwhite dark:bg-slate-800/60 p-2.5 rounded border border-gov-border dark:border-slate-700">
            <FileText className="w-4 h-4 text-gov-saffron shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gov-navy dark:text-white block">GeM Specification Clauses</span>
              <span className="text-gov-text-secondary dark:text-gray-400 text-[11px]">Formulates approved technical specification clauses ready for procurement.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-gov-offwhite dark:bg-slate-800/60 p-2.5 rounded border border-gov-border dark:border-slate-700">
            <FileCheck className="w-4 h-4 text-gov-green shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gov-navy dark:text-white block">Interactive Knowledge Graph</span>
              <span className="text-gov-text-secondary dark:text-gray-400 text-[11px]">Unlocks contextual dependency visualization for all standards in your tender.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDropzone;

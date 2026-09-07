import React, { useRef, useState } from "react";
import { Upload, Loader2, ShieldCheck, FileCheck2 } from "lucide-react";

interface WorkspaceUploadButtonProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const WorkspaceUploadButton: React.FC<WorkspaceUploadButtonProps> = ({
  onFileSelect,
  isLoading = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gov-offwhite dark:bg-[#0c1421] border border-gov-border dark:border-slate-800 rounded-lg space-y-4 transition-all">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
        disabled={isLoading}
      />

      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-gov-blue dark:text-blue-400 shadow-sm">
        {isLoading ? (
          <Loader2 className="w-7 h-7 animate-spin text-gov-blue dark:text-blue-400" />
        ) : (
          <FileCheck2 className="w-7 h-7" />
        )}
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="text-sm font-bold text-gov-navy dark:text-white">
          Upload Technical Procurement Document
        </h3>
        <p className="text-xs text-gov-text-secondary dark:text-gray-400 leading-relaxed">
          Select a tender specification, RFP, or NIT document for automated statutory Bureau of Indian Standards (BIS) and QCO compliance auditing.
        </p>
      </div>

      <div className="pt-2 flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="px-6 py-2.5 rounded-lg bg-gov-blue hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-md cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Processing Document & Starting Audit...</span>
            </>
          ) : (
            <>
              <Upload className={`w-4 h-4 transition-transform ${isHovered ? "-translate-y-0.5" : ""}`} />
              <span>Upload Tender Document</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2 text-[11px] text-gov-text-secondary dark:text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-gov-green dark:text-emerald-400" />
          <span>Supported formats: PDF, DOCX, TXT &middot; Up to 200MB</span>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceUploadButton;

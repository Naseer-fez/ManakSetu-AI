import React, { useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";

interface WorkspaceUploadDropzoneProps {
  onFileSelect: (file: File) => void;
}

export const WorkspaceUploadDropzone: React.FC<WorkspaceUploadDropzoneProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 ${
        isDragOver
          ? "border-gov-blue bg-blue-50/60 dark:bg-blue-950/30 scale-[0.99]"
          : "border-gov-border dark:border-slate-700 bg-gov-offwhite dark:bg-[#0c1421] hover:border-gov-blue dark:hover:border-blue-500"
      }`}
      role="button"
      tabIndex={0}
      aria-label="Upload document dropzone"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
      <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-gov-blue dark:text-blue-400 mb-3">
        {isDragOver ? <FileText className="w-6 h-6 animate-bounce" /> : <UploadCloud className="w-6 h-6" />}
      </div>
      <p className="text-sm font-semibold text-gov-navy dark:text-white mb-1">
        Drag & drop tender document here, or <span className="text-gov-blue dark:text-blue-400 hover:underline">browse</span>
      </p>
      <p className="text-[11px] text-gov-text-secondary dark:text-gray-400 max-w-xs">
        Accepted labels: PDF, DOCX, TXT, Images (PNG, JPG)
      </p>
    </div>
  );
};

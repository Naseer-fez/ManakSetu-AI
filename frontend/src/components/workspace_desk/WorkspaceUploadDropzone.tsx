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
      className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-150 ${
        isDragOver
          ? "border-apple-blue bg-apple-blue/10 scale-[0.99]"
          : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
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
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-apple-blue mb-3">
        {isDragOver ? <FileText className="w-6 h-6 animate-bounce" /> : <UploadCloud className="w-6 h-6" />}
      </div>
      <p className="text-sm font-medium text-white mb-1">
        Drag & drop tender document here, or <span className="text-apple-blue hover:underline">browse</span>
      </p>
      <p className="text-[11px] text-white/40 max-w-xs">
        Accepted labels: PDF, DOCX, TXT, Images (PNG, JPG)
      </p>
    </div>
  );
};

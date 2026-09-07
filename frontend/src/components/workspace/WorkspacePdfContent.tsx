import React from "react";
import { FileText } from "lucide-react";

interface WorkspacePdfContentProps {
  file: File;
  pdfBlobUrl: string | null;
}

export const WorkspacePdfContent: React.FC<WorkspacePdfContentProps> = ({
  file,
  pdfBlobUrl,
}) => {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (pdfBlobUrl && isPdf) {
    return (
      <div className="w-full h-full bg-slate-950 relative overflow-hidden">
        <iframe
          src={`${pdfBlobUrl}#view=FitH&toolbar=1`}
          className="w-full h-full border-0 bg-slate-950 block"
          title="Tender Document Viewer"
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-white/50 space-y-2.5">
      <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 border border-apple-blue/20 text-apple-blue flex items-center justify-center">
        <FileText className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-white truncate max-w-xs">{file.name}</p>
        <p className="text-[11px] text-white/40 mt-1 max-w-xs leading-relaxed">
          Interactive inline rendering is optimized for PDF documents. Switch to "Audit Results" above
          to inspect parsed clauses and specifications.
        </p>
      </div>
    </div>
  );
};

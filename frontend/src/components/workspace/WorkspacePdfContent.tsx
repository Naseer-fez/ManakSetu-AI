import React, { useEffect, useState } from "react";
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
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfBlobUrl && isPdf && file) {
      const url = URL.createObjectURL(file);
      setCreatedUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return undefined;
  }, [file, pdfBlobUrl, isPdf]);

  const activeUrl = pdfBlobUrl || createdUrl;

  if (activeUrl && isPdf) {
    return (
      <div className="w-full h-full bg-slate-950 relative overflow-hidden">
        <iframe
          src={`${activeUrl}#view=FitH&toolbar=1`}
          className="w-full h-full border-0 bg-slate-950 block"
          title="Tender Document Viewer"
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gov-text-secondary dark:text-gray-400 space-y-2.5">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-gov-blue dark:text-blue-400 flex items-center justify-center shadow-sm">
        <FileText className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gov-navy dark:text-white truncate max-w-xs">{file.name}</p>
        <p className="text-[11px] text-gov-text-secondary dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
          Interactive inline rendering is optimized for PDF documents. Switch to "Audit Results" above
          to inspect parsed clauses and specifications.
        </p>
      </div>
    </div>
  );
};

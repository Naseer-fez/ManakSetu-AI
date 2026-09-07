import React from "react";
import { ExternalLink, Download, FileText } from "lucide-react";

interface LivePdfViewerProps {
  pdfUrl: string;
  title?: string;
}

export const LivePdfViewer: React.FC<LivePdfViewerProps> = ({
  pdfUrl,
  title = "Document PDF Viewer",
}) => {
  if (!pdfUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gov-text-secondary dark:text-gray-400 space-y-2">
        <FileText className="w-8 h-8 text-gov-blue dark:text-blue-400 opacity-60" />
        <p className="text-xs">No PDF preview available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden relative">
      {/* Viewer Floating Header Controls */}
      <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono text-slate-400 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open in new window"
            aria-label="Open PDF in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={pdfUrl}
            download="tender-document.pdf"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Download PDF"
            aria-label="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* High Fidelity Native Browser PDF Canvas */}
      <div className="flex-1 min-h-0 relative w-full h-full bg-slate-950">
        <iframe
          src={`${pdfUrl}#toolbar=1&view=FitH`}
          className="w-full h-full border-0 bg-slate-950 block"
          title={title}
        />
      </div>
    </div>
  );
};

export default LivePdfViewer;

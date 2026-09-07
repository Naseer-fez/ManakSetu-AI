import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Document, Page } from "react-pdf";

interface LivePdfViewerProps {
  pdfUrl: string;
}

export const LivePdfViewer: React.FC<LivePdfViewerProps> = ({ pdfUrl }) => {
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  return (
    <div className="min-h-full flex flex-col items-center gap-3 p-3 bg-gov-offwhite dark:bg-[#0c1421]">
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setPageCount(numPages)}
        loading={<p className="text-xs text-gov-text-secondary dark:text-gray-400 p-6">Loading original PDF…</p>}
        error={<p className="text-xs text-gov-red dark:text-rose-400 p-6">Unable to render the original PDF.</p>}
      >
        <Page pageNumber={page} width={360} renderTextLayer renderAnnotationLayer />
      </Document>
      {pageCount > 0 && (
        <div className="flex items-center gap-3 text-xs text-gov-text-secondary dark:text-gray-300">
          <button
            disabled={page <= 1}
            onClick={() => setPage((c) => Math.max(1, c - 1))}
            className="p-1.5 rounded bg-white dark:bg-slate-800 border border-gov-border dark:border-slate-700 disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page} of {pageCount}</span>
          <button
            disabled={page >= pageCount}
            onClick={() => setPage((c) => Math.min(pageCount, c + 1))}
            className="p-1.5 rounded bg-white dark:bg-slate-800 border border-gov-border dark:border-slate-700 disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LivePdfViewer;

import React from "react";
import { Document, Page } from "react-pdf";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface PdfViewerCanvasProps {
  file: File | Blob | string | null;
  pageNumber: number;
  scale: number;
  onLoadSuccess: (data: { numPages: number }) => void;
  onLoadError: (err: Error) => void;
}


export const PdfViewerCanvas: React.FC<PdfViewerCanvasProps> = ({
  file,
  pageNumber,
  scale,
  onLoadSuccess,
  onLoadError,
}) => {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-xs">
        No document specified
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto bg-slate-950 flex justify-center p-4 relative">
      <Document
        file={file}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-gov-blue" />
            <span className="text-xs">Rendering PDF document...</span>
          </div>
        }
        error={
          <div className="flex flex-col items-center justify-center p-8 text-rose-400 text-center gap-3 max-w-sm">
            <AlertCircle className="w-8 h-8 text-rose-400 opacity-80" />
            <div>
              <p className="text-xs font-semibold">Unable to display PDF preview</p>
              <p className="text-[11px] text-slate-400 mt-1">
                The document could not be loaded or parsed. You can download or view it directly using the buttons above.
              </p>
            </div>
            {(typeof file === "string" || file instanceof Blob) && (
              <a
                href={typeof file === "string" ? file : URL.createObjectURL(file)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Open File Directly</span>
              </a>
            )}
          </div>
        }

      >
        <div className="shadow-2xl rounded-sm overflow-hidden bg-white">
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="block"
          />
        </div>
      </Document>
    </div>
  );
};

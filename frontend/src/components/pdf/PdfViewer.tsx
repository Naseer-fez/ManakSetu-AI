import React, { useMemo } from "react";
import { usePdfViewer } from "@/components/pdf/usePdfViewer";
import { PdfViewerToolbar } from "@/components/pdf/PdfViewerToolbar";
import { PdfViewerCanvas } from "@/components/pdf/PdfViewerCanvas";
import { FileText } from "lucide-react";

interface PdfViewerProps {
  file: File | Blob | string | null;
  title?: string;
  downloadUrl?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  file,
  title = "PDF Document",
  downloadUrl: customDownloadUrl,
}) => {
  const viewer = usePdfViewer();

  const resolvedDownloadUrl = useMemo(() => {
    if (customDownloadUrl) return customDownloadUrl;
    if (typeof file === "string") return file;
    if (file instanceof File || file instanceof Blob) return URL.createObjectURL(file);
    return undefined;
  }, [file, customDownloadUrl]);


  const [viewMode, setViewMode] = React.useState<"canvas" | "native">("canvas");

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gov-text-secondary dark:text-gray-400 space-y-2">
        <FileText className="w-8 h-8 text-gov-blue dark:text-blue-400 opacity-60" />
        <p className="text-xs">No PDF preview available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden relative">
      <PdfViewerToolbar
        title={title}
        pageNumber={viewer.pageNumber}
        numPages={viewer.numPages}
        scale={viewer.scale}
        downloadUrl={resolvedDownloadUrl}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((v) => (v === "canvas" ? "native" : "canvas"))}
        onPrevPage={viewer.prevPage}
        onNextPage={viewer.nextPage}
        onZoomIn={viewer.zoomIn}
        onZoomOut={viewer.zoomOut}
        onResetZoom={viewer.resetZoom}
      />

      {viewMode === "native" && resolvedDownloadUrl ? (
        <div className="flex-1 min-h-0 w-full h-full bg-slate-950">
          <iframe
            src={resolvedDownloadUrl}
            title={title}
            className="w-full h-full border-0"
          />
        </div>
      ) : (
        <PdfViewerCanvas
          file={file}
          pageNumber={viewer.pageNumber}
          scale={viewer.scale}
          onLoadSuccess={viewer.onDocumentLoadSuccess}
          onLoadError={viewer.onDocumentLoadError}
        />
      )}
    </div>
  );
};

export default PdfViewer;

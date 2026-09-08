import React from "react";
import { PdfViewer } from "@/components/pdf/PdfViewer";

interface LivePdfViewerProps {
  pdfUrl: string;
  title?: string;
}

export const LivePdfViewer: React.FC<LivePdfViewerProps> = ({
  pdfUrl,
  title = "Document PDF Viewer",
}) => {
  return <PdfViewer file={pdfUrl} title={title} downloadUrl={pdfUrl} />;
};

export default LivePdfViewer;

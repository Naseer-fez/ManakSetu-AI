import React from "react";
import { PdfViewer } from "@/components/pdf/PdfViewer";

interface LivePdfViewerProps {
  pdfUrl?: string;
  file?: File | Blob | null;
  title?: string;
}

export const LivePdfViewer: React.FC<LivePdfViewerProps> = ({
  pdfUrl,
  file,
  title = "Document PDF Viewer",
}) => {
  const source = file || pdfUrl || null;
  return <PdfViewer file={source} title={title} downloadUrl={typeof source === "string" ? source : undefined} />;
};

export default LivePdfViewer;


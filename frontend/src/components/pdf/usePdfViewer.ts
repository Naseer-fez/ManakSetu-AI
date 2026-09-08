import { useState, useCallback } from "react";
import { pdfjs } from "react-pdf";

// Configure local worker with fallback
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  } catch {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
}


export function usePdfViewer() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    setLoading(false);
    setError(err.message || "Failed to load document");
  }, []);

  const prevPage = useCallback(() => {
    setPageNumber((curr) => Math.max(curr - 1, 1));
  }, []);

  const nextPage = useCallback(() => {
    setPageNumber((curr) => (numPages ? Math.min(curr + 1, numPages) : curr + 1));
  }, [numPages]);

  const goToPage = useCallback((page: number) => {
    if (numPages && page >= 1 && page <= numPages) {
      setPageNumber(page);
    }
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((curr) => Math.min(Number((curr + 0.15).toFixed(2)), 2.5));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((curr) => Math.max(Number((curr - 0.15).toFixed(2)), 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  return {
    numPages,
    pageNumber,
    scale,
    loading,
    error,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    prevPage,
    nextPage,
    goToPage,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}

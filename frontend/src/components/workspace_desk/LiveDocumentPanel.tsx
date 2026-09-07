import React, { useEffect, useState } from "react";
import { FileCode2, FileText, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import type { DocumentSource } from "@/components/workspace_desk/types";
import { formatFileSize } from "@/components/workspace_desk/workspace.utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

interface LiveDocumentPanelProps {
  document: DocumentSource;
  onEditorReady: (editor: Editor | null) => void;
  onEditorChange: (html: string) => void;
}

type PanelMode = "pdf" | "edit";

export const LiveDocumentPanel: React.FC<LiveDocumentPanelProps> = ({
  document,
  onEditorReady,
  onEditorChange,
}) => {
  const [mode, setMode] = useState<PanelMode>("pdf");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: document.documentHtml || "<p>No extracted text available.</p>",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-full px-4 py-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor: updatedEditor }) => onEditorChange(updatedEditor.getHTML()),
  });

  useEffect(() => {
    onEditorReady(editor);
    return () => onEditorReady(null);
  }, [editor, onEditorReady]);

  useEffect(() => {
    setPage(1);
    setPageCount(0);
    setMode(document.pdfUrl ? "pdf" : "edit");
  }, [document.pdfUrl, document.name]);

  return (
    <section className="flex flex-col h-full min-h-0 apple-glass rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-apple-blue shrink-0" />
          <h3 className="text-xs font-semibold text-white truncate" title={document.name}>{document.name}</h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <span className="uppercase font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/70">{document.type}</span>
          <span>{document.sizeBytes > 0 ? formatFileSize(document.sizeBytes) : `${document.wordCount} words`}</span>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-1 shrink-0">
        <button onClick={() => setMode("pdf")} disabled={!document.pdfUrl} className={`px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 ${mode === "pdf" ? "bg-apple-blue text-white" : "text-white/60 hover:bg-white/10 disabled:opacity-30"}`}>
          <FileCode2 className="w-3.5 h-3.5" /> View Original PDF
        </button>
        <button onClick={() => setMode("edit")} className={`px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 ${mode === "edit" ? "bg-apple-mint/20 text-apple-mint" : "text-white/60 hover:bg-white/10"}`}>
          <Pencil className="w-3.5 h-3.5" /> Edit Document
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto bg-black/20">
        {mode === "pdf" && document.pdfUrl ? (
          <div className="min-h-full flex flex-col items-center gap-3 p-3">
            <Document
              file={document.pdfUrl}
              onLoadSuccess={({ numPages }) => setPageCount(numPages)}
              loading={<p className="text-xs text-white/50 p-6">Loading original PDF…</p>}
              error={<p className="text-xs text-apple-red p-6">Unable to render the original PDF.</p>}
            >
              <Page pageNumber={page} width={360} renderTextLayer renderAnnotationLayer />
            </Document>
            {pageCount > 0 && (
              <div className="flex items-center gap-3 text-xs text-white/70">
                <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="p-1.5 rounded-lg bg-white/10 disabled:opacity-30" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
                <span>Page {page} of {pageCount}</span>
                <button disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="p-1.5 rounded-lg bg-white/10 disabled:opacity-30" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </section>
  );
};

import React, { useEffect, useState } from "react";
import { FileCode2, FileText, Pencil } from "lucide-react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import type { DocumentSource } from "@/components/workspace_desk/types";
import { formatFileSize } from "@/components/workspace_desk/workspace.utils";
import { LivePdfViewer } from "@/components/workspace_desk/LivePdfViewer";

interface LiveDocumentPanelProps {
  document: DocumentSource;
  onEditorReady: (editor: Editor | null) => void;
  onEditorChange: (html: string) => void;
}

export const LiveDocumentPanel: React.FC<LiveDocumentPanelProps> = ({
  document,
  onEditorReady,
  onEditorChange,
}) => {
  const [mode, setMode] = useState<"pdf" | "edit">("pdf");
  const editor = useEditor({
    extensions: [StarterKit, Table.configure({ resizable: false }), TableRow, TableHeader, TableCell],
    content: document.documentHtml || "<p>No extracted text available.</p>",
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none min-h-full px-4 py-4 text-gov-text dark:text-gray-100 focus:outline-none text-xs leading-relaxed",
      },
    },
    onUpdate: ({ editor: updatedEditor }) => onEditorChange(updatedEditor.getHTML()),
  });

  useEffect(() => {
    onEditorReady(editor);
    return () => onEditorReady(null);
  }, [editor, onEditorReady]);

  useEffect(() => {
    setMode(document.pdfUrl ? "pdf" : "edit");
  }, [document.pdfUrl, document.name]);

  return (
    <section className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/40 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-gov-blue dark:text-blue-400 shrink-0" />
          <h3 className="text-xs font-bold text-gov-navy dark:text-white truncate" title={document.name}>{document.name}</h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gov-text-secondary dark:text-gray-400">
          <span className="uppercase font-mono bg-white dark:bg-slate-800 border border-gov-border dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-gov-navy dark:text-gray-300">{document.type}</span>
          <span>{document.sizeBytes > 0 ? formatFileSize(document.sizeBytes) : `${document.wordCount} words`}</span>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-gov-border dark:border-slate-800 flex items-center gap-1 shrink-0 bg-white dark:bg-[#111927]">
        <button
          onClick={() => setMode("pdf")}
          disabled={!document.pdfUrl}
          className={`px-2.5 py-1.5 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
            mode === "pdf"
              ? "bg-gov-blue text-white shadow-sm"
              : "text-gov-text-secondary dark:text-gray-400 hover:bg-gov-offwhite dark:hover:bg-slate-800 disabled:opacity-30"
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" /> View Original PDF
        </button>
        <button
          onClick={() => setMode("edit")}
          className={`px-2.5 py-1.5 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
            mode === "edit"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-gov-green dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "text-gov-text-secondary dark:text-gray-400 hover:bg-gov-offwhite dark:hover:bg-slate-800"
          }`}
        >
          <Pencil className="w-3.5 h-3.5" /> Edit Document
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto bg-white dark:bg-[#0c1421]">
        {mode === "pdf" && document.pdfUrl ? (
          <LivePdfViewer pdfUrl={document.pdfUrl} />
        ) : (
          <div className="p-4 bg-white dark:bg-[#0c1421]">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveDocumentPanel;

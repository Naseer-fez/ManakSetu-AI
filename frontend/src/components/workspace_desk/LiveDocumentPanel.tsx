import React, { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import type { DocumentSource } from "@/components/workspace_desk/types";
import { LivePdfViewer } from "@/components/workspace_desk/LivePdfViewer";
import { LiveDocumentHeader, type DocumentViewMode } from "@/components/workspace_desk/LiveDocumentHeader";

interface LiveDocumentPanelProps {
  document: DocumentSource;
  revisedPdfUrl?: string | null;
  isCompilingPdf?: boolean;
  onEditorReady: (editor: Editor | null) => void;
  onEditorChange: (html: string) => void;
}

export const LiveDocumentPanel: React.FC<LiveDocumentPanelProps> = ({
  document,
  revisedPdfUrl,
  isCompilingPdf = false,
  onEditorReady,
  onEditorChange,
}) => {
  const [mode, setMode] = useState<DocumentViewMode>("original");
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
    setMode(document.pdfUrl ? "original" : "edit");
  }, [document.pdfUrl, document.name]);

  const activePdfUrl = mode === "revised" ? (revisedPdfUrl || document.pdfUrl) : document.pdfUrl;

  return (
    <section className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 overflow-hidden shadow-sm">
      <LiveDocumentHeader
        document={document}
        mode={mode}
        onSelectMode={setMode}
        isCompiling={isCompilingPdf}
      />

      <div className="flex-1 min-h-0 overflow-auto bg-white dark:bg-[#0c1421]">
        {mode === "edit" ? (
          <div className="p-4 bg-white dark:bg-[#0c1421] min-h-full">
            <EditorContent editor={editor} />
          </div>
        ) : (
          <LivePdfViewer
            file={mode === "original" ? document.file : null}
            pdfUrl={activePdfUrl || ""}
            title={mode === "revised" ? "Revised Tender PDF (Live Synced)" : "Original Tender PDF"}
          />
        )}
      </div>
    </section>
  );
};


export default LiveDocumentPanel;

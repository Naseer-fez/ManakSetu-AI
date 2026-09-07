import React from "react";
import { FileText, Layers, Eye } from "lucide-react";
import type { DocumentSource } from "@/components/workspace_desk/types";
import { formatFileSize } from "@/components/workspace_desk/workspace.utils";

interface DocumentSourcePanelProps {
  document: DocumentSource;
}

export const DocumentSourcePanel: React.FC<DocumentSourcePanelProps> = ({ document }) => {
  const sections = [
    { num: "Sec 1", title: "Scope & Qualifying Criteria", pages: "pp. 1-4" },
    { num: "Sec 2", title: "General Technical Provisions", pages: "pp. 5-11" },
    { num: "Sec 3", title: "Material Specs & Standard Conformance", pages: "pp. 12-18" },
    { num: "Sec 4", title: "Inspection, Testing & Acceptance", pages: "pp. 19-24" },
    { num: "Sec 5", title: "Warranty, Marking & Traceability", pages: "pp. 25-30" },
  ];

  return (
    <section className="flex flex-col h-full min-h-0 apple-glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Document Overview Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-apple-blue shrink-0" />
          <h3 className="text-xs font-semibold text-white truncate" title={document.name}>
            {document.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <span className="uppercase font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/70">
            {document.type}
          </span>
          <span>{document.sizeBytes > 0 ? formatFileSize(document.sizeBytes) : `${document.wordCount} words`}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4">
        {/* Clause Navigator */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2">
            <Layers className="w-3 h-3 text-white/40" />
            <span>Document Sections</span>
          </div>
          <div className="space-y-1.5">
            {sections.map((s, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 transition-colors cursor-pointer text-xs flex items-center justify-between"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-apple-blue block">{s.num}</span>
                  <span className="text-white/85 truncate block text-[11px]">{s.title}</span>
                </div>
                <span className="text-[10px] text-white/40 shrink-0 ml-2">{s.pages}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Source Text Preview Area */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-2">
            <Eye className="w-3 h-3 text-white/40" />
            <span>Source Excerpt Preview</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-white/70 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
            {document.contentSnippet || document.rawText || "No raw text excerpt available."}
          </div>
        </div>
      </div>
    </section>
  );
};

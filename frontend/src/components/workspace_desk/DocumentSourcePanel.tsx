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
    <section className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Document Overview Header */}
      <div className="px-4 py-2.5 border-b border-gov-border dark:border-slate-800 bg-gov-offwhite dark:bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-gov-blue dark:text-blue-400 shrink-0" />
          <h3 className="text-xs font-bold text-gov-navy dark:text-white truncate" title={document.name}>
            {document.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gov-text-secondary dark:text-gray-400">
          <span className="uppercase font-mono bg-white dark:bg-slate-800 border border-gov-border dark:border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-gov-navy dark:text-gray-200">
            {document.type}
          </span>
          <span>{document.sizeBytes > 0 ? formatFileSize(document.sizeBytes) : `${document.wordCount} words`}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4 bg-gov-offwhite dark:bg-[#0a0f18]">
        {/* Clause Navigator */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gov-navy dark:text-gray-200 uppercase tracking-wider mb-2">
            <Layers className="w-3 h-3 text-gov-text-secondary dark:text-gray-400" />
            <span>Document Sections</span>
          </div>
          <div className="space-y-1.5">
            {sections.map((s, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800/80 border border-gov-border dark:border-slate-700/60 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center justify-between shadow-sm"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-gov-blue dark:text-blue-400 font-semibold block">{s.num}</span>
                  <span className="text-gov-navy dark:text-gray-200 truncate block text-[11px] font-medium">{s.title}</span>
                </div>
                <span className="text-[10px] text-gov-text-secondary dark:text-gray-400 shrink-0 ml-2">{s.pages}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Source Text Preview Area */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gov-navy dark:text-gray-200 uppercase tracking-wider mb-2">
            <Eye className="w-3 h-3 text-gov-text-secondary dark:text-gray-400" />
            <span>Source Excerpt Preview</span>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-[#0c1626] border border-gov-border dark:border-slate-800 font-mono text-[11px] text-gov-text dark:text-gray-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
            {document.contentSnippet || document.rawText || "No raw text excerpt available."}
          </div>
        </div>
      </div>
    </section>
  );
};

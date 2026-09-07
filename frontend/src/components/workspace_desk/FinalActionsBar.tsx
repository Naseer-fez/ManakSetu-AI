import React from "react";
import { FileDown, FileText, Eye, Download, Info, Loader2 } from "lucide-react";

interface FinalActionsBarProps {
  onCreatePdf: () => void;
  isExporting: boolean;
  error?: string | null;
}

export const FinalActionsBar: React.FC<FinalActionsBarProps> = ({ onCreatePdf, isExporting, error }) => {
  const actions = [
    { id: "create_pdf", label: "Create PDF", icon: FileDown },
    { id: "view_pdf", label: "View PDF", icon: Eye },
    { id: "create_docx", label: "Create Standard DOCX", icon: FileText },
    { id: "download_report", label: "Download Compliance Report", icon: Download },
  ];

  return (
    <footer className="relative shrink-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-gov-text-secondary dark:text-gray-400">
        <Info className="w-3.5 h-3.5 shrink-0 text-gov-blue dark:text-blue-400" />
        <span className="text-[11px]">PDF export compiles the current active workspace clauses.</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        {actions.map((act) => {
          const Icon = act.icon;
          const isPdf = act.id === "create_pdf";
          return (
            <button
              key={act.id}
              onClick={isPdf ? onCreatePdf : undefined}
              disabled={!isPdf || isExporting}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isPdf
                  ? "bg-gov-blue hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  : "bg-gov-offwhite dark:bg-slate-800/80 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gov-border dark:border-slate-700 text-gov-navy dark:text-gray-200 disabled:opacity-40"
              }`}
              title={isPdf ? "Download regenerated PDF" : "Option active after statutory verification"}
            >
              {isPdf && isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Icon className={`w-3.5 h-3.5 ${isPdf ? "text-white" : "text-gov-text-secondary dark:text-gray-400"}`} />
              )}
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="w-full text-[11px] text-gov-red dark:text-red-400 sm:absolute sm:left-3 sm:bottom-[-1.25rem]">{error}</p>}
    </footer>
  );
};

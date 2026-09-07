import React from "react";
import { FileDown, FileText, Eye, Download, Info } from "lucide-react";

interface FinalActionsBarProps {
  onActionClick: (action: string) => void;
}

export const FinalActionsBar: React.FC<FinalActionsBarProps> = ({ onActionClick }) => {
  const actions = [
    { id: "create_pdf", label: "Create PDF", icon: FileDown },
    { id: "view_pdf", label: "View PDF", icon: Eye },
    { id: "create_docx", label: "Create Standard DOCX", icon: FileText },
    { id: "download_report", label: "Download Compliance Report", icon: Download },
  ];

  return (
    <footer className="shrink-0 apple-glass rounded-2xl border border-white/10 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-white/50">
        <Info className="w-3.5 h-3.5 text-white/40 shrink-0" />
        <span className="text-[11px]">
          Exports are in UI preview mode &middot; Active when backend services connect.
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onActionClick(act.label)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
              title={`${act.label} (UI only - connect export backend)`}
            >
              <Icon className="w-3.5 h-3.5 text-white/60" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

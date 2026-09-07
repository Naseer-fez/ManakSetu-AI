import React, { useState } from "react";
import { UnifiedAuditHeader } from "@/components/workspace/UnifiedAuditHeader";
import { UnifiedAuditMatrix } from "@/components/workspace/UnifiedAuditMatrix";
import { WorkspacePdfContent } from "@/components/workspace/WorkspacePdfContent";
import type { WorkspaceAnalysis } from "@/types";

interface UnifiedAuditWorkspaceProps {
  viewMode?: "audit" | "pdf" | "both";
  file: File;
  pdfBlobUrl: string | null;
  analysis: WorkspaceAnalysis;
  onReplaceFile: (f: File) => void;
  onExport: (format: "pdf" | "docx") => void;
  exportBusy: boolean;
  aiOpen: boolean;
  onToggleAi: () => void;
}

export const UnifiedAuditWorkspace: React.FC<UnifiedAuditWorkspaceProps> = ({
  viewMode = "both",
  file,
  pdfBlobUrl,
  analysis,
  onReplaceFile,
  onExport,
  exportBusy,
  aiOpen,
  onToggleAi,
}) => {
  const [activeView, setActiveView] = useState<"audit" | "pdf">(viewMode === "pdf" ? "pdf" : "audit");
  
  const currentView = viewMode === "both" ? activeView : viewMode;

  return (
    <section className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-sm overflow-hidden">
      <UnifiedAuditHeader
        viewMode={viewMode}
        fileName={file.name}
        fileSize={file.size}
        pdfBlobUrl={pdfBlobUrl}
        activeView={currentView}
        onViewChange={setActiveView}
        onReplaceFile={onReplaceFile}
        onExport={onExport}
        exportBusy={exportBusy}
        aiOpen={aiOpen}
        onToggleAi={onToggleAi}
      />

      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
        {currentView === "audit" ? (
          <UnifiedAuditMatrix analysis={analysis} />
        ) : (
          <WorkspacePdfContent file={file} pdfBlobUrl={pdfBlobUrl} />
        )}
      </div>
    </section>
  );
};

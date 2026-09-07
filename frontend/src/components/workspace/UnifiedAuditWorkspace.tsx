import React, { useState } from "react";
import { UnifiedAuditHeader } from "./UnifiedAuditHeader";
import { UnifiedAuditMatrix } from "./UnifiedAuditMatrix";
import { WorkspacePdfContent } from "./WorkspacePdfContent";
import type { WorkspaceAnalysis } from "../../types";

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
    <section className="flex flex-col h-full min-h-0 apple-glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
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

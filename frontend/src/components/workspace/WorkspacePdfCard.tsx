import React, { useState } from "react";
import { WorkspacePdfHeader } from "./WorkspacePdfHeader";
import { WorkspacePdfContent } from "./WorkspacePdfContent";
import { WorkspaceAuditContent } from "./WorkspaceAuditContent";
import type { TenderAnalysisReport } from "../../types";

interface WorkspacePdfCardProps {
  file: File;
  pdfBlobUrl: string | null;
  report?: TenderAnalysisReport | null;
  onReplaceFile: (f: File) => void;
}

export const WorkspacePdfCard: React.FC<WorkspacePdfCardProps> = ({
  file,
  pdfBlobUrl,
  report,
  onReplaceFile,
}) => {
  const [activeTab, setActiveTab] = useState<"pdf" | "audit">("pdf");

  return (
    <section className="flex flex-col h-full min-h-0 apple-glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
      <WorkspacePdfHeader
        fileName={file.name}
        fileSize={file.size}
        pdfBlobUrl={pdfBlobUrl}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onReplaceFile={onReplaceFile}
      />

      <div className="flex-1 min-h-0 relative overflow-hidden">
        {activeTab === "pdf" ? (
          <WorkspacePdfContent file={file} pdfBlobUrl={pdfBlobUrl} />
        ) : (
          <WorkspaceAuditContent report={report} />
        )}
      </div>
    </section>
  );
};

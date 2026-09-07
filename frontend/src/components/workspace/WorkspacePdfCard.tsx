import React, { useState } from "react";
import { WorkspacePdfHeader } from "@/components/workspace/WorkspacePdfHeader";
import { WorkspacePdfContent } from "@/components/workspace/WorkspacePdfContent";
import { WorkspaceAuditContent } from "@/components/workspace/WorkspaceAuditContent";
import type { TenderAnalysisReport } from "@/types";

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
    <section className="flex flex-col h-full min-h-0 bg-white dark:bg-[#111927] rounded-lg border border-gov-border dark:border-slate-800 shadow-sm overflow-hidden">
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

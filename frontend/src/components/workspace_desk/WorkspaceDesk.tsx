import React from "react";
import { useWorkspaceDesk } from "@/components/workspace_desk/useWorkspaceDesk";
import { WorkspaceHeader } from "@/components/workspace_desk/WorkspaceHeader";
import { WorkspaceEmptyState } from "@/components/workspace_desk/WorkspaceEmptyState";
import { WorkspaceUploadedState } from "@/components/workspace_desk/WorkspaceUploadedState";
import { WorkspaceAuditingState } from "@/components/workspace_desk/WorkspaceAuditingState";
import { WorkspaceReviewDesk } from "@/components/workspace_desk/WorkspaceReviewDesk";

interface WorkspaceDeskProps {
  onNavigate?: (page: string) => void;
  onSetPdfText?: (text: string) => void;
}

export const WorkspaceDesk: React.FC<WorkspaceDeskProps> = ({ onSetPdfText }) => {
  const ws = useWorkspaceDesk();

  const handleDocumentSelect = (file: File) => {
    void ws.handleFileSelect(file);
    if (onSetPdfText) onSetPdfText(`File: ${file.name}`);
  };

  const handleTextSubmit = (text: string) => {
    void ws.handleTextSubmit(text);
    if (onSetPdfText) onSetPdfText(text);
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 min-h-0 relative overflow-hidden">
      <WorkspaceHeader
        title={ws.title}
        onTitleChange={ws.setTitle}
        stage={ws.stage}
        onReset={ws.handleResetWorkspace}
      />

      <main className="flex-1 min-h-0 flex flex-col justify-center">
        {ws.isExtracting && (
          <div className="max-w-xl mx-auto mb-3 w-full rounded-lg border border-gov-blue/30 bg-gov-blue-light px-4 py-3 text-xs text-gov-blue font-medium">
            Extracting headings, paragraphs, and tables from the PDF…
          </div>
        )}
        {ws.stage === "error" && (
          <div className="max-w-xl mx-auto w-full bg-white dark:bg-[#111927] rounded-lg border border-gov-red/30 dark:border-gov-red/40 p-6 text-center space-y-3 shadow-sm">
            <p className="text-sm text-gov-red dark:text-rose-400 font-medium">{ws.error || "The workspace could not load this document."}</p>
            <button onClick={ws.handleResetWorkspace} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs text-gov-navy dark:text-gray-200 font-semibold border border-gov-border dark:border-slate-700">Try another document</button>
          </div>
        )}
        {ws.stage === "empty" && (
          <WorkspaceEmptyState
            onFileSelect={handleDocumentSelect}
            onTextSubmit={handleTextSubmit}
          />
        )}

        {ws.stage === "uploaded" && ws.document && (
          <WorkspaceUploadedState
            document={ws.document}
            onRemove={ws.handleResetWorkspace}
            onReplace={ws.handleResetWorkspace}
            onRunAudit={() => ws.setStage("auditing")}
          />
        )}

        {ws.stage === "auditing" && ws.document && (
          <WorkspaceAuditingState
            documentName={ws.document.name}
            onCancel={() => ws.setStage("uploaded")}
            onComplete={ws.handleRunAudit}
          />
        )}

        {ws.stage === "review" && ws.document && (
          <WorkspaceReviewDesk
            document={ws.document}
            findings={ws.findings}
            onApplyFinding={ws.handleApplyFinding}
            onCorrectionChange={ws.handleCorrectionChange}
            onIgnoreFinding={ws.handleIgnoreFinding}
            onResetFinding={ws.handleResetFinding}
            onAskAiForFinding={ws.handleAskAiForFinding}
            aiMessages={ws.aiMessages}
            aiInput={ws.aiInput}
            setAiInput={ws.setAiInput}
            onSendAiMessage={ws.handleSendAiMessage}
            onClearAiChat={() => ws.setAiMessages([])}
            onEditorReady={ws.setEditor}
            onEditorChange={ws.handleEditorChange}
            onCreatePdf={ws.handleCreatePdf}
            isExporting={ws.isExporting}
            error={ws.error}
          />
        )}
      </main>
    </div>
  );
};

export default WorkspaceDesk;

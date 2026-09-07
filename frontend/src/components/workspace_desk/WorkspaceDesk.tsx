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
    ws.handleFileSelect(file);
    if (onSetPdfText) onSetPdfText(`File: ${file.name}`);
  };

  const handleTextSubmit = (text: string) => {
    ws.handleTextSubmit(text);
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
        {ws.stage === "empty" && (
          <WorkspaceEmptyState
            onFileSelect={handleDocumentSelect}
            onTextSubmit={handleTextSubmit}
          />
        )}

        {ws.stage === "uploaded" && ws.document && (
          <WorkspaceUploadedState
            document={ws.document}
            onRemove={() => ws.setStage("empty")}
            onReplace={() => ws.setStage("empty")}
            onRunAudit={() => ws.setStage("auditing")}
          />
        )}

        {ws.stage === "auditing" && ws.document && (
          <WorkspaceAuditingState
            documentName={ws.document.name}
            onCancel={() => ws.setStage("uploaded")}
            onComplete={() => ws.setStage("review")}
          />
        )}

        {ws.stage === "review" && ws.document && (
          <WorkspaceReviewDesk
            document={ws.document}
            findings={ws.findings}
            onApplyFinding={ws.handleApplyFinding}
            onIgnoreFinding={ws.handleIgnoreFinding}
            onResetFinding={ws.handleResetFinding}
            onAskAiForFinding={ws.handleAskAiForFinding}
            aiMessages={ws.aiMessages}
            aiInput={ws.aiInput}
            setAiInput={ws.setAiInput}
            onSendAiMessage={ws.handleSendAiMessage}
            onClearAiChat={() => ws.setAiMessages([])}
          />
        )}
      </main>
    </div>
  );
};

export default WorkspaceDesk;

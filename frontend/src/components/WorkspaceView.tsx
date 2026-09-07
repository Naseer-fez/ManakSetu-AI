import React from "react";
import { useWorkspace } from "@/components/workspace/useWorkspace";
import { WorkspaceDropzone } from "@/components/workspace/WorkspaceDropzone";
import { WorkspaceLoadingView } from "@/components/workspace/WorkspaceLoadingView";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { WorkspaceFloatingAiButton } from "@/components/workspace/WorkspaceFloatingAiButton";
import { WorkspaceToolbar } from "@/components/workspace/WorkspaceToolbar";
import { IndependentIssueChatModal } from "@/components/workspace/IndependentIssueChatModal";

interface WorkspaceViewProps {
  setPdfText?: (text: string) => void;
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tabId?: string;
  viewMode?: "audit" | "pdf" | "both";
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({ setPdfText, title, icon, tabId = "workspace", viewMode = "both" }) => {
  const ws = useWorkspace(tabId, setPdfText);

  return (
    <div className="w-full h-full flex flex-col gap-3 min-h-0 relative overflow-hidden">
      <WorkspaceToolbar workspaceId={ws.workspaceId} onNewSession={ws.resetSession} title={title} icon={icon} />

      <div className="flex-1 min-h-0 relative overflow-hidden">
        {ws.busy ? (
          <WorkspaceLoadingView fileName={ws.file?.name} />
        ) : !ws.analysis || !ws.file ? (
          <WorkspaceDropzone onFileSelected={ws.handleFileSelected} loading={ws.busy} />
        ) : (
          <WorkspaceLayout
            viewMode={viewMode}
            file={ws.file}
            pdfBlobUrl={ws.pdfBlobUrl}
            analysis={ws.analysis}
            aiOpen={ws.aiOpen}
            onToggleAi={() => ws.setAiOpen(p => !p)}
            onCloseAi={() => ws.setAiOpen(false)}
            onReplaceFile={ws.handleFileSelected}
            onExport={ws.handleExport}
            exportBusy={ws.exportBusy}
            aiMessages={ws.aiMessages}
            onSendAiMessage={ws.handleSendMessage}
            onClearAiChat={() => ws.setAiMessages([])}
            aiLoading={ws.aiLoading}
            aiReady={!ws.busy && !!ws.analysis}
            aiMode={ws.aiMode}
            setAiMode={ws.setAiMode}
          />
        )}

        {!ws.aiOpen && ws.file && !ws.busy && (
          <WorkspaceFloatingAiButton onClick={() => ws.setAiOpen(true)} />
        )}
        <IndependentIssueChatModal />
      </div>
    </div>
  );
};

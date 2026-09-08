import React, { useState, useRef } from "react";
import type { DocumentSource, ComplianceFindingItem, WorkspaceChatMessage } from "@/components/workspace_desk/types";
import type { Editor } from "@tiptap/react";
import { LiveDocumentPanel } from "@/components/workspace_desk/LiveDocumentPanel";
import { FindingsPanel } from "@/components/workspace_desk/FindingsPanel";
import { AskAiPanel } from "@/components/workspace_desk/AskAiPanel";
import { FinalActionsBar } from "@/components/workspace_desk/FinalActionsBar";
import { DeskPanelAdjuster } from "@/components/workspace_desk/DeskPanelAdjuster";
import { WorkspaceDeskAiBar } from "@/components/workspace_desk/WorkspaceDeskAiBar";
import { useMultiPanelResize } from "@/components/workspace_desk/useMultiPanelResize";

interface WorkspaceReviewDeskProps {
  document: DocumentSource;
  findings: ComplianceFindingItem[];
  revisedPdfUrl?: string | null;
  isCompilingPdf?: boolean;
  onApplyFinding: (id: string) => void;
  onIgnoreFinding: (id: string) => void;
  onResetFinding: (id: string) => void;
  onRestoreAllIgnored?: () => void;
  onAskAiForFinding: (finding: ComplianceFindingItem) => void;
  onCorrectionChange: (id: string, value: string) => void;
  aiMessages: WorkspaceChatMessage[];
  aiInput: string;
  setAiInput: (val: string) => void;
  onSendAiMessage: () => void;
  onClearAiChat: () => void;
  onEditorReady: (editor: Editor | null) => void;
  onEditorChange: (html: string) => void;
  onCreatePdf: () => void;
  isExporting: boolean;
  error?: string | null;
}

export const WorkspaceReviewDesk: React.FC<WorkspaceReviewDeskProps> = (props) => {
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { docPct, findingsPct, aiPct, handleDocDividerDrag, handleAiDividerDrag, resetLayout } =
    useMultiPanelResize(containerRef, aiOpen);

  const handleAskAi = (finding: ComplianceFindingItem) => {
    setAiOpen(true);
    props.onAskAiForFinding(finding);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3 h-full overflow-hidden relative">
      <div ref={containerRef} className="flex-1 min-h-0 flex flex-col lg:flex-row gap-1 overflow-y-auto lg:overflow-hidden relative">
        {/* Document Panel */}
        <div style={{ flex: `0 0 ${docPct}%` }} className="h-80 lg:h-full min-h-0 min-w-0 transition-all">
          <LiveDocumentPanel
            document={props.document}
            revisedPdfUrl={props.revisedPdfUrl}
            isCompilingPdf={props.isCompilingPdf}
            onEditorReady={props.onEditorReady}
            onEditorChange={props.onEditorChange}
          />
        </div>

        {/* Adjuster 1: Between Document and Findings */}
        <DeskPanelAdjuster onDragStart={handleDocDividerDrag} onReset={resetLayout} label="Resize Document & Findings" />

        {/* Findings Panel */}
        <div style={{ flex: `0 0 ${findingsPct}%` }} className="h-[480px] lg:h-full min-h-0 min-w-0 transition-all">
          <FindingsPanel
            findings={props.findings}
            onApplyFinding={props.onApplyFinding}
            onIgnoreFinding={props.onIgnoreFinding}
            onResetFinding={props.onResetFinding}
            onRestoreAllIgnored={props.onRestoreAllIgnored}
            onAskAiForFinding={handleAskAi}
            onCorrectionChange={props.onCorrectionChange}
          />
        </div>

        {/* Adjuster 2 & AI Copilot Panel (when open) */}
        {aiOpen && (
          <>
            <DeskPanelAdjuster onDragStart={handleAiDividerDrag} onReset={resetLayout} label="Resize Findings & Copilot" />
            <div style={{ flex: `0 0 ${aiPct}%` }} className="h-[440px] lg:h-full min-h-0 min-w-0 transition-all">
              <AskAiPanel
                messages={props.aiMessages}
                inputPrompt={props.aiInput}
                setInputPrompt={props.setAiInput}
                onSendMessage={props.onSendAiMessage}
                onClearChat={props.onClearAiChat}
                onClose={() => setAiOpen(false)}
              />
            </div>
          </>
        )}
      </div>

      <FinalActionsBar onCreatePdf={props.onCreatePdf} revisedPdfUrl={props.revisedPdfUrl} isExporting={props.isExporting} error={props.error} />

      {!aiOpen && (
        <WorkspaceDeskAiBar onClick={() => setAiOpen(true)} unreadCount={props.findings.filter(f => f.resolution === "pending").length} />
      )}
    </div>
  );
};

export default WorkspaceReviewDesk;

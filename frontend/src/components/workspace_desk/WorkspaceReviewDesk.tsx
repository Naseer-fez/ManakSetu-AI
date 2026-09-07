import React from "react";
import type { DocumentSource, ComplianceFindingItem, WorkspaceChatMessage } from "@/components/workspace_desk/types";
import type { Editor } from "@tiptap/react";
import { LiveDocumentPanel } from "@/components/workspace_desk/LiveDocumentPanel";
import { FindingsPanel } from "@/components/workspace_desk/FindingsPanel";
import { AskAiPanel } from "@/components/workspace_desk/AskAiPanel";
import { FinalActionsBar } from "@/components/workspace_desk/FinalActionsBar";

interface WorkspaceReviewDeskProps {
  document: DocumentSource;
  findings: ComplianceFindingItem[];
  onApplyFinding: (id: string) => void;
  onIgnoreFinding: (id: string) => void;
  onResetFinding: (id: string) => void;
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
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3 h-full overflow-hidden">
      {/* 3-Column Desktop Layout / Stacked on Mobile & Tablet */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-y-auto lg:overflow-hidden">
        <div className="lg:col-span-3 h-80 lg:h-full min-h-0">
          <LiveDocumentPanel document={props.document} onEditorReady={props.onEditorReady} onEditorChange={props.onEditorChange} />
        </div>

        <div className="lg:col-span-5 h-[480px] lg:h-full min-h-0">
          <FindingsPanel
            findings={props.findings}
            onApplyFinding={props.onApplyFinding}
            onIgnoreFinding={props.onIgnoreFinding}
            onResetFinding={props.onResetFinding}
            onAskAiForFinding={props.onAskAiForFinding}
            onCorrectionChange={props.onCorrectionChange}
          />
        </div>

        <div className="lg:col-span-4 h-[440px] lg:h-full min-h-0">
          <AskAiPanel
            messages={props.aiMessages}
            inputPrompt={props.aiInput}
            setInputPrompt={props.setAiInput}
            onSendMessage={props.onSendAiMessage}
            onClearChat={props.onClearAiChat}
          />
        </div>
      </div>

      {/* Export Bar */}
      <FinalActionsBar onCreatePdf={props.onCreatePdf} isExporting={props.isExporting} error={props.error} />
    </div>
  );
};

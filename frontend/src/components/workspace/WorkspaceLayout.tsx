import React, { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UnifiedAuditWorkspace } from "@/components/workspace/UnifiedAuditWorkspace";
import { WorkspaceAiPanel } from "@/components/workspace/WorkspaceAiPanel";
import { WorkspaceResizeHandle } from "@/components/workspace/WorkspaceResizeHandle";
import { useLayoutDrag } from "@/components/workspace/useLayoutDrag";
import type { WorkspaceAnalysis } from "@/types";
import type { ChatMessage } from "@/components/ChatMessageItem";

interface WorkspaceLayoutProps {
  viewMode?: "audit" | "pdf" | "both";
  file: File;
  pdfBlobUrl: string | null;
  analysis: WorkspaceAnalysis;
  aiOpen: boolean;
  onToggleAi: () => void;
  onCloseAi: () => void;
  onReplaceFile: (f: File) => void;
  onExport: (format: "pdf" | "docx") => void;
  exportBusy: boolean;
  aiMessages: ChatMessage[];
  onSendAiMessage: (q: string) => void;
  onClearAiChat: () => void;
  aiLoading: boolean;
  aiReady: boolean;
  aiMode: "fast" | "heavy";
  setAiMode: (m: "fast" | "heavy") => void;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = (props) => {
  const { viewMode = "both", file, pdfBlobUrl, analysis, aiOpen, onToggleAi, onCloseAi, onReplaceFile, onExport, exportBusy,
    aiMessages, onSendAiMessage, onClearAiChat, aiLoading, aiReady, aiMode, setAiMode } = props;

  const [aiPercent, setAiPercent] = useState<number>(60);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleDragStart = useLayoutDrag(containerRef, setAiPercent);

  return (
    <div ref={containerRef} className="flex flex-col lg:flex-row gap-2 h-full min-h-0 w-full overflow-hidden relative">
      {/* Primary Audit Workspace: 100% when closed, (100 - aiPercent)% when AI open */}
      <motion.div
        layout transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`h-full min-h-0 overflow-hidden transition-all ${aiOpen ? "w-full min-w-0" : "w-full flex-1"}`}
        style={aiOpen ? { flex: `0 0 calc(${100 - aiPercent}% - 6px)` } : undefined}
      >
        <UnifiedAuditWorkspace
          viewMode={viewMode}
          file={file} pdfBlobUrl={pdfBlobUrl} analysis={analysis}
          onReplaceFile={onReplaceFile} onExport={onExport} exportBusy={exportBusy}
          aiOpen={aiOpen} onToggleAi={onToggleAi}
        />
      </motion.div>

      {/* Resizer Divider */}
      {aiOpen && (
        <WorkspaceResizeHandle
          onDragStart={handleDragStart}
          onSetRatio={setAiPercent}
          currentPercent={aiPercent}
        />
      )}

      {/* AI Copilot: Default at least 60% of horizontal space */}
      <AnimatePresence mode="popLayout">
        {aiOpen && (
          <motion.div
            key="workspace-ai-column"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full h-full min-h-0 overflow-hidden shrink-0"
            style={{ flex: `0 0 calc(${aiPercent}% - 6px)` }}
          >
            <WorkspaceAiPanel
              onClose={onCloseAi} fileName={file.name} messages={aiMessages}
              onSendMessage={onSendAiMessage} onClearChat={onClearAiChat}
              loading={aiLoading} isReady={aiReady} mode={aiMode} setMode={setAiMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

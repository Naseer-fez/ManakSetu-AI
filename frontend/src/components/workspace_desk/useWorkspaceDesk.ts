import { useState } from "react";
import type {
  WorkspaceStage,
  DocumentSource,
  ComplianceFindingItem,
  WorkspaceChatMessage,
} from "@/components/workspace_desk/types";
import { SAMPLE_WORKSPACE_FINDINGS } from "@/components/workspace_desk/sampleFindings";
import { generateAiPromptForFinding, countWords } from "@/components/workspace_desk/workspace.utils";

export function useWorkspaceDesk() {
  const [title, setTitle] = useState("New Workspace");
  const [stage, setStage] = useState<WorkspaceStage>("empty");
  const [document, setDocument] = useState<DocumentSource | null>(null);
  const [findings, setFindings] = useState<ComplianceFindingItem[]>(SAMPLE_WORKSPACE_FINDINGS);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<WorkspaceChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      text: "Ask about a finding or request help rewriting a tender clause.",
      timestamp: "Ready",
    },
  ]);

  const handleFileSelect = (file: File) => {
    setDocument({
      name: file.name,
      type: file.name.split(".").pop() || "doc",
      sizeBytes: file.size,
      wordCount: 0,
      contentSnippet: `Document loaded: "${file.name}" (${file.size} bytes). Ready for statutory audit review.`,
      file,
    });
    setStage("uploaded");
  };

  const handleTextSubmit = (text: string) => {
    setDocument({
      name: "Pasted Tender Clauses.txt",
      type: "txt",
      sizeBytes: text.length,
      wordCount: countWords(text),
      contentSnippet: text.slice(0, 500) + (text.length > 500 ? "..." : ""),
      rawText: text,
    });
    setStage("uploaded");
  };

  const handleApplyFinding = (id: string) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, resolution: "applied" } : f)));
  };

  const handleIgnoreFinding = (id: string) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, resolution: "ignored" } : f)));
  };

  const handleResetFinding = (id: string) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, resolution: "pending" } : f)));
  };

  const handleAskAiForFinding = (finding: ComplianceFindingItem) => {
    setAiInput(generateAiPromptForFinding(finding));
  };

  const handleSendAiMessage = () => {
    if (!aiInput.trim()) return;
    const userMsg: WorkspaceChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: aiInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const replyMsg: WorkspaceChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: "assistant",
      text: "Local UI Notice: This is a front-end preview desk. LLM synthesis will activate when backend services are connected.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setAiMessages((prev) => [...prev, userMsg, replyMsg]);
    setAiInput("");
  };

  const handleResetWorkspace = () => {
    setTitle("New Workspace");
    setStage("empty");
    setDocument(null);
    setFindings(SAMPLE_WORKSPACE_FINDINGS);
    setAiInput("");
  };

  return {
    title, setTitle, stage, setStage, document, findings,
    aiInput, setAiInput, aiMessages, setAiMessages,
    handleFileSelect, handleTextSubmit, handleApplyFinding,
    handleIgnoreFinding, handleResetFinding, handleAskAiForFinding,
    handleSendAiMessage, handleResetWorkspace,
  };
}

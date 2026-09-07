import type { WorkspaceAnalysis, ExtractedLineItem, ChatMessage, TabData, IssueModalTarget } from "@/types";

export interface PendingAiAction {
  key: string;
  title: string;
  category: string;
  severity: string;
  message: string;
}

export interface RemembranceContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingAiAction: PendingAiAction | null;
  setPendingAiAction: (action: PendingAiAction | null) => void;
  file: File | null;
  pdfBlobUrl: string | null;
  pdfText: string;
  analysis: WorkspaceAnalysis | null;
  setTenderData: (f: File, a: WorkspaceAnalysis, url: string, text?: string) => void;
  clearTenderData: () => void;
  tabs: Record<string, TabData>;
  setTabData: (tabId: string, data: Partial<TabData>) => void;
  clearTabData: (tabId: string) => void;
  isPdfConnectedToAiChat: boolean;
  setIsPdfConnectedToAiChat: (connected: boolean) => void;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatInput: string;
  setChatInput: (s: string) => void;
  chatMode: "fast" | "heavy";
  setChatMode: (m: "fast" | "heavy") => void;
  issueChats: Record<string, ChatMessage[]>;
  updateIssueChat: (key: string, msgs: ChatMessage[]) => void;
  activeIssueModal: IssueModalTarget | null;
  setActiveIssueModal: (item: IssueModalTarget | null) => void;
  gemSimItem: ExtractedLineItem | null;
  setGemSimItem: (item: ExtractedLineItem | null) => void;
  graphFocusTender: boolean;
  setGraphFocusTender: (focus: boolean) => void;
}

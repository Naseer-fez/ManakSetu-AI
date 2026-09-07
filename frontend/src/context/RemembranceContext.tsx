import React, { createContext, useContext, useState, useEffect } from "react";
import type { WorkspaceAnalysis, ExtractedLineItem } from "../types";
import type { ChatMessage } from "../components/ChatMessageItem";

export interface IssueModalTarget {
  key: string;
  title: string;
  category: string;
  severity: string;
  message: string;
  correctiveAction?: string;
  standards?: string[];
}

export interface TabData {
  file: File | null;
  pdfBlobUrl: string | null;
  pdfText: string;
  analysis: WorkspaceAnalysis | null;
  chatMessages: ChatMessage[];
}

interface RemembranceContextType {
  // Global / Legacy
  file: File | null;
  pdfBlobUrl: string | null;
  pdfText: string;
  analysis: WorkspaceAnalysis | null;
  setTenderData: (f: File, a: WorkspaceAnalysis, url: string, text?: string) => void;
  clearTenderData: () => void;
  
  // Tab-specific caching
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

const RemembranceContext = createContext<RemembranceContextType | undefined>(undefined);

export const RemembranceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [analysis, setAnalysis] = useState<WorkspaceAnalysis | null>(null);
  
  const [tabs, setTabs] = useState<Record<string, TabData>>({});

  const [isPdfConnectedToAiChat, setIsPdfConnectedToAiChat] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Welcome to **BIS Intelligence**. Ask me anything regarding BIS specifications, QCO orders, or GeM compliance." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<"fast" | "heavy">("fast");
  const [issueChats, setIssueChats] = useState<Record<string, ChatMessage[]>>({});
  const [activeIssueModal, setActiveIssueModal] = useState<IssueModalTarget | null>(null);
  const [gemSimItem, setGemSimItem] = useState<ExtractedLineItem | null>(null);
  const [graphFocusTender, setGraphFocusTender] = useState(true);

  useEffect(() => () => { if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl); }, [pdfBlobUrl]);

  const setTenderData = (f: File, a: WorkspaceAnalysis, url: string, text?: string) => {
    setFile(f);
    setAnalysis(a);
    setPdfBlobUrl(url);
    if (text) setPdfText(text);
    setIsPdfConnectedToAiChat(true);
  };

  const clearTenderData = () => {
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    setFile(null); setAnalysis(null); setPdfBlobUrl(null); setPdfText("");
  };

  const setTabData = (tabId: string, data: Partial<TabData>) => {
    setTabs(prev => ({
      ...prev,
      [tabId]: {
        ...(prev[tabId] || { file: null, pdfBlobUrl: null, pdfText: "", analysis: null, chatMessages: [] }),
        ...data
      }
    }));
  };

  const clearTabData = (tabId: string) => {
    setTabs(prev => {
      const next = { ...prev };
      if (next[tabId]?.pdfBlobUrl) URL.revokeObjectURL(next[tabId].pdfBlobUrl as string);
      delete next[tabId];
      return next;
    });
  };

  const updateIssueChat = (key: string, msgs: ChatMessage[]) => {
    setIssueChats(prev => ({ ...prev, [key]: msgs }));
  };

  return (
    <RemembranceContext.Provider
      value={{
        file, pdfBlobUrl, pdfText, analysis, setTenderData, clearTenderData,
        tabs, setTabData, clearTabData,
        isPdfConnectedToAiChat, setIsPdfConnectedToAiChat,
        chatMessages, setChatMessages, chatInput, setChatInput, chatMode, setChatMode,
        issueChats, updateIssueChat, activeIssueModal, setActiveIssueModal,
        gemSimItem, setGemSimItem, graphFocusTender, setGraphFocusTender,
      }}
    >
      {children}
    </RemembranceContext.Provider>
  );
};

export const useRemembrance = () => {
  const ctx = useContext(RemembranceContext);
  if (!ctx) throw new Error("useRemembrance must be used within a RemembranceProvider");
  return ctx;
};

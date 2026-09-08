import React, { createContext, useContext, useState, useEffect } from "react";
import type { WorkspaceAnalysis, ExtractedLineItem, ChatMessage, TabData, IssueModalTarget } from "@/types";
import type { RemembranceContextType, PendingAiAction } from "@/context/remembrance.types";

export type { IssueModalTarget, TabData, ChatMessage, PendingAiAction };

const CHAT_STORAGE_KEY = "bis_specai_chat_history";

const RemembranceContext = createContext<RemembranceContextType | undefined>(undefined);

export const RemembranceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>("recommend");
  const [pendingAiAction, setPendingAiAction] = useState<PendingAiAction | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [analysis, setAnalysis] = useState<WorkspaceAnalysis | null>(null);
  const [tabs, setTabs] = useState<Record<string, TabData>>({});
  const [isPdfConnectedToAiChat, setIsPdfConnectedToAiChat] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<"fast" | "heavy">("fast");
  const [issueChats, setIssueChats] = useState<Record<string, ChatMessage[]>>({});
  const [activeIssueModal, setActiveIssueModal] = useState<IssueModalTarget | null>(null);
  const [gemSimItem, setGemSimItem] = useState<ExtractedLineItem | null>(null);
  const [graphFocusTender, setGraphFocusTender] = useState(true);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (err: unknown) { /* fallback */ }
    }
    return [{ role: "assistant", text: "Welcome to **BIS Intelligence**. Ask me anything regarding BIS specifications, QCO orders, or GeM compliance." }];
  });

  useEffect(() => {
    try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages)); } catch (err: unknown) { /* ignore */ }
  }, [chatMessages]);

  useEffect(() => {
    // Persistent blob URLs are managed by pdfStorage.utils
  }, []);

  const setTenderData = (f: File, a: WorkspaceAnalysis, url: string, text?: string) => {
    setFile(f); setAnalysis(a); setPdfBlobUrl(url); if (text) setPdfText(text); setIsPdfConnectedToAiChat(true);
    setTabs(prev => ({
      ...prev,
      tender: { file: f, pdfBlobUrl: url, pdfText: text || "", analysis: a, chatMessages: prev.tender?.chatMessages || [] },
      workspace: { file: f, pdfBlobUrl: url, pdfText: text || "", analysis: a, chatMessages: prev.workspace?.chatMessages || [] },
    }));
  };

  const clearTenderData = () => {
    if (pdfBlobUrl && pdfBlobUrl.startsWith("blob:")) URL.revokeObjectURL(pdfBlobUrl);
    setFile(null); setAnalysis(null); setPdfBlobUrl(null); setPdfText("");
  };

  const setTabData = (tabId: string, data: Partial<TabData>) => {
    setTabs(prev => ({
      ...prev,
      [tabId]: { ...(prev[tabId] || { file: null, pdfBlobUrl: null, pdfText: "", analysis: null, chatMessages: [] }), ...data },
    }));
  };

  const clearTabData = (tabId: string) => {
    setTabs(prev => {
      const next = { ...prev };
      if (next[tabId]?.pdfBlobUrl && (next[tabId].pdfBlobUrl as string).startsWith("blob:")) {
        URL.revokeObjectURL(next[tabId].pdfBlobUrl as string);
      }
      delete next[tabId];
      return next;
    });
  };

  const updateIssueChat = (key: string, msgs: ChatMessage[]) => setIssueChats(prev => ({ ...prev, [key]: msgs }));

  return (
    <RemembranceContext.Provider
      value={{
        activeTab, setActiveTab, pendingAiAction, setPendingAiAction,
        file, pdfBlobUrl, pdfText, analysis, setTenderData, clearTenderData,
        tabs, setTabData, clearTabData, isPdfConnectedToAiChat, setIsPdfConnectedToAiChat,
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

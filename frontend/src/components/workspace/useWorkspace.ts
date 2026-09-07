import { useState } from "react";
import { analyzeWorkspace, askWorkspace, createWorkspace, exportWorkspace } from "../../services/api.service";
import { useRemembrance } from "../../context/RemembranceContext";
import type { WorkspaceAnalysis } from "../../types";
import type { ChatMessage } from "../ChatMessageItem";

export function useWorkspace(tabId: string, onPdfTextLoaded?: (t: string) => void) {
  const rem = useRemembrance();
  const [workspaceId, setWorkspaceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMode, setAiMode] = useState<"fast" | "heavy">("heavy");
  const [aiLoading, setAiLoading] = useState(false);

  const tabData = rem.tabs[tabId] || {
    file: null,
    pdfBlobUrl: null,
    pdfText: "",
    analysis: null,
    chatMessages: []
  };

  const setFile = (f: File | null) => rem.setTabData(tabId, { file: f });
  const setPdfBlobUrl = (url: string | null) => rem.setTabData(tabId, { pdfBlobUrl: url });
  const setAnalysis = (a: WorkspaceAnalysis | null) => rem.setTabData(tabId, { analysis: a });
  const setAiMessages = (action: React.SetStateAction<ChatMessage[]>) => {
    const nextMessages = typeof action === 'function' ? action(tabData.chatMessages) : action;
    rem.setTabData(tabId, { chatMessages: nextMessages });
  };

  const file = tabData.file;
  const pdfBlobUrl = tabData.pdfBlobUrl;
  const analysis = tabData.analysis;
  const aiMessages = tabData.chatMessages;

  const ensureWorkspace = async (): Promise<string> => {
    if (workspaceId) return workspaceId;
    const res = await createWorkspace(`Workspace-${Date.now().toString().slice(-4)}`);
    setWorkspaceId(res.workspace_id);
    return res.workspace_id;
  };

  const handleFileSelected = async (f: File) => {
    setBusy(true); 
    setFile(f);
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    const newUrl = URL.createObjectURL(f);
    setPdfBlobUrl(newUrl);
    try {
      const wsId = await ensureWorkspace();
      const res = await analyzeWorkspace(wsId, f);
      setAnalysis(res);
      const rawText = res.report?.raw_text || "";
      rem.setTenderData(f, res, newUrl, rawText); // sync globally for other legacy uses if needed
      if (rawText && onPdfTextLoaded) onPdfTextLoaded(rawText);
      setAiMessages([{ role: "assistant", text: `Grounded in **${f.name}**.\n- Coverage: **${res.compliance_run.coverage}%**\n- Findings: **${res.compliance_run.findings.length}** issues.\n\nAsk me anything about this tender.` }]);
    } catch { 
      setAnalysis(null); 
    } finally { 
      setBusy(false); 
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!workspaceId) return;
    setExportBusy(true);
    try {
      const blob = await exportWorkspace(workspaceId, format);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `Audited_Tender_${workspaceId.slice(0, 8)}.${format}`;
      a.click();
    } finally { setExportBusy(false); }
  };

  const handleSendMessage = async (q: string) => {
    setAiLoading(true);
    setAiMessages(prev => [...prev, { role: "user", text: q }, { role: "assistant", text: "" }]);
    try {
      const wsId = await ensureWorkspace();
      const res = await askWorkspace(wsId, q, analysis?.report?.raw_text);
      setAiMessages(p => [...p.slice(0, -1), { role: "assistant", text: res.answer }]);
    } catch {
      setAiMessages(p => [...p.slice(0, -1), { role: "assistant", text: "AI Assistant could not respond to this query." }]);
    } finally { setAiLoading(false); }
  };

  const resetSession = () => {
    rem.clearTabData(tabId);
    setAiOpen(false);
  };

  return {
    workspaceId, file, pdfBlobUrl, analysis, busy, exportBusy,
    aiOpen, setAiOpen, aiMode, setAiMode, aiLoading, aiMessages, setAiMessages,
    handleFileSelected, handleExport, handleSendMessage, resetSession,
  };
}

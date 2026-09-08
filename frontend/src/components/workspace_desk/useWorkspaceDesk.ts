import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  analyzeWorkspace,
  askWorkspace,
  clearWorkspaceChat,
  createWorkspace,
  exportWorkspacePdf,
  extractWorkspaceDocument,
  applyPdfEdits,
  getWorkspacePdfUrl,
  compilePdfPreview,
} from "@/services/api.service";
import type { PdfEdit } from "@/services/api.service";
import type { WorkspaceFinding } from "@/types";
import type { WorkspaceStage, DocumentSource, ComplianceFindingItem, WorkspaceChatMessage } from "@/components/workspace_desk/types";
import { SAMPLE_WORKSPACE_FINDINGS } from "@/components/workspace_desk/sampleFindings";
import { generateAiPromptForFinding, countWords, replaceExactEditorBlock } from "@/components/workspace_desk/workspace.utils";

function plainTextToHtml(text: string): string {
  return text.split(/\n{2,}/).filter((p) => p.trim()).map((p) =>
    `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>`
  ).join("");
}

function findingStatus(severity: string): ComplianceFindingItem["status"] {
  const upper = severity.toUpperCase();
  if (upper === "HIGH" || upper === "CRITICAL") return "critical";
  if (upper === "MEDIUM" || upper === "WARNING") return "warning";
  if (upper === "LOW") return "needs_verification";
  return "passed";
}

function mapFinding(finding: WorkspaceFinding): ComplianceFindingItem {
  return {
    id: finding.finding_id,
    clauseLocation: finding.clause_location || "Sourced tender clause",
    status: findingStatus(finding.severity),
    resolution: "pending",
    explanation: finding.message,
    suggestedCorrection: finding.corrective_action,
    sourceText: finding.source_text,
    replacementText: finding.corrective_action,
    category: finding.category,
  };
}

export function useWorkspaceDesk() {
  const [title, setTitle] = useState("New Workspace");
  const [stage, setStage] = useState<WorkspaceStage>("empty");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [document, setDocument] = useState<DocumentSource | null>(null);
  const [findings, setFindings] = useState<ComplianceFindingItem[]>(SAMPLE_WORKSPACE_FINDINGS);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<WorkspaceChatMessage[]>([
    { id: "init-1", role: "assistant", text: "Ask about a finding or request help rewriting a tender clause.", timestamp: "Ready" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAuditReady, setIsAuditReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCompilingPdf, setIsCompilingPdf] = useState(false);
  const [revisedPdfUrl, setRevisedPdfUrl] = useState<string | null>(null);
  const [pendingEdits, setPendingEdits] = useState<PdfEdit[]>([]);

  const editorRef = useRef<Editor | null>(null);
  const recompileTimeoutRef = useRef<number | null>(null);

  const setEditor = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  const cleanupUrls = useCallback(() => {
    // Backend-served URLs do not need manual revocation
  }, []);

  useEffect(() => () => cleanupUrls(), [cleanupUrls]);

  const recompilePdf = useCallback(async (htmlContent: string, currentWorkspaceId: string, docName: string, edits: PdfEdit[] = []) => {
    if (!currentWorkspaceId || !docName || !htmlContent.trim()) return;
    setIsCompilingPdf(true);
    try {
      const result = await compilePdfPreview(currentWorkspaceId, htmlContent, docName, edits);
      setRevisedPdfUrl(result.pdf_url);
    } catch {
      // Recompile failure is non-fatal for live preview
    } finally {
      setIsCompilingPdf(false);
    }
  }, []);

  const triggerRecompileDebounced = useCallback((html: string, currentEdits: PdfEdit[] = pendingEdits) => {
    if (!workspaceId || !document?.name) return;
    if (recompileTimeoutRef.current) window.clearTimeout(recompileTimeoutRef.current);
    const targetWsId = workspaceId;
    const targetName = document.name;
    recompileTimeoutRef.current = window.setTimeout(() => {
      void recompilePdf(html, targetWsId, targetName, currentEdits);
    }, 1200);
  }, [workspaceId, document?.name, recompilePdf, pendingEdits]);

  const handleEditorChange = useCallback((html: string) => {
    setDocument((curr) => curr ? { ...curr, documentHtml: html } : curr);
    triggerRecompileDebounced(html);
  }, [triggerRecompileDebounced]);

  const handleFileSelect = async (file: File) => {
    cleanupUrls();
    setError(null);
    setIsAuditReady(false);
    setIsExtracting(true);
    setStage("auditing");
    setPendingEdits([]);

    setDocument({
      name: file.name,
      type: "pdf",
      sizeBytes: file.size,
      wordCount: 0,
      contentSnippet: "Reading document structure...",
      file,
      pdfUrl: undefined,
    });

    try {
      const workspace = await createWorkspace(file.name);
      setWorkspaceId(workspace.workspace_id);

      const extracted = await extractWorkspaceDocument(workspace.workspace_id, file);
      const backendPdfUrl = getWorkspacePdfUrl(workspace.workspace_id, "original");
      setDocument((curr) => curr ? {
        ...curr,
        workspaceId: workspace.workspace_id,
        name: extracted.document_name,
        wordCount: extracted.word_count,
        contentSnippet: extracted.markdown.slice(0, 500),
        rawText: extracted.markdown,
        documentHtml: extracted.document_html,
        pdfUrl: backendPdfUrl,
      } : curr);

      const analysis = await analyzeWorkspace(workspace.workspace_id, file);
      if (analysis?.compliance_run?.findings) {
        setFindings(analysis.compliance_run.findings.map(mapFinding));
      }
      setIsAuditReady(true);
      void recompilePdf(extracted.document_html, workspace.workspace_id, extracted.document_name);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to complete document audit");
      setStage("error");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTextSubmit = async (text: string) => {
    cleanupUrls();
    setError(null);
    setIsAuditReady(false);
    setStage("auditing");

    const html = plainTextToHtml(text);
    const file = new File([text], "pasted-specifications.txt", { type: "text/plain" });

    setDocument({
      name: "pasted-specifications.txt",
      type: "txt",
      sizeBytes: text.length,
      wordCount: countWords(text),
      contentSnippet: text.slice(0, 500) + (text.length > 500 ? "..." : ""),
      rawText: text,
      documentHtml: html,
      file,
    });

    try {
      const workspace = await createWorkspace("Pasted Tender Clauses");
      setWorkspaceId(workspace.workspace_id);
      setDocument((curr) => curr ? { ...curr, workspaceId: workspace.workspace_id } : curr);

      const analysis = await analyzeWorkspace(workspace.workspace_id, file);
      if (analysis?.compliance_run?.findings) {
        setFindings(analysis.compliance_run.findings.map(mapFinding));
      }
      setIsAuditReady(true);
      void recompilePdf(html, workspace.workspace_id, "pasted-specifications.txt");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create a workspace");
      setStage("error");
    }
  };

  const handleCompleteAudit = () => {
    setStage("review");
  };

  const handleApplyFinding = (id: string) => {
    const finding = findings.find((candidate) => candidate.id === id);
    if (!finding) return;
    const applied = replaceExactEditorBlock(editorRef.current, finding.sourceText, finding.replacementText);
    setFindings((prev) => prev.map((c) => c.id === id
      ? { ...c, resolution: applied ? "applied" : c.resolution, applyError: applied ? undefined : "The source clause changed or is unavailable in the editor." }
      : c));
    if (applied) {
      const newEdit: PdfEdit = {
        source_text: finding.sourceText,
        replacement_text: finding.replacementText,
        finding_id: finding.id,
      };
      const updatedEdits = [...pendingEdits, newEdit];
      setPendingEdits(updatedEdits);
      if (editorRef.current) {
        const updatedHtml = editorRef.current.getHTML();
        setDocument((curr) => curr ? { ...curr, documentHtml: updatedHtml } : curr);
        triggerRecompileDebounced(updatedHtml, updatedEdits);
      }
    }
  };

  const handleCorrectionChange = (id: string, replacementText: string) => {
    setFindings((prev) => prev.map((f) => f.id === id ? { ...f, replacementText, applyError: undefined } : f));
  };

  const handleIgnoreFinding = (id: string) => {
    setFindings((prev) => prev.map((f) => f.id === id ? { ...f, resolution: "ignored", applyError: undefined } : f));
  };

  const handleResetFinding = (id: string) => {
    setFindings((prev) => prev.map((f) => f.id === id ? { ...f, resolution: "pending", applyError: undefined } : f));
  };

  const handleRestoreAllIgnored = () => {
    setFindings((prev) => prev.map((f) => f.resolution === "ignored" ? { ...f, resolution: "pending" } : f));
  };

  const handleAskAiForFinding = (finding: ComplianceFindingItem) => {
    setAiInput(generateAiPromptForFinding(finding));
  };

  const handleSendAiMessage = async () => {
    const question = aiInput.trim();
    if (!question) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setAiMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: question, timestamp }]);
    setAiInput("");
    try {
      const response = workspaceId
        ? await askWorkspace(workspaceId, question, editorRef.current?.getText() || document?.rawText)
        : { answer: "Create a workspace before asking the connected assistant.", question };
      setAiMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: response.answer, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } catch (reason) {
      setAiMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: reason instanceof Error ? reason.message : "Assistant request failed.", timestamp }]);
    }
  };

  const handleCreatePdf = async () => {
    if (!workspaceId || !document) {
      setError("Create a workspace document before exporting a PDF.");
      return;
    }
    setIsExporting(true);
    setError(null);
    try {
      if (pendingEdits.length > 0) {
        const result = await applyPdfEdits(workspaceId, pendingEdits, document.name);
        setRevisedPdfUrl(result.pdf_url);
        const downloadUrl = getWorkspacePdfUrl(workspaceId, "revised");
        const anchor = window.document.createElement("a");
        anchor.href = downloadUrl;
        anchor.download = `${document.name.replace(/\.[^.]+$/, "")}-revised.pdf`;
        anchor.click();
      } else {
        const blob = await exportWorkspacePdf(workspaceId, editorRef.current?.getHTML() || document.documentHtml || "", document.name);
        const url = URL.createObjectURL(blob);
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = `${document.name.replace(/\.[^.]+$/, "")}-revised.pdf`;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "PDF export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAiChat = async () => {
    setAiMessages([]);
    if (workspaceId) {
      try {
        await clearWorkspaceChat(workspaceId);
      } catch {
        // ignore clear chat failure
      }
    }
  };

  const handleResetWorkspace = () => {
    if (workspaceId) {
      clearWorkspaceChat(workspaceId).catch(() => {});
    }
    cleanupUrls();
    setTitle("New Workspace");
    setStage("empty");
    setWorkspaceId(null);
    setDocument(null);
    setRevisedPdfUrl(null);
    setPendingEdits([]);
    setFindings(SAMPLE_WORKSPACE_FINDINGS);
    setAiInput("");
    setError(null);
    setIsAuditReady(false);
  };

  return {
    title, setTitle, stage, setStage, workspaceId, document, findings,
    aiInput, setAiInput, aiMessages, setAiMessages, error, isExtracting, isAuditReady,
    isExporting, isCompilingPdf, revisedPdfUrl, pendingEdits,
    setEditor, handleFileSelect, handleTextSubmit, handleCompleteAudit, handleApplyFinding,
    handleEditorChange, handleCorrectionChange, handleIgnoreFinding, handleResetFinding,
    handleRestoreAllIgnored, handleAskAiForFinding, handleSendAiMessage, handleCreatePdf,
    handleResetWorkspace, handleClearAiChat,
  };
}

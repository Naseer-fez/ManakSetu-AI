import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  analyzeWorkspace,
  askWorkspace,
  createWorkspace,
  exportWorkspacePdf,
  extractWorkspaceDocument,
} from "@/services/api.service";
import type { WorkspaceFinding } from "@/types";
import type { WorkspaceStage, DocumentSource, ComplianceFindingItem, WorkspaceChatMessage } from "@/components/workspace_desk/types";
import { SAMPLE_WORKSPACE_FINDINGS } from "@/components/workspace_desk/sampleFindings";
import { generateAiPromptForFinding, countWords, replaceExactEditorBlock } from "@/components/workspace_desk/workspace.utils";

function plainTextToHtml(text: string): string {
  return text.split(/\n{2,}/).filter((paragraph) => paragraph.trim()).map((paragraph) =>
    `<p>${paragraph.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>`
  ).join("");
}

function findingStatus(severity: string): ComplianceFindingItem["status"] {
  if (severity.toUpperCase() === "HIGH") return "critical";
  if (severity.toUpperCase() === "MEDIUM") return "warning";
  if (severity.toUpperCase() === "LOW") return "needs_verification";
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
  const [isExporting, setIsExporting] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  const setEditor = useCallback((editor: Editor | null) => { editorRef.current = editor; }, []);
  const handleEditorChange = useCallback((html: string) => {
    setDocument((current) => current ? { ...current, documentHtml: html } : current);
  }, []);
  const revokeDocumentUrl = useCallback(() => {
    if (document?.pdfUrl) URL.revokeObjectURL(document.pdfUrl);
  }, [document?.pdfUrl]);
  useEffect(() => () => {
    if (document?.pdfUrl) URL.revokeObjectURL(document.pdfUrl);
  }, [document?.pdfUrl]);

  const handleFileSelect = async (file: File) => {
    revokeDocumentUrl();
    setError(null);
    setIsExtracting(true);
    try {
      const workspace = await createWorkspace(file.name);
      const extracted = await extractWorkspaceDocument(workspace.workspace_id, file);
      const pdfUrl = URL.createObjectURL(file);
      setWorkspaceId(workspace.workspace_id);
      setDocument({
        workspaceId: workspace.workspace_id,
        name: extracted.document_name,
        type: "pdf",
        sizeBytes: file.size,
        wordCount: extracted.word_count,
        contentSnippet: extracted.markdown.slice(0, 500),
        rawText: extracted.markdown,
        documentHtml: extracted.document_html,
        file,
        pdfUrl,
      });
      setStage("uploaded");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to extract the PDF");
      setStage("error");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTextSubmit = async (text: string) => {
    revokeDocumentUrl();
    setError(null);
    try {
      const workspace = await createWorkspace("Pasted Tender Clauses");
      setWorkspaceId(workspace.workspace_id);
      setDocument({
        workspaceId: workspace.workspace_id,
        name: "Pasted Tender Clauses.txt",
        type: "txt",
        sizeBytes: text.length,
        wordCount: countWords(text),
        contentSnippet: text.slice(0, 500) + (text.length > 500 ? "..." : ""),
        rawText: text,
        documentHtml: plainTextToHtml(text),
      });
      setStage("uploaded");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create a workspace");
      setStage("error");
    }
  };

  const handleRunAudit = useCallback(async () => {
    if (!workspaceId || !document?.file) { setStage("review"); return; }
    try {
      const analysis = await analyzeWorkspace(workspaceId, document.file);
      setFindings(analysis.compliance_run.findings.map(mapFinding));
      setStage("review");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Audit could not be completed");
      setStage("review");
    }
  }, [document?.file, workspaceId]);

  const handleApplyFinding = (id: string) => {
    const finding = findings.find((candidate) => candidate.id === id);
    if (!finding) return;
    const applied = replaceExactEditorBlock(editorRef.current, finding.sourceText, finding.replacementText);
    setFindings((previous) => previous.map((candidate) => candidate.id === id
      ? { ...candidate, resolution: applied ? "applied" : candidate.resolution, applyError: applied ? undefined : "The source clause changed or is unavailable in the editor." }
      : candidate));
  };

  const handleCorrectionChange = (id: string, replacementText: string) => {
    setFindings((previous) => previous.map((finding) => finding.id === id ? { ...finding, replacementText, applyError: undefined } : finding));
  };
  const handleIgnoreFinding = (id: string) => setFindings((previous) => previous.map((finding) => finding.id === id ? { ...finding, resolution: "ignored", applyError: undefined } : finding));
  const handleResetFinding = (id: string) => setFindings((previous) => previous.map((finding) => finding.id === id ? { ...finding, resolution: "pending", applyError: undefined } : finding));
  const handleAskAiForFinding = (finding: ComplianceFindingItem) => setAiInput(generateAiPromptForFinding(finding));

  const handleSendAiMessage = async () => {
    const question = aiInput.trim();
    if (!question) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setAiMessages((previous) => [...previous, { id: `u-${Date.now()}`, role: "user", text: question, timestamp }]);
    setAiInput("");
    try {
      const response = workspaceId
        ? await askWorkspace(workspaceId, question, editorRef.current?.getText() || document?.rawText)
        : { answer: "Create a workspace before asking the connected assistant.", question };
      setAiMessages((previous) => [...previous, { id: `a-${Date.now()}`, role: "assistant", text: response.answer, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } catch (reason) {
      setAiMessages((previous) => [...previous, { id: `a-${Date.now()}`, role: "assistant", text: reason instanceof Error ? reason.message : "Assistant request failed.", timestamp }]);
    }
  };

  const handleCreatePdf = async () => {
    if (!workspaceId || !document) { setError("Create a workspace document before exporting a PDF."); return; }
    setIsExporting(true);
    setError(null);
    try {
      const blob = await exportWorkspacePdf(workspaceId, editorRef.current?.getHTML() || document.documentHtml || "", document.name);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `${document.name.replace(/\.[^.]+$/, "")}-revised.pdf`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "PDF export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetWorkspace = () => {
    revokeDocumentUrl();
    setTitle("New Workspace"); setStage("empty"); setWorkspaceId(null); setDocument(null);
    setFindings(SAMPLE_WORKSPACE_FINDINGS); setAiInput(""); setError(null);
  };

  return {
    title, setTitle, stage, setStage, workspaceId, document, findings,
    aiInput, setAiInput, aiMessages, setAiMessages, error, isExtracting, isExporting,
    setEditor, handleFileSelect, handleTextSubmit, handleRunAudit, handleApplyFinding,
    handleEditorChange,
    handleCorrectionChange, handleIgnoreFinding, handleResetFinding, handleAskAiForFinding,
    handleSendAiMessage, handleCreatePdf, handleResetWorkspace,
  };
}

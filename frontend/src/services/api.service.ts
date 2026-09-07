import type { GraphData, MandatoryQCO, RecommendationResponse, TenderAnalysisReport, WorkspaceAnalysis } from "../types";

const API_BASE = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string) || "/api/v1";

export async function fetchRecommendations(
  query: string,
  division?: string,
  top_k: number = 5
): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, division, top_k }),
  });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

export async function analyzeTenderDocument(
  file?: File,
  rawText?: string
): Promise<TenderAnalysisReport> {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (rawText) formData.append("raw_text", rawText);

  const res = await fetch(`${API_BASE}/analyze-tender`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to analyze tender document");
  return res.json();
}

export async function createWorkspace(name: string): Promise<{ workspace_id: string; name: string }> {
  const res = await fetch(`${API_BASE}/workspaces`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
  if (!res.ok) throw new Error("Failed to create workspace");
  return res.json();
}

export async function analyzeWorkspace(workspaceId: string, file: File): Promise<WorkspaceAnalysis> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/analyze`, { method: "POST", body });
  if (!res.ok) throw new Error("Failed to analyze workspace document");
  return res.json();
}

export async function askWorkspace(workspaceId: string, question: string, documentText?: string): Promise<{ question: string; answer: string }> {
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, document_text: documentText || "" }) });
  if (!res.ok) throw new Error("Assistant request failed");
  return res.json();
}

export async function exportWorkspace(workspaceId: string, format: "pdf" | "docx", templateId?: string): Promise<Blob> {
  const template = { template_id: templateId || "uploaded", name: "Uploaded source", source: "officer-uploaded", format: format === "pdf" ? "static_pdf" : "docx", approved: false, fields: [] };
  const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/export`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ format, template, values: {}, allow_draft: true }) });
  if (!res.ok) throw new Error("Export requires a mapped template");
  return res.blob();
}

export async function fetchKnowledgeGraph(): Promise<GraphData> {
  const res = await fetch(`${API_BASE}/graph`);
  if (!res.ok) throw new Error("Failed to fetch graph data");
  return res.json();
}

export async function fetchQcoList(): Promise<Record<string, MandatoryQCO>> {
  const res = await fetch(`${API_BASE}/qco-list`);
  if (!res.ok) throw new Error("Failed to fetch QCO list");
  return res.json();
}

export async function simulateGemBid(
  bidId: string,
  category: string,
  title: string,
  spec: string
): Promise<{
  bid_id: string;
  status: string;
  compliance_score: number;
  primary_standard: string;
  is_qco_mandatory: boolean;
  qco_order: string;
  recommended_clause: string;
  allied_standards: string[];
}> {
  const res = await fetch(`${API_BASE}/gem-webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bid_id: bidId,
      category_name: category,
      product_title: title,
      buyer_specifications: spec,
    }),
  });
  if (!res.ok) throw new Error("Failed to validate GeM bid");
  return res.json();
}

export async function explainStandardStream(
  query: string,
  isCode: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_BASE}/explain-standard-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, is_code: isCode }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error("Failed to stream explanation");
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: true });
      }
      
      const events = buffer.split(/\r?\n\r?\n/);
      if (done) {
        buffer = "";
      } else {
        buffer = events.pop() || "";
      }

      for (const event of events) {
        if (!event.trim()) continue;
        for (const line of event.split(/\r?\n/)) {
          if (line.startsWith("data:")) {
            const data = line.startsWith("data: ") ? line.slice(6) : line.slice(5);
            if (data === "[DONE]") return;
            if (data.startsWith("[ERROR:")) throw new Error(data);
            onChunk(data);
          }
        }
      }
      if (done) break;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function generateTenderClauses(
  isCode: string,
  query: string = "Tender technical compliance specification"
): Promise<{ is_code: string; clause_text: string }> {
  const res = await fetch(`${API_BASE}/tender-clauses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_code: isCode, query }),
  });
  if (!res.ok) throw new Error("Failed to generate tender clauses");
  return res.json();
}


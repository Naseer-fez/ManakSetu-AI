const API_BASE = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string) || "/api/v1";

export async function fetchFastAnswer(
  query: string,
  pdfFile?: File,
  pdfText?: string
): Promise<{ query: string; answer: string; source_tier: string }> {
  const formData = new FormData();
  formData.append("query", query);
  if (pdfText) formData.append("pdf_text", pdfText);
  if (pdfFile) formData.append("pdf_file", pdfFile);

  const res = await fetch(`${API_BASE}/fast-answer`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Fast answer request failed");
  return res.json();
}

export async function fetchHeavyReasoning(
  query: string,
  pdfFile?: File,
  pdfText?: string,
  chatHistory?: { role: string; content: string }[],
  refreshContext: boolean = false
): Promise<{ query: string; answer: string; source_tier: string; synthesized_context?: string; summarized_history?: string }> {
  const formData = new FormData();
  formData.append("query", query);
  if (pdfText) formData.append("pdf_text", pdfText);
  if (pdfFile) formData.append("pdf_file", pdfFile);
  if (chatHistory) formData.append("chat_history", JSON.stringify(chatHistory));
  formData.append("refresh_context", refreshContext ? "true" : "false");

  const res = await fetch(`${API_BASE}/heavy-reasoning`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Heavy reasoning request failed");
  return res.json();
}

export async function refreshChatContext(
  chatHistory: { role: string; content: string }[]
): Promise<string> {
  const res = await fetch(`${API_BASE}/summarize-context`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_history: chatHistory }),
  });
  if (!res.ok) throw new Error("Context refresh failed");
  const data = await res.json();
  return data.summarized_context || "";
}

export interface MacStatus {
  endpoint: string;
  host: string;
  port: number;
  online: boolean;
  latency_ms?: number;
  device_info?: string;
  error?: string;
}

export type ClusterStatus = MacStatus;

export async function fetchMacStatus(): Promise<MacStatus> {
  const res = await fetch(`${API_BASE}/mac-status`);
  if (!res.ok) throw new Error("Failed to fetch cluster status");
  return res.json();
}

export const fetchClusterStatus = fetchMacStatus;



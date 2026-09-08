const API_BASE = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string) || "/api/v1";

export const MAC_CONFIG = {
  baseUrl: (import.meta.env.VITE_MAC_BASE_URL as string) || "http://10.118.237.94:5008",
  healthUrl: (import.meta.env.VITE_MAC_HEALTH_URL as string) || "http://10.118.237.94:5008/health",
  reasonUrl: (import.meta.env.VITE_MAC_REASON_URL as string) || "http://10.118.237.94:5008/reason",
};

function parseUrlParts(urlStr: string): { host: string; port: number } {
  try {
    const parsed = new URL(urlStr);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 5008,
    };
  } catch {
    return { host: "10.118.237.94", port: 5008 };
  }
}

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

  try {
    const res = await fetch(`${API_BASE}/heavy-reasoning`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) return await res.json();
  } catch {
    // Backend unavailable; fallback to Mac reasoning endpoint
  }

  const reasonEndpoint = import.meta.env.DEV ? "/mac-api/reason" : MAC_CONFIG.reasonUrl;
  const prompt = pdfText ? `Context:\n${pdfText}\n\nQuery: ${query}` : query;
  try {
    const macRes = await fetch(reasonEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system_prompt: "You are a BIS Standards expert AI assistant." }),
    });
    if (macRes.ok) {
      const data = await macRes.json().catch(() => ({}));
      const answer = data.response || data.content || (typeof data === "string" ? data : JSON.stringify(data));
      return {
        query,
        answer,
        source_tier: "mac_m_series",
      };
    }
  } catch {
    // Both unavailable
  }

  throw new Error("Reasoning node unavailable. Please verify cluster connection.");
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
  const { host, port } = parseUrlParts(MAC_CONFIG.healthUrl);
  const startTime = performance.now();

  const endpointsToTry = import.meta.env.DEV
    ? ["/mac-api/health", MAC_CONFIG.healthUrl, `${API_BASE}/mac-status`]
    : [MAC_CONFIG.healthUrl, `${API_BASE}/mac-status`];

  for (const endpoint of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const elapsed = Math.round(performance.now() - startTime);
        return {
          endpoint: MAC_CONFIG.reasonUrl,
          host: data.host || host,
          port: data.port || port,
          online: true,
          latency_ms: data.latency_ms ?? elapsed,
          device_info: data.device_info || data.device || data.source || "Mac M-Series Node",
        };
      }
    } catch {
      // Continue to next endpoint fallback
    }
  }

  return {
    endpoint: MAC_CONFIG.reasonUrl,
    host,
    port,
    online: false,
    error: "Standby",
  };
}

export const fetchClusterStatus = fetchMacStatus;



import type { VoiceChatMessage, VoiceChatResponse, VoiceStatusResponse } from "../types";

const API_BASE = (import.meta.env.VITE_API_URL as string) || (import.meta.env.VITE_API_BASE_URL as string) || "/api/v1";

export async function sendVoiceChat(
  audioBlob: Blob,
  chatHistory: VoiceChatMessage[] = [],
  mode: "fast" | "thinking" = "thinking",
  language: string = "auto",
  pdfText?: string
): Promise<VoiceChatResponse> {
  const formData = new FormData();
  formData.append("audio_file", audioBlob, "voice_input.wav");
  formData.append("mode", mode);
  formData.append("language", language);

  const formattedHistory = chatHistory.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  formData.append("chat_history", JSON.stringify(formattedHistory));

  if (pdfText) {
    formData.append("pdf_text", pdfText);
  }

  const res = await fetch(`${API_BASE}/voice/chat`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Voice chat failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchVoiceStatus(): Promise<VoiceStatusResponse> {
  const res = await fetch(`${API_BASE}/voice/status`);
  if (!res.ok) {
    throw new Error("Failed to fetch voice status");
  }
  return res.json();
}

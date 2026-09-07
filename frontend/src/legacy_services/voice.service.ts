/**
 * Voice REST API service for status, chat, transcription, and synthesis.
 */
import { requestJson, requestBlob, postFormData } from './api.client';
import type {
  VoiceStatusResponse,
  VoiceChatResponse,
  VoiceTranscriptionResponse,
  VoiceChatMessage,
} from '../legacy_types/voice.types';

export interface VoiceChatOptions {
  chatHistory?: VoiceChatMessage[];
  mode?: 'fast' | 'thinking';
  language?: string;
  pdfText?: string;
}

export async function fetchVoiceStatus(): Promise<VoiceStatusResponse> {
  return requestJson<VoiceStatusResponse>('/voice/status');
}

export async function sendVoiceChat(
  audioBlob: Blob,
  options: VoiceChatOptions = {}
): Promise<VoiceChatResponse> {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, 'recording.wav');
  formData.append('chat_history', JSON.stringify(options.chatHistory ?? []));
  formData.append('mode', options.mode ?? 'thinking');
  formData.append('language', options.language ?? 'auto');
  if (options.pdfText) {
    formData.append('pdf_text', options.pdfText);
  }
  return postFormData<VoiceChatResponse>('/voice/chat', formData);
}

export async function transcribeVoiceAudio(
  audioBlob: Blob,
  language: string = 'auto'
): Promise<VoiceTranscriptionResponse> {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, 'recording.wav');
  formData.append('language', language);
  return postFormData<VoiceTranscriptionResponse>('/voice/transcribe', formData);
}

export async function synthesizeSpeechAudio(
  text: string,
  language: string = 'en'
): Promise<Blob> {
  return requestBlob('/voice/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  });
}

/**
 * Voice chat, speech synthesis, transcription, and live WebSocket contracts.
 */
import type { DocumentChunkEvidence } from './models.types';

export interface VoiceChatMessage {
  id?: string;
  role: 'user' | 'assistant' | string;
  content: string;
  audio_url?: string | null;
  audioUrl?: string;
  language?: string | null;
  detectedLanguage?: string;
  timestamp?: string;
}

export interface VoiceChatResponse {
  transcribed_text: string;
  detected_language: string;
  llm_response: string;
  audio_url: string;
  mode: 'fast' | 'thinking' | string;
  document_evidences?: DocumentChunkEvidence[];
  processing_time_ms: number;
}

export interface VoiceStatusResponse {
  stt_available: boolean;
  stt_provider: string;
  tts_available: boolean;
  tts_provider: string;
  stt_device: string;
  tts_device: string;
  default_language: string;
}

export interface VoiceTranscriptionResponse { transcribed_text: string; }

export interface SessionStatusEvent {
  event: 'session_status';
  status: string;
  stt_available: boolean;
  tts_available: boolean;
  llm_available: boolean;
}

export interface SttPartialEvent { event: 'stt_partial'; text: string; language: string; }

export interface SttFinalEvent {
  event: 'stt_final';
  text: string;
  language: string;
  confidence?: number | null;
  duration_sec: number;
}

export interface LlmChunkEvent { event: 'llm_chunk'; text: string; chunk_index: number; }
export interface TtsAudioEvent { event: 'tts_audio'; data: string; sample_rate: number; chunk_index: number; }

export interface ResponseCompleteEvent {
  event: 'response_complete';
  full_text: string;
  turn_index: number;
  processing_time_ms: number;
}

export interface ErrorEvent {
  event: 'error';
  message: string;
  component: 'stt' | 'llm' | 'tts' | 'session' | string;
  recoverable: boolean;
}

export type LiveVoiceServerEvent =
  | SessionStatusEvent | SttPartialEvent | SttFinalEvent
  | LlmChunkEvent | TtsAudioEvent | ResponseCompleteEvent | ErrorEvent;

export interface LiveVoiceTurn { role: 'user' | 'assistant'; text: string; }

export interface LiveVoiceState {
  isConnected: boolean;
  isListening: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  currentResponse: string;
  turns: LiveVoiceTurn[];
  error: string | null;
}

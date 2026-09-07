/**
 * Indian Standards & Recommendation API Service.
 */
import { requestJson } from '@/services/api.client';
import { streamSSE } from '@/services/sse.client';
import type { RecommendationRequest, RecommendationResponse, IndianStandard } from '@/types/models.types';
import type {
  ExplainStandardRequest, LlmExplanationResponse,
  AssistantQuestionRequest, AssistantAnswerResponse,
  TenderClauseRequest, TenderClauseResponse, ChatMessage,
} from '@/types/api.types';

export async function fetchRecommendations(req: RecommendationRequest): Promise<RecommendationResponse> {
  return requestJson<RecommendationResponse>('/recommend', { method: 'POST', body: JSON.stringify(req) });
}

export async function fetchStandards(
  division?: string, query?: string, limit: number = 50, offset: number = 0
): Promise<IndianStandard[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (division) params.set('division', division);
  if (query) params.set('query', query);
  return requestJson<IndianStandard[]>(`/standards?${params.toString()}`);
}

export async function getStandardByCode(isCode: string): Promise<IndianStandard> {
  return requestJson<IndianStandard>(`/standards/${encodeURIComponent(isCode)}`);
}

export async function explainStandard(query: string, isCode: string): Promise<LlmExplanationResponse> {
  const body: ExplainStandardRequest = { query, is_code: isCode };
  return requestJson<LlmExplanationResponse>('/explain-standard', { method: 'POST', body: JSON.stringify(body) });
}

export async function explainStandardStream(
  query: string, isCode: string, onChunk: (text: string) => void, signal?: AbortSignal
): Promise<void> {
  await streamSSE('/explain-standard-stream', { body: { query, is_code: isCode }, signal, onChunk });
}

export async function askAssistant(
  question: string, pdfText?: string | null, chatHistory?: ChatMessage[] | null
): Promise<AssistantAnswerResponse> {
  const body: AssistantQuestionRequest = { question, pdf_text: pdfText, chat_history: chatHistory };
  return requestJson<AssistantAnswerResponse>('/ask-assistant', { method: 'POST', body: JSON.stringify(body) });
}

export async function askAssistantStream(
  question: string, onChunk: (text: string) => void,
  pdfText?: string | null, chatHistory?: ChatMessage[] | null, signal?: AbortSignal
): Promise<void> {
  await streamSSE('/ask-assistant-stream', { body: { question, pdf_text: pdfText, chat_history: chatHistory }, signal, onChunk });
}

export async function generateTenderClauses(isCode: string, query?: string): Promise<TenderClauseResponse> {
  const body: TenderClauseRequest = { is_code: isCode, query };
  return requestJson<TenderClauseResponse>('/tender-clauses', { method: 'POST', body: JSON.stringify(body) });
}

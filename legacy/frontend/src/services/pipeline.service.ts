/**
 * Distributed AI pipeline and multimodal reasoning service.
 */
import { requestJson, postFormData } from '@/services/api.client';
import type {
  PipelineAnswerResponse,
  SummarizeContextResponse,
  ImageClassificationResult,
  ChatMessage,
} from '@/types/api.types';

export interface ReasoningOptions {
  pdfText?: string;
  pdfFile?: File;
  chatHistory?: ChatMessage[];
  refreshContext?: boolean;
}

export async function fetchFastAnswer(
  query: string,
  pdfText: string = '',
  pdfFile?: File
): Promise<PipelineAnswerResponse> {
  const formData = new FormData();
  formData.append('query', query);
  formData.append('pdf_text', pdfText);
  if (pdfFile) formData.append('pdf_file', pdfFile);
  return postFormData<PipelineAnswerResponse>('/fast-answer', formData);
}

export async function fetchHeavyReasoning(
  query: string,
  options: ReasoningOptions = {}
): Promise<PipelineAnswerResponse> {
  const formData = new FormData();
  formData.append('query', query);
  formData.append('pdf_text', options.pdfText ?? '');
  formData.append('chat_history', JSON.stringify(options.chatHistory ?? []));
  formData.append('refresh_context', String(options.refreshContext ?? false));
  if (options.pdfFile) formData.append('pdf_file', options.pdfFile);
  return postFormData<PipelineAnswerResponse>('/heavy-reasoning', formData);
}

export async function summarizeContext(
  chatHistory: Array<{ role: string; content: string }>
): Promise<SummarizeContextResponse> {
  return requestJson<SummarizeContextResponse>('/summarize-context', {
    method: 'POST',
    body: JSON.stringify({ chat_history: chatHistory }),
  });
}

export async function classifyImage(
  imageFile: File
): Promise<ImageClassificationResult> {
  const formData = new FormData();
  formData.append('image_file', imageFile);
  return postFormData<ImageClassificationResult>('/image/classify', formData);
}

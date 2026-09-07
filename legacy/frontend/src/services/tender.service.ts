/**
 * Tender Document Audit & Analysis Service.
 */
import { postFormData } from '@/services/api.client';
import type { TenderAnalysisReport } from '@/types/tender.types';

export interface AnalyzeTenderOptions {
  file?: File;
  rawText?: string;
  useLlm?: boolean;
}

export async function analyzeTender(options: AnalyzeTenderOptions): Promise<TenderAnalysisReport> {
  const formData = new FormData();
  if (options.file) {
    formData.append('file', options.file);
  }
  if (options.rawText) {
    formData.append('raw_text', options.rawText);
  }
  if (options.useLlm !== undefined) {
    formData.append('use_llm', String(options.useLlm));
  }
  return postFormData<TenderAnalysisReport>('/analyze-tender', formData);
}

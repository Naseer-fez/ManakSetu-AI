/**
 * API contracts for GeM, LLM assistant, reasoning, and multimodal pipelines.
 */
import type { StandardRecommendation, DocumentChunkEvidence } from '@/types/models.types';

export interface GemBidValidationRequest {
  bid_id: string;
  category_name: string;
  product_title: string;
  buyer_specifications: string;
}

export interface GemBidValidationResponse {
  bid_id: string;
  status: string;
  compliance_score: number;
  primary_standard: string;
  is_qco_mandatory: boolean;
  qco_order: string;
  recommended_clause: string;
  allied_standards: string[];
}

export interface ExplainStandardRequest { query: string; is_code: string; }
export interface LlmExplanationResponse {
  is_code: string;
  explanation: string;
  document_evidences: DocumentChunkEvidence[];
}

export interface ChatMessage { role: string; content: string; }
export interface AssistantQuestionRequest {
  question: string;
  pdf_text?: string | null;
  chat_history?: ChatMessage[] | null;
}
export interface AssistantAnswerResponse {
  question: string;
  answer: string;
  document_evidences: DocumentChunkEvidence[];
}

export interface TenderClauseRequest { is_code: string; query?: string; }
export interface TenderClauseResponse { is_code: string; clause_text: string; }

export interface PipelineAnswerResponse {
  query: string;
  answer: string;
  source_tier: string;
  synthesized_context?: string;
  summarized_history?: string;
  confidence_score: number;
  web_search_used?: boolean;
  web_sources?: string[];
}

export interface SummarizeContextRequest { chat_history: Array<{ role: string; content: string }>; }
export interface SummarizeContextResponse { summarized_context: string; }

export interface ImageClassificationResult {
  category: string;
  confidence: number;
  dimensions: [number, number];
  aspect_ratio: number;
  is_technical_drawing: boolean;
  extracted_text: string;
  technical_attributes?: Record<string, unknown>;
}

export interface LlmStandardizedResponse {
  query: string;
  primary_is_code: string;
  primary_title: string;
  technical_justification: string;
  qco_compliance_verdict: string;
  mandatory_test_methods: string[];
  allied_standards_summary: string[];
  cited_clauses?: string[];
  confidence_score: number;
  source_tier: string;
}

export interface PipelineResponse {
  query: string;
  detected_language: string;
  extracted_text_snippet?: string;
  image_analysis?: ImageClassificationResult | null;
  recommendations: StandardRecommendation[];
  llm_analysis?: LlmStandardizedResponse | null;
  voice_audio_base64?: string | null;
}

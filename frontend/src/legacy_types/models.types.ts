/**
 * Core Indian Standard, QCO, Recommendation, and Graph Models.
 * Strictly mirrors backend schemas in standard_model.py & recommendation_model.py.
 */

export type StandardStatus = 'Active' | 'Superseded' | 'Withdrawn';
export type CertificationScheme = 'ISI Mark (Scheme I)' | 'Compulsory Registration Scheme (CRS)' | 'BEE Star Rating' | 'Hallmarking' | 'Voluntary';

export interface MandatoryQCO {
  is_mandatory: boolean;
  scheme: CertificationScheme | string;
  order_number: string;
  issuing_ministry: string;
  effective_date: string;
  clause_requirement: string;
}

export interface IndianStandard {
  is_code: string;
  title: string;
  division: string;
  status: StandardStatus;
  superseded_by?: string | null;
  year: number;
  reaffirmation_year?: number | null;
  amendments: string[];
  scope: string;
  key_parameters: string[];
  test_methods: string[];
  normative_references: string[];
  safety_standards: string[];
  installation_standards: string[];
  mandatory_qco: MandatoryQCO;
  category_keywords: string[];
  gem_categories: string[];
}

export interface AlliedStandardItem {
  is_code: string;
  title: string;
  relation_type: string;
  status: string;
  is_mandatory: boolean;
  details: string;
}

export interface DocumentChunkEvidence {
  chunk_id?: string;
  doc_id?: string;
  file_name: string;
  page_number: number;
  total_pages?: number;
  folder_category?: string;
  snippet: string;
  relevance_score?: number;
  matched_standard?: string | null;
}

export interface StandardRecommendation {
  standard: IndianStandard;
  relevance_score: number;
  match_reasons: string[];
  allied_standards: AlliedStandardItem[];
  document_evidences: DocumentChunkEvidence[];
  certification_alert: string;
  deprecation_warning?: string | null;
  sample_tender_clause: string;
}

export interface RecommendationRequest {
  query: string;
  language?: string | null;
  division?: string | null;
  top_k?: number;
  include_allied?: boolean;
}

export interface RecommendationResponse {
  query: string;
  detected_language: string;
  translated_query: string;
  total_matches: number;
  recommendations: StandardRecommendation[];
  document_evidences: DocumentChunkEvidence[];
  latency_ms: number;
}

export interface GraphNode {
  id: string;
  label: string;
  title: string;
  division: string;
  is_mandatory: boolean;
  status: string;
}
export interface GraphEdge { source: string; target: string; relation: string; }
export interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; }

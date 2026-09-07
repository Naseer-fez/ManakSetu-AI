/**
 * Tender Document Analysis, Compliance Findings, and Revisions.
 * Mirrors document_contracts.py and tender_model.py.
 */
import type { StandardRecommendation } from '@/types/models.types';
export * from '@/types/template.types';

export type ComplianceState =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'NEEDS_VERIFICATION'
  | 'NOT_APPLICABLE';

export interface EvidenceRef {
  source: string;
  locator?: string;
  page?: number | null;
  snippet: string;
  confidence: number;
}

export interface ComplianceFinding {
  finding_id: string;
  category: string;
  severity: string;
  state: ComplianceState;
  message: string;
  corrective_action: string;
  evidence: EvidenceRef[];
}

export interface ComplianceRun {
  run_id: string;
  dataset_label: string;
  dataset_version: string;
  findings: ComplianceFinding[];
  coverage: number;
  export_blocked: boolean;
}

export interface ExtractedLineItem {
  item_id: number;
  product_title: string;
  spec_summary: string;
  cited_standards: string[];
  outdated_citations: string[];
  recommended_standards: StandardRecommendation[];
}

export interface ComplianceIssue {
  severity: string;
  category: string;
  issue_text: string;
  corrective_action: string;
}

export interface TenderAnalysisReport {
  document_name: string;
  extracted_items_count: number;
  items: ExtractedLineItem[];
  compliance_issues: ComplianceIssue[];
  mandatory_qco_coverage: number;
  complete_spec_clause_text: string;
  raw_text?: string;
  findings?: ComplianceFinding[];
  overall_state?: ComplianceState;
  mandatory_standards?: string[];
  compliance_run_id?: string | null;
}

export interface RevisionChange {
  field?: string;
  original?: string;
  proposed?: string;
  description?: string;
}

export interface Revision {
  revision_id: string;
  parent_revision_id?: string | null;
  status: string;
  text?: string;
  changes: string[] | RevisionChange[];
}

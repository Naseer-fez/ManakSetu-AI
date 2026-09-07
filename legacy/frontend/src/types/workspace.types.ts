/**
 * Workspace State and Flow Contracts.
 * Mirrors workspace_router.py and re-exports tender/compliance contracts.
 */
import type { TenderAnalysisReport } from '@/types/tender.types';
import type { ComplianceRun, Revision } from '@/types/tender.types';

export * from '@/types/tender.types';

export interface WorkspaceCreate {
  name: string;
}

export interface WorkspaceDocumentSummary {
  id: string;
  name: string;
  sha256: string;
  path?: string;
}

export interface WorkspaceSummary {
  workspace_id: string;
  name: string;
  created_at?: string;
  documents?: WorkspaceDocumentSummary[];
}

export interface WorkspaceAnalysis {
  report: TenderAnalysisReport;
  compliance_run: ComplianceRun;
  revision: Revision;
}

export interface WorkspaceChatRequest {
  question: string;
  document_text?: string;
}

export interface WorkspaceChatResponse {
  question: string;
  answer: string;
  grounded: boolean;
}

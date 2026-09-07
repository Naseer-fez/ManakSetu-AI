export type WorkspaceStage = "empty" | "uploaded" | "auditing" | "review" | "error";

export type FindingStatus = "critical" | "warning" | "passed" | "needs_verification";

export type FindingResolution = "pending" | "applied" | "ignored";

export interface DocumentSource {
  name: string;
  type: string;
  sizeBytes: number;
  wordCount: number;
  contentSnippet: string;
  rawText?: string;
  file?: File;
}

export interface ComplianceFindingItem {
  id: string;
  clauseLocation: string;
  status: FindingStatus;
  resolution: FindingResolution;
  explanation: string;
  suggestedCorrection: string;
  standardReference?: string;
  category: string;
}

export interface WorkspaceChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  relatedFindingId?: string;
}

export interface AuditProgressStage {
  step: number;
  label: string;
  description: string;
}

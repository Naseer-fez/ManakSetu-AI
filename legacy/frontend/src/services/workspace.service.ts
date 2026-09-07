/**
 * Workspace lifecycle, document analysis, revisions, and export service.
 */
import { requestJson, requestBlob, postFormData } from '@/services/api.client';
import { streamSSE } from '@/services/sse.client';
import type {
  WorkspaceSummary,
  WorkspaceAnalysis,
  WorkspaceChatResponse,
  Revision,
  TemplateProfile,
  ExportRequest,
} from '@/types/workspace.types';

export async function createWorkspace(name: string = 'Untitled tender'): Promise<{ workspace_id: string; name: string }> {
  return requestJson<{ workspace_id: string; name: string }>('/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function getWorkspace(id: string): Promise<WorkspaceSummary> {
  return requestJson<WorkspaceSummary>(`/workspaces/${encodeURIComponent(id)}`);
}

export async function analyzeWorkspace(
  id: string,
  file?: File,
  rawText?: string
): Promise<WorkspaceAnalysis> {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (rawText) formData.append('raw_text', rawText);
  return postFormData<WorkspaceAnalysis>(`/workspaces/${encodeURIComponent(id)}/analyze`, formData);
}

export async function registerTemplate(
  id: string,
  template: TemplateProfile
): Promise<TemplateProfile> {
  return requestJson<TemplateProfile>(`/workspaces/${encodeURIComponent(id)}/templates`, {
    method: 'POST',
    body: JSON.stringify({ template }),
  });
}

export async function approveRevision(id: string, revisionId: string): Promise<Revision> {
  return requestJson<Revision>(
    `/workspaces/${encodeURIComponent(id)}/revisions/${encodeURIComponent(revisionId)}/approve`,
    { method: 'POST' }
  );
}

export async function chatWorkspace(
  id: string,
  question: string,
  documentText: string = ''
): Promise<WorkspaceChatResponse> {
  return requestJson<WorkspaceChatResponse>(`/workspaces/${encodeURIComponent(id)}/chat`, {
    method: 'POST',
    body: JSON.stringify({ question, document_text: documentText }),
  });
}

export async function chatWorkspaceStream(
  id: string,
  question: string,
  documentText: string = '',
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  await streamSSE(`/workspaces/${encodeURIComponent(id)}/chat-stream`, {
    body: { question, document_text: documentText },
    signal,
    onChunk,
  });
}

export async function exportWorkspace(
  id: string,
  req: ExportRequest
): Promise<Blob> {
  return requestBlob(`/workspaces/${encodeURIComponent(id)}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
}

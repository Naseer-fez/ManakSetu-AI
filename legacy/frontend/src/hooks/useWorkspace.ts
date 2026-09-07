/**
 * Hook for managing Workspace state, audit execution, revisions, and exports.
 */
import { useState, useCallback } from 'react';
import {
  createWorkspace,
  analyzeWorkspace,
  approveRevision,
  exportWorkspace,
} from '@/services/workspace.service';
import type { WorkspaceAnalysis, Revision, ExportRequest } from '@/types/workspace.types';

export function useWorkspace(initialId: string | null = null) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(initialId);
  const [workspaceName, setWorkspaceName] = useState<string>('Untitled tender');
  const [analysis, setAnalysis] = useState<WorkspaceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initWorkspace = useCallback(async (name?: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await createWorkspace(name);
      setWorkspaceId(res.workspace_id);
      setWorkspaceName(res.name);
      return res.workspace_id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runAudit = useCallback(async (file?: File, rawText?: string): Promise<WorkspaceAnalysis | null> => {
    setIsLoading(true);
    setError(null);
    try {
      let activeId = workspaceId;
      if (!activeId) {
        const res = await createWorkspace(workspaceName);
        activeId = res.workspace_id;
        setWorkspaceId(activeId);
      }
      const data = await analyzeWorkspace(activeId, file, rawText);
      setAnalysis(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, workspaceName]);

  const approve = useCallback(async (revisionId: string): Promise<Revision | null> => {
    if (!workspaceId) return null;
    setIsLoading(true);
    setError(null);
    try {
      const rev = await approveRevision(workspaceId, revisionId);
      if (analysis) setAnalysis({ ...analysis, revision: rev });
      return rev;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, analysis]);

  const exportDoc = useCallback(async (req: ExportRequest): Promise<Blob | null> => {
    if (!workspaceId) return null;
    setIsLoading(true);
    setError(null);
    try {
      return await exportWorkspace(workspaceId, req);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  return {
    workspaceId, workspaceName, analysis, isLoading, error,
    initWorkspace, runAudit, approve, exportDoc, setAnalysis,
  };
}

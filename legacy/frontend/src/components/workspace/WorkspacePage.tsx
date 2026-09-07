import { useState, type FC } from 'react';
import { SourceStage } from './SourceStage';
import { ReviewStage } from './ReviewStage';
import { DecisionFooter } from './DecisionFooter';
import { WorkspaceChat } from './WorkspaceChat';
import type { WorkspaceAnalysis, ComplianceFinding } from '@/types';
import { createWorkspace, analyzeWorkspace } from '@/services/workspace.service';
import { ErrorState } from '@/components/primitives/ErrorState';

interface WorkspacePageProps {
  onNavigate: (page: string) => void;
  onSetPdfText: (text: string) => void;
}

export const WorkspacePage: FC<WorkspacePageProps> = ({ onNavigate: _onNavigate, onSetPdfText }) => {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('New Workspace');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [analysis, setAnalysis] = useState<WorkspaceAnalysis | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<ComplianceFinding | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState<'upload' | 'paste'>('upload');

  const handleRunAudit = async () => {
    try {
      setBusy(true);
      setError(null);
      const ws = await createWorkspace(workspaceName);
      setWorkspaceId(ws.workspace_id);
      const res = await analyzeWorkspace(ws.workspace_id, selectedFile || undefined, rawText || undefined);
      setAnalysis(res);
      if (rawText) onSetPdfText(rawText);
    } catch (e: any) {
      setError(e.message || 'Error running audit');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <main className="flex-1 p-6">
        {error && <ErrorState message={error} />}
        {!analysis ? (
          <SourceStage
            workspaceName={workspaceName}
            setWorkspaceName={setWorkspaceName}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            rawText={rawText}
            setRawText={setRawText}
            sourceMode={sourceMode}
            setSourceMode={setSourceMode}
            onRunAudit={handleRunAudit}
            busy={busy}
          />
        ) : (
          <ReviewStage
            analysis={analysis}
            selectedFinding={selectedFinding}
            onSelectFinding={setSelectedFinding}
          />
        )}
      </main>
      {analysis && workspaceId && (
        <>
          <WorkspaceChat workspaceId={workspaceId} />
          <DecisionFooter analysis={analysis} workspaceId={workspaceId} />
        </>
      )}
    </div>
  );
};


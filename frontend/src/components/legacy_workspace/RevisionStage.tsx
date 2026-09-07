import { useState, type FC } from 'react';
import type { Revision } from '../../legacy_types';
import { StatusToken } from '../legacy_primitives/StatusToken';
import { MotionButton } from '../legacy_primitives/MotionButton';
import { approveRevision } from '../../legacy_services/workspace.service';

interface RevisionStageProps {
  revision: Revision;
  workspaceId: string;
}

export const RevisionStage: FC<RevisionStageProps> = ({ revision, workspaceId }) => {
  const [status, setStatus] = useState(revision.status);
  const [busy, setBusy] = useState(false);

  const handleApprove = async () => {
    try {
      setBusy(true);
      await approveRevision(workspaceId, revision.revision_id);
      setStatus('APPROVED');
    } catch (e: any) {
      if (e.status === 404 || e.status === 501) {
        alert('Not yet available');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-panel border border-border rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg text-text-primary font-semibold">Revision {revision.revision_id.substring(0,6)}</h3>
          <StatusToken status={status === 'APPROVED' ? 'COMPLIANT' : 'REVIEW_REQUIRED'} size="sm" />
        </div>
        {status !== 'APPROVED' && (
          <MotionButton variant="primary" onClick={handleApprove} isLoading={busy}>
            Approve revision
          </MotionButton>
        )}
      </div>
      
      <div className="space-y-3">
        {revision.changes?.map((c: any, i: number) => {
          if (typeof c === 'string') return <div key={i} className="text-sm border border-border-subtle p-3 rounded">{c}</div>;
          return (
          <div key={i} className="border border-border-subtle rounded p-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-text-secondary">{c.field}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-status-danger-bg text-text-danger p-2 rounded">
                - {c.original}
              </div>
              <div className="bg-status-compliant-bg text-text-compliant p-2 rounded">
                + {c.proposed}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};


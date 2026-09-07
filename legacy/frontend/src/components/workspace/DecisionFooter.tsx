import { type FC } from 'react';
import type { WorkspaceAnalysis } from '@/types';
import { StatusToken } from '@/components/primitives/StatusToken';
import { MotionButton } from '@/components/primitives/MotionButton';

interface DecisionFooterProps {
  analysis: WorkspaceAnalysis;
  workspaceId: string;
}

export const DecisionFooter: FC<DecisionFooterProps> = ({ analysis }) => {
  return (
    <div className="sticky bottom-0 bg-surface border-t border-border p-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-text-muted">Export Gate</span>
          <StatusToken status={analysis.compliance_run?.export_blocked ? 'EXPORT_BLOCKED' : 'COMPLIANT'} size="sm" />
        </div>
      </div>
      <div className="flex gap-3">
        <MotionButton variant="outline">Discard</MotionButton>
        <MotionButton variant="primary" disabled={analysis.compliance_run?.export_blocked}>Proceed</MotionButton>
      </div>
    </div>
  );
};


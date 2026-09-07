import { type FC } from 'react';
import type { ComplianceFinding } from '@/types';
import { StatusToken } from '@/components/primitives/StatusToken';
import { EmptyState } from '@/components/primitives/EmptyState';

interface FindingInspectorProps {
  finding: ComplianceFinding | null;
}

export const FindingInspector: FC<FindingInspectorProps> = ({ finding }) => {
  if (!finding) {
    return (
      <div className="bg-panel border border-border rounded-xl flex items-center justify-center p-6">
        <EmptyState title="No finding selected" description="Select a finding from the canvas to view details" />
      </div>
    );
  }

  return (
    <div className="bg-panel border border-border rounded-xl p-4 overflow-y-auto">
      <div className="mb-4">
        <StatusToken status={finding.state} size="md" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{finding.category}</h3>
      <div className="mb-4 flex items-center gap-2 text-xs">
        <span className="text-text-muted">Severity:</span>
        <span className="text-text-primary px-1.5 py-0.5 bg-canvas rounded">{finding.severity}</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-text-secondary uppercase mb-1">Message</h4>
          <p className="text-sm text-text-primary bg-surface p-2 rounded">{finding.message}</p>
        </div>
        
        {finding.corrective_action && (
          <div>
            <h4 className="text-xs font-medium text-text-secondary uppercase mb-1">Corrective Action</h4>
            <p className="text-sm text-text-primary bg-surface p-2 rounded">{finding.corrective_action}</p>
          </div>
        )}

        {finding.evidence && finding.evidence.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-text-secondary uppercase mb-1">Evidence</h4>
            <div className="space-y-2">
              {finding.evidence.map((ev, i) => (
                <div key={i} className="text-xs bg-canvas p-2 rounded border border-border-subtle">
                  <div className="text-text-muted mb-1">Source: {ev.source}</div>
                  <div className="text-text-primary italic">"{ev.snippet}"</div>
                  <div className="text-text-muted mt-1">Confidence: {ev.confidence}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


import { type FC } from 'react';
import type { ComplianceFinding } from '../../legacy_types';
import { cn } from '../../lib/utils';

interface EvidenceTimelineProps {
  findings: ComplianceFinding[];
}

export const EvidenceTimeline: FC<EvidenceTimelineProps> = ({ findings }) => {
  return (
    <div className="bg-panel border border-border rounded-xl p-4 overflow-y-auto">
      <h3 className="text-text-primary font-medium mb-4">Evidence Timeline</h3>
      <div className="relative pl-3 border-l border-border-subtle space-y-6">
        {findings.map(f => (
          <div key={f.finding_id} className="relative">
            <div className={cn(
              "absolute -left-[17px] top-1 w-3 h-3 rounded-full",
              f.severity === 'HIGH' ? "bg-status-danger-bg" : 
              f.severity === 'MEDIUM' ? "bg-status-warning-bg" : "bg-border-highlight"
            )} />
            <div className="text-xs text-text-secondary">{f.finding_id}</div>
            <div className="text-sm text-text-primary">{f.category}</div>
          </div>
        ))}
        {findings.length === 0 && <div className="text-text-muted text-sm">No evidence found</div>}
      </div>
    </div>
  );
};

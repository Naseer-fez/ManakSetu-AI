import { type FC } from 'react';
import type { ComplianceFinding } from '@/types';
import { StatusToken } from '@/components/primitives/StatusToken';
import { cn } from '@/lib/utils';

interface FindingRowProps {
  finding: ComplianceFinding;
  isSelected: boolean;
  onClick: () => void;
}

export const FindingRow: FC<FindingRowProps> = ({ finding, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border cursor-pointer hover:bg-subtle transition-colors",
        isSelected ? "border-ruby bg-ruby-subtle" : "border-border bg-panel"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <StatusToken status={finding.state} size="sm" />
        <span className="text-xs text-text-muted bg-canvas px-2 py-0.5 rounded">{finding.category}</span>
      </div>
      <p className="text-sm text-text-primary line-clamp-2 mb-1">{finding.message}</p>
      {finding.corrective_action && (
        <p className="text-xs text-text-secondary line-clamp-1 italic">Action: {finding.corrective_action}</p>
      )}
    </div>
  );
};

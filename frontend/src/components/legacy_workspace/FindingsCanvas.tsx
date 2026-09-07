import { type FC } from 'react';
import type { ComplianceFinding } from '../../legacy_types';
import { FindingRow } from './FindingRow';

interface FindingsCanvasProps {
  findings: ComplianceFinding[];
  selectedFinding: ComplianceFinding | null;
  onSelectFinding: (f: ComplianceFinding) => void;
}

export const FindingsCanvas: FC<FindingsCanvasProps> = ({ findings, selectedFinding, onSelectFinding }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col">
      <div className="mb-4 text-sm text-text-secondary border-b border-border-subtle pb-2">
        {findings.length} findings
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {findings.map(f => (
          <FindingRow
            key={f.finding_id}
            finding={f}
            isSelected={selectedFinding?.finding_id === f.finding_id}
            onClick={() => onSelectFinding(f)}
          />
        ))}
      </div>
    </div>
  );
};

import { type FC } from 'react';
import type { WorkspaceAnalysis, ComplianceFinding } from '../../legacy_types';
import { EvidenceTimeline } from './EvidenceTimeline';
import { FindingsCanvas } from './FindingsCanvas';
import { FindingInspector } from './FindingInspector';

interface ReviewStageProps {
  analysis: WorkspaceAnalysis;
  selectedFinding: ComplianceFinding | null;
  onSelectFinding: (finding: ComplianceFinding) => void;
}

export const ReviewStage: FC<ReviewStageProps> = ({ analysis, selectedFinding, onSelectFinding }) => {
  const coverage = analysis.compliance_run?.coverage ?? 0;
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-text-secondary">Coverage: <strong className="text-text-primary">{coverage}%</strong></span>
          <span className="text-text-secondary">Version: <strong className="text-text-primary">{analysis.compliance_run?.dataset_version || 'unknown'}</strong></span>
        </div>
        <span className="text-text-secondary">Gate: {analysis.compliance_run?.export_blocked ? 'BLOCKED' : 'OPEN'}</span>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[20%_50%_30%] gap-4 min-h-[500px]">
        <EvidenceTimeline findings={analysis.compliance_run?.findings || []} />
        <FindingsCanvas 
          findings={analysis.compliance_run?.findings || []}
          selectedFinding={selectedFinding}
          onSelectFinding={onSelectFinding}
        />
        <FindingInspector finding={selectedFinding} />
      </div>
    </div>
  );
};


import { type FC } from 'react';
import { GemBidValidationResponse } from '@/types';
import { CopyAction } from '@/components/primitives/CopyAction';
import { StatusToken } from '@/components/primitives/StatusToken';
import { MotionButton } from '@/components/primitives/MotionButton';
import { AlertCircle } from 'lucide-react';

interface GemResultPanelProps {
  result: GemBidValidationResponse;
  onNavigateStandards: () => void;
}

export const GemResultPanel: FC<GemResultPanelProps> = ({ result, onNavigateStandards }) => {

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between p-4 bg-panel rounded-xl border border-border">
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-1">Validation Status</h3>
          <StatusToken
            status={result.status}
          />
        </div>
        <div className="text-right">
          <h3 className="text-sm font-medium text-text-primary mb-1">Score</h3>
          <span className="text-lg font-bold text-text-primary">{(result.compliance_score * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-status-warning-bg rounded-lg border border-border-highlight">
        <AlertCircle className="w-5 h-5 text-status-warning shrink-0" />
        <p className="text-xs text-status-warning font-medium">
          This webhook result is a recommendation and does not replace a final compliance decision.
        </p>
      </div>

      <div className="p-4 bg-panel rounded-xl border border-border">
        <h4 className="text-xs text-text-muted mb-2">Primary Standard</h4>
        <p className="text-sm font-medium text-text-primary">{result.primary_standard}</p>
        
        {result.is_qco_mandatory && (
          <div className="mt-4 p-3 bg-ruby-subtle border border-ruby rounded-lg">
            <span className="text-xs font-semibold text-ruby block mb-1">QCO Mandatory</span>
            <p className="text-xs text-text-secondary">{result.qco_order}</p>
          </div>
        )}
      </div>

      {result.recommended_clause && (
        <div className="p-4 bg-panel rounded-xl border border-border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs text-text-muted">Recommended Tender Clause</h4>
            <CopyAction content={result.recommended_clause} />
          </div>
          <p className="text-sm font-mono text-text-secondary bg-surface p-3 rounded-lg">
            {result.recommended_clause}
          </p>
        </div>
      )}

      <MotionButton variant="secondary" onClick={onNavigateStandards} className="w-full">
        View related standards
      </MotionButton>
    </div>
  );
};


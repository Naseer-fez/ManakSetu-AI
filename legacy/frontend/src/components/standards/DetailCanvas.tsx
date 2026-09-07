import { type FC } from 'react';
import { StandardRecommendation } from '@/types';
import { ExplanationStream } from './ExplanationStream';
import { TenderClause } from './TenderClause';
import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/primitives/EmptyState';

interface DetailCanvasProps {
  standard: StandardRecommendation | null;
}

export const DetailCanvas: FC<DetailCanvasProps> = ({ standard }) => {
  if (!standard) return <div className="h-full flex items-center justify-center bg-canvas"><EmptyState title="No details" description="Select a standard to view details" /></div>;

  const { standard: is } = standard;
  const { mandatory_qco } = is;

  return (
    <div className="w-full h-full overflow-y-auto p-6 bg-canvas">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-primary mb-2">{is.is_code}</h2>
        <p className="text-lg text-text-secondary">{is.title}</p>
      </div>

      {is.superseded_by && (
        <div className="flex items-center gap-2 p-3 bg-status-danger-bg text-status-danger rounded-lg mb-6">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">Superseded by {is.superseded_by}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-panel rounded-xl border border-border">
          <h4 className="text-xs text-text-muted mb-1">Status</h4>
          <p className="text-sm text-text-primary capitalize">{is.status}</p>
        </div>
        <div className="p-4 bg-panel rounded-xl border border-border">
          <h4 className="text-xs text-text-muted mb-1">Division</h4>
          <p className="text-sm text-text-primary">{is.division}</p>
        </div>
      </div>

      {mandatory_qco && (
        <div className="p-4 bg-ruby-subtle rounded-xl border border-ruby mb-6">
          <h3 className="text-ruby font-medium mb-3">Mandatory QCO Requirements</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-text-primary">
            <div><span className="text-text-muted">Scheme:</span> {mandatory_qco.scheme}</div>
            <div><span className="text-text-muted">Order:</span> {mandatory_qco.order_number}</div>
            <div><span className="text-text-muted">Ministry:</span> {mandatory_qco.issuing_ministry}</div>
            <div><span className="text-text-muted">Effective:</span> {mandatory_qco.effective_date}</div>
          </div>
        </div>
      )}

      <ExplanationStream isCode={is.is_code} context={standard.match_reasons?.join(' ') ?? ''} />
      <TenderClause isCode={is.is_code} initialClause={standard.sample_tender_clause} />
    </div>
  );
};


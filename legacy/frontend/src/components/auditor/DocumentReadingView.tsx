import { type FC } from 'react';
import type { ExtractedLineItem } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface DocumentReadingViewProps {
  items: ExtractedLineItem[];
}

export const DocumentReadingView: FC<DocumentReadingViewProps> = ({ items }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Extracted Items ({items.length})
      </h3>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="bg-panel border border-border-subtle p-4 rounded-lg">
            <div className="font-medium text-text-primary mb-1">{item.product_title}</div>
            <div className="text-sm text-text-secondary mb-3">{item.spec_summary}</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase mb-2">Cited Standards</h4>
                <div className="space-y-2">
                  {item.cited_standards.map((cs, i) => (
                    <div key={i} className="flex flex-col text-sm bg-canvas p-2 rounded">
                      <span className="text-text-primary">{cs}</span>
                      {item.outdated_citations?.includes(cs) && (
                        <span className="flex items-center gap-1 text-xs text-text-warning mt-1">
                          <AlertTriangle size={12} /> Outdated
                        </span>
                      )}
                    </div>
                  ))}
                  {item.cited_standards.length === 0 && <span className="text-sm text-text-muted">None cited</span>}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase mb-2">Recommended Standards</h4>
                <div className="space-y-2">
                  {item.recommended_standards.map((rs, i) => (
                    <div key={i} className="flex flex-col text-sm bg-ruby-subtle p-2 rounded border border-ruby/20">
                      <span className="text-text-primary font-medium">{rs.standard?.is_code}</span>
                      <span className="text-xs text-text-secondary">{rs.standard?.title}</span>
                    </div>
                  ))}
                  {item.recommended_standards.length === 0 && <span className="text-sm text-text-muted">None recommended</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


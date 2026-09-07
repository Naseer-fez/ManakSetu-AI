import { type FC, useState, useEffect } from 'react';
import { generateTenderClauses } from '@/services/standards.service';
import { CopyAction } from '@/components/primitives/CopyAction';
import { LoadingState } from '@/components/primitives/LoadingState';
import { AlertCircle } from 'lucide-react';

interface TenderClauseProps {
  isCode: string;
  initialClause?: string | null;
}

export const TenderClause: FC<TenderClauseProps> = ({ isCode, initialClause }) => {
  const [clause, setClause] = useState<string>(initialClause || '');
  const [isLoading, setIsLoading] = useState(!initialClause);

  useEffect(() => {
    if (!initialClause) {
      setIsLoading(true);
      generateTenderClauses(isCode)
        .then((res) => {
          setClause(res.clause_text || 'No clause generated.');
        })
        .finally(() => setIsLoading(false));
    } else {
      setClause(initialClause);
    }
  }, [isCode, initialClause]);

  return (
    <div className="bg-canvas rounded-xl p-4 border border-border mt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-text-primary">Tender Clause</h4>
        {!isLoading && <CopyAction content={clause} />}
      </div>
      <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-status-warning-bg rounded-lg border border-border-highlight">
        <AlertCircle className="w-4 h-4 text-status-warning" />
        <span className="text-xs text-status-warning font-medium">
          Proposal only - not legal compliance confirmation
        </span>
      </div>
      {isLoading ? (
        <LoadingState />
      ) : (
        <p className="text-sm text-text-secondary whitespace-pre-wrap font-mono bg-panel p-3 rounded-md">
          {clause}
        </p>
      )}
    </div>
  );
};

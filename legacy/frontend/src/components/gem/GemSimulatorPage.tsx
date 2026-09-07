import { useState, type FC } from 'react';
import { GemBidValidationRequest, GemBidValidationResponse } from '@/types';
import { validateGemBid } from '@/services/gem.service';
import { GemInputForm } from './GemInputForm';
import { GemResultPanel } from './GemResultPanel';
import { EmptyState } from '@/components/primitives/EmptyState';
import { ErrorState } from '@/components/primitives/ErrorState';

export const GemSimulatorPage: FC = () => {
  const [formData, setFormData] = useState<GemBidValidationRequest>({
    bid_id: '',
    category_name: '',
    product_title: '',
    buyer_specifications: ''
  });
  const [result, setResult] = useState<GemBidValidationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleValidate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await validateGemBid(formData);
      setResult(res);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateStandards = () => {
    // Navigate logic to be implemented by parent or router
    console.log('Navigate to standards');
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-surface overflow-hidden">
      <div className="w-full md:w-1/2 p-6 border-r border-border bg-panel overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-2">GeM Bid Simulator</h2>
          <p className="text-sm text-text-secondary">Simulate webhook validation for GeM bids.</p>
        </div>
        <GemInputForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleValidate}
          isLoading={isLoading}
        />
      </div>
      <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-canvas">
        {error ? (
          <div className="h-full flex items-center justify-center"><ErrorState /></div>
        ) : result ? (
          <GemResultPanel result={result} onNavigateStandards={handleNavigateStandards} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <EmptyState title="No validation results" description="Enter bid details and validate to see results." />
            <p className="mt-4 text-sm text-text-muted">Enter bid details and validate to see results.</p>
          </div>
        )}
      </div>
    </div>
  );
};


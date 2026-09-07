import { useState, type FC, useCallback } from 'react';
import { StandardRecommendation } from '@/types';
import { RadiantSearchComposer } from '@/components/search/RadiantSearchComposer';
import { ResultRail } from './ResultRail';
import { DetailCanvas } from './DetailCanvas';
import { fetchRecommendations } from '@/services/standards.service';
import { LoadingState } from '@/components/primitives/LoadingState';
import { ErrorState } from '@/components/primitives/ErrorState';

export const StandardsPage: FC = () => {
  const [query, setQuery] = useState('');
  const [division, setDivision] = useState('All');
  const [results, setResults] = useState<StandardRecommendation[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<StandardRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchRecommendations({ query, top_k: 10, division: division === 'All' ? undefined : division });
      setResults(res.recommendations);
      setSelectedStandard(res.recommendations[0] || null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  return (
    <div className="h-full flex flex-col bg-surface overflow-hidden">
      <div className="p-4 border-b border-border bg-panel shrink-0">
        <RadiantSearchComposer
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          division={division}
          onDivisionChange={setDivision}
        />
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {['All', 'Civil', 'Electrical', 'Electronics', 'Solar'].map(div => (
            <button
              key={div}
              onClick={() => setDivision(div)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                division === div ? 'bg-ruby text-white' : 'bg-surface text-text-secondary hover:bg-subtle'
              }`}
            >
              {div}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center"><LoadingState /></div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center"><ErrorState message={error.message} /></div>
        ) : (
          <>
            <div className="w-full md:w-[35%] h-full shrink-0">
              <ResultRail results={results} selectedStandard={selectedStandard} onSelect={setSelectedStandard} />
            </div>
            <div className="w-full md:w-[65%] h-full">
              <DetailCanvas standard={selectedStandard} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

import { type FC } from 'react';
import { StandardRecommendation } from '@/types';
import { StandardCard } from './StandardCard';

interface ResultRailProps {
  results: StandardRecommendation[];
  selectedStandard: StandardRecommendation | null;
  onSelect: (item: StandardRecommendation) => void;
}

export const ResultRail: FC<ResultRailProps> = ({
  results,
  selectedStandard,
  onSelect,
}) => {
  return (
    <div className="w-full h-full flex flex-col border-r border-border bg-panel">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-text-primary">
          {results.length} Matches Found
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {results.map((result) => (
          <StandardCard
            key={result.standard.is_code}
            item={result}
            isSelected={selectedStandard?.standard.is_code === result.standard.is_code}
            onSelect={onSelect}
          />
        ))}
        {results.length === 0 && (
          <div className="text-sm text-text-muted text-center mt-10">
            No standards found.
          </div>
        )}
      </div>
    </div>
  );
};


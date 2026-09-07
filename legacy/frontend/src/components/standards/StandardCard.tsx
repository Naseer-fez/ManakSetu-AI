import { type FC } from 'react';
import { StandardRecommendation } from '@/types';
import { cn } from '@/lib/utils';
import { StatusToken } from '@/components/primitives/StatusToken';

interface StandardCardProps {
  item: StandardRecommendation;
  isSelected: boolean;
  onSelect: (item: StandardRecommendation) => void;
}

export const StandardCard: FC<StandardCardProps> = ({
  item,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(item)}
      className={cn(
        'cursor-pointer p-4 border rounded-xl mb-3 transition-colors',
        'bg-surface hover:bg-subtle',
        isSelected ? 'border-ruby bg-ruby-glow' : 'border-border'
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-text-primary text-sm truncate max-w-[70%]">
          {item.standard.is_code}
        </h4>
        <StatusToken
          status={`${(item.relevance_score * 100).toFixed(0)}% Match`}
          size="sm"
        />
      </div>
      <p className="text-xs text-text-secondary line-clamp-2 mb-3">
        {item.standard.title}
      </p>
      {item.standard.mandatory_qco?.is_mandatory && (
        <span className="text-xs bg-ruby-subtle text-ruby px-2 py-1 rounded-md font-medium">
          QCO Mandatory
        </span>
      )}
    </div>
  );
};


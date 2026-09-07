import { type FC } from 'react';
import { CaretLight } from '@/components/search/CaretLight';

export interface SearchTextLayerProps {
  value: string;
  placeholder: string;
  suggestion: string;
  before: string;
  after: string;
  isSuggestionVisible: boolean;
}

export const SearchTextLayer: FC<SearchTextLayerProps> = ({
  value,
  placeholder,
  suggestion,
  before,
  after,
  isSuggestionVisible,
}) => {
  return (
    <div className="kr-text-layer" aria-hidden="true">
      {value.length === 0 ? (
        <>
          <CaretLight showRightBeam />
          <span className="kr-placeholder">{placeholder}</span>
        </>
      ) : (
        <>
          <span className="kr-before">{before}</span>
          <CaretLight showRightBeam={false} />
          <span className="kr-after">{after}</span>
          {isSuggestionVisible && <span className="kr-suggestion">{suggestion}</span>}
        </>
      )}
    </div>
  );
};

import { useState, useRef, useEffect, type FC, type ChangeEvent, type KeyboardEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { SearchTextLayer } from '@/components/search/SearchTextLayer';
import { DivisionFilterBar } from '@/components/search/DivisionFilterBar';
import { type RadiantSearchComposerProps } from '@/components/search/search.types';
import { cn } from '@/lib/utils';
import '@/styles/radiant-search.css';

export type { RadiantSearchComposerProps };

export const RadiantSearchComposer: FC<RadiantSearchComposerProps> = ({
  value, onChange, onSearch, division = 'All', onDivisionChange,
  placeholder = 'Search Indian Standards (IS), products, clauses...',
  suggestion = 'solar photovoltaic grid inverter', isLoading = false, className,
}) => {
  const [cursorPos, setCursorPos] = useState(value.length);
  const [focused, setFocused] = useState(false);
  const [burst, setBurst] = useState(false);
  const [showSugg, setShowSugg] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (burstTimer.current) clearTimeout(burstTimer.current); }, []);

  const triggerBurst = (): void => {
    setBurst(false);
    requestAnimationFrame(() => setBurst(true));
    if (burstTimer.current) clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => setBurst(false), 150);
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>): void => {
    setShowSugg(false);
    const nextVal = e.target.value.slice(0, 75);
    onChange(nextVal);
    setCursorPos(Math.min(e.target.selectionStart ?? nextVal.length, nextVal.length));
    triggerBurst();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(value.trim(), division);
    }
  };

  return (
    <div className={cn('w-full space-y-3', className)}>
      <div
        className="kr-composer cursor-text"
        data-active={focused}
        data-burst={burst}
        onClick={() => inputRef.current?.focus()}
      >
        <SearchTextLayer
          value={value}
          placeholder={placeholder}
          suggestion={suggestion}
          before={value.slice(0, cursorPos)}
          after={value.slice(cursorPos)}
          isSuggestionVisible={showSugg && value.length > 0 && cursorPos === value.length}
        />
        <input
          ref={inputRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onSelect={(e) => setCursorPos(e.currentTarget.selectionStart ?? value.length)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="kr-real-input"
          aria-label="Indian Standards Search"
          autoComplete="off"
          spellCheck={false}
          maxLength={75}
        />
        <button
          type="button"
          onClick={() => onSearch(value.trim(), division)}
          disabled={isLoading}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-ruby/15 hover:bg-ruby/25 text-ruby border border-ruby/30 transition-all cursor-pointer"
          aria-label="Submit search"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
      </div>
      {onDivisionChange && (
        <DivisionFilterBar selectedDivision={division} onSelectDivision={onDivisionChange} />
      )}
    </div>
  );
};

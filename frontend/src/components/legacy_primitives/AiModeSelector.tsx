import { type FC, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AiMode = 'fast' | 'thinking';

export interface AiModeSelectorProps {
  mode: AiMode;
  onModeChange: (mode: AiMode) => void;
  disabled?: boolean;
  className?: string;
}

export const AiModeSelector: FC<AiModeSelectorProps> = ({
  mode,
  onModeChange,
  disabled = false,
  className,
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onModeChange('thinking');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onModeChange('fast');
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="AI Reasoning Mode"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex items-center p-1 rounded-xl bg-panel border border-border',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'fast'}
        disabled={disabled}
        onClick={() => onModeChange('fast')}
        className={cn(
          'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
          mode === 'fast' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
        )}
      >
        {mode === 'fast' && (
          <motion.div
            layoutId="aiModePill"
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute inset-0 bg-subtle border border-border-highlight rounded-lg shadow-sm"
          />
        )}
        <Zap className="w-3.5 h-3.5 relative z-10 text-ruby shrink-0" />
        <span className="relative z-10">Fast</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={mode === 'thinking'}
        disabled={disabled}
        onClick={() => onModeChange('thinking')}
        className={cn(
          'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
          mode === 'thinking' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
        )}
      >
        {mode === 'thinking' && (
          <motion.div
            layoutId="aiModePill"
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute inset-0 bg-subtle border border-border-highlight rounded-lg shadow-sm"
          />
        )}
        <Brain className="w-3.5 h-3.5 relative z-10 text-ruby shrink-0" />
        <span className="relative z-10">Thinking</span>
      </button>
    </div>
  );
};

import { type FC } from 'react';
import { X, RefreshCw, Sparkles } from 'lucide-react';
import { AiModeSelector, type AiMode } from '@/components/primitives/AiModeSelector';
import { cn } from '@/lib/utils';

export interface AssistantHeaderProps {
  mode: AiMode;
  onModeChange: (mode: AiMode) => void;
  documentContext?: string | null;
  onRefreshContext?: () => void;
  onClose: () => void;
  className?: string;
}

export const AssistantHeader: FC<AssistantHeaderProps> = ({
  mode,
  onModeChange,
  documentContext,
  onRefreshContext,
  onClose,
  className,
}) => {
  return (
    <header className={cn('p-4 border-b border-border space-y-3 bg-surface/80 select-none', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ruby/10 border border-ruby/20 flex items-center justify-center text-ruby">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">
              BIS Procurement Assistant
            </h2>
            <p className="text-[11px] text-text-muted">Grounded Intelligence Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onRefreshContext && (
            <button
              type="button"
              onClick={onRefreshContext}
              aria-label="Refresh document context"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-subtle transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Assistant Sheet"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-subtle transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <AiModeSelector mode={mode} onModeChange={onModeChange} />

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-subtle border border-border text-[11px] text-text-secondary truncate max-w-[170px]">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full shrink-0',
              documentContext ? 'bg-status-compliant ring-1 ring-status-compliant/30' : 'bg-text-muted'
            )}
          />
          <span className="truncate">
            {documentContext ? `Context: ${documentContext}` : 'No document attached'}
          </span>
        </div>
      </div>
    </header>
  );
};

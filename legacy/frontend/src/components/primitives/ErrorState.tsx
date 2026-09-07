import { type FC } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { MotionButton } from '@/components/primitives/MotionButton';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  message?: string;
  code?: string;
  onRetry?: () => void;
  canRetry?: boolean;
  className?: string;
}

export const ErrorState: FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred',
  code,
  onRetry,
  canRetry = true,
  className,
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-status-danger-bg/40 border border-status-danger/30',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-status-danger-bg border border-status-danger/40 flex items-center justify-center text-status-danger mb-4">
        <AlertOctagon className="w-6 h-6" />
      </div>
      {code && (
        <span className="font-mono text-xs text-status-danger font-semibold uppercase tracking-wider mb-1">
          {code}
        </span>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-1">Operation Failed</h3>
      <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-5">{message}</p>
      {canRetry && onRetry && (
        <MotionButton variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </MotionButton>
      )}
    </div>
  );
};

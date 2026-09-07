import { type FC } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  message?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: FC<LoadingStateProps> = ({
  message = 'Processing request...',
  isLoading = true,
  size = 'md',
  className,
}) => {
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-panel/40 border border-border',
        className
      )}
    >
      <div className="relative flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full bg-ruby/20 blur-md animate-pulse" />
        <Loader2
          className={cn(
            'animate-spin text-ruby relative z-10',
            size === 'sm' && 'w-6 h-6',
            size === 'md' && 'w-8 h-8',
            size === 'lg' && 'w-10 h-10'
          )}
        />
      </div>
      <p className="text-sm font-medium text-text-primary tracking-tight">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
};

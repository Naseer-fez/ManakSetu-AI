import { type FC, type ReactNode } from 'react';
import { FolderOpen, Search, ShieldAlert, FileQuestion, type LucideIcon } from 'lucide-react';
import { MotionButton } from '@/components/primitives/MotionButton';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon | 'workspace' | 'standards' | 'qco';
  actionLabel?: string;
  onAction?: () => void;
  hasAction?: boolean;
  className?: string;
  children?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({
  title,
  description,
  icon: IconProp,
  actionLabel,
  onAction,
  hasAction = false,
  className,
  children,
}) => {
  const resolveIcon = (): LucideIcon => {
    if (typeof IconProp === 'function') return IconProp;
    if (IconProp === 'workspace') return FolderOpen;
    if (IconProp === 'standards') return Search;
    if (IconProp === 'qco') return ShieldAlert;
    return FileQuestion;
  };

  const IconComponent = resolveIcon();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-panel/50 border border-border',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-subtle border border-border-highlight flex items-center justify-center text-text-muted mb-4">
        <IconComponent className="w-6 h-6 text-ruby/80" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-5">{description}</p>
      {(hasAction || actionLabel) && onAction && (
        <MotionButton variant="ruby" size="sm" onClick={onAction}>
          {actionLabel || 'Get Started'}
        </MotionButton>
      )}
      {children}
    </div>
  );
};

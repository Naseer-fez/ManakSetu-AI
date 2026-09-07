import { type FC, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'ruby' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface MotionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-panel hover:bg-subtle text-text-primary border-border hover:border-border-highlight',
  ruby: 'bg-ruby hover:bg-ruby-hover text-white border-transparent shadow-glass shadow-ruby/20',
  secondary: 'bg-subtle hover:bg-panel text-text-secondary hover:text-text-primary border-border-subtle',
  outline: 'bg-transparent hover:bg-subtle text-text-primary border-border hover:border-border-highlight',
  ghost: 'bg-transparent hover:bg-subtle/60 text-text-secondary hover:text-text-primary border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-6 text-base gap-2.5 rounded-xl',
  icon: 'h-9 w-9 p-0 rounded-lg justify-center',
};

export const MotionButton: FC<MotionButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const motionProps: HTMLMotionProps<'button'> = {
    whileHover: disabled || isLoading ? undefined : { scale: 1.025, y: -1 },
    whileTap: disabled || isLoading ? undefined : { scale: 0.96, y: 0 },
    transition: { type: 'spring', stiffness: 400, damping: 20 },
  };

  return (
    <motion.button
      type="button"
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center font-medium border transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby/50 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...motionProps}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />}
      {children}
    </motion.button>
  );
};

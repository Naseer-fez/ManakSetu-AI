import { useState, useRef, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CopyActionProps {
  content: string;
  label?: string;
  delay?: number;
  variant?: 'default' | 'ruby' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
  onCopiedChange?: (copied: boolean, content?: string) => void;
  className?: string;
}

const styles: Record<string, string> = {
  default: 'bg-subtle/80 hover:bg-subtle text-text-secondary hover:text-text-primary border border-border',
  ruby: 'bg-ruby/10 hover:bg-ruby/20 text-ruby border border-ruby/30',
  ghost: 'bg-transparent hover:bg-subtle/50 text-text-muted hover:text-text-primary',
  outline: 'bg-transparent hover:bg-subtle border border-border text-text-secondary',
  sz_default: 'h-8 px-2.5',
  sz_sm: 'h-7 px-2 text-[11px]',
  sz_icon: 'h-7 w-7 p-0 justify-center',
};

export const CopyAction: FC<CopyActionProps> = ({
  content, label, delay = 3000, variant = 'default', size = 'default', onCopiedChange, className,
}) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopiedChange?.(true, content);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { setCopied(false); onCopiedChange?.(false, content); }, delay);
    } catch { setCopied(false); }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : label || 'Copy to clipboard'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ruby',
        styles[variant], styles[`sz_${size}`], className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.15, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 18 }}
            className="inline-flex items-center gap-1.5 text-status-compliant"
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            {label && <span>Copied</span>}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="inline-flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 shrink-0" />
            {label && <span>{label}</span>}
          </motion.span>
        )}
      </AnimatePresence>
      <span aria-live="polite" className="sr-only">{copied ? 'Copied to clipboard' : ''}</span>
    </button>
  );
};

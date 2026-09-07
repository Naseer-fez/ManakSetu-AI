import { type FC, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface TextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  by?: 'character' | 'word';
  stagger?: number;
  delay?: number;
  className?: string;
}

export const TextReveal: FC<TextRevealProps> = ({
  text,
  as: Component = 'h1',
  by = 'character',
  stagger = 0.02,
  delay = 0,
  className,
}) => {
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tokens = useMemo(() => {
    return by === 'word' ? text.split(/(\s+)/) : text.split('');
  }, [text, by]);

  if (prefersReducedMotion) {
    return <Component className={cn('tracking-tight', className)}>{text}</Component>;
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.35, ease: [0.2, 0.65, 0.3, 0.9] },
    },
  };

  return (
    <Component className={cn('inline-flex flex-wrap tracking-tight', className)} aria-label={text}>
      <motion.span
        className="inline-flex flex-wrap"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-hidden="true"
      >
        {tokens.map((token, index) => (
          <motion.span
            key={`${token}-${index}`}
            variants={itemVariants}
            className="inline-block whitespace-pre"
          >
            {token}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};

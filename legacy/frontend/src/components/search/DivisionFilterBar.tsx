import { type FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const SUPPORTED_DIVISIONS = ['All', 'Civil', 'Electrical', 'Electronics', 'Solar'] as const;
export type DivisionType = typeof SUPPORTED_DIVISIONS[number];

export interface DivisionFilterBarProps {
  selectedDivision: string;
  onSelectDivision: (division: string) => void;
  className?: string;
}

export const DivisionFilterBar: FC<DivisionFilterBarProps> = ({
  selectedDivision,
  onSelectDivision,
  className,
}) => {
  return (
    <div
      role="tablist"
      aria-label="BIS Division Filter"
      className={cn('flex flex-wrap items-center gap-2 pt-3', className)}
    >
      {SUPPORTED_DIVISIONS.map((division) => {
        const isSelected = selectedDivision.toLowerCase() === division.toLowerCase();
        return (
          <button
            key={division}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectDivision(division)}
            className={cn(
              'relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none',
              isSelected
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-secondary bg-panel/60 hover:bg-subtle border border-border'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="divisionActivePill"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="absolute inset-0 bg-ruby/15 border border-ruby/40 rounded-full shadow-sm"
              />
            )}
            <span className="relative z-10">{division}</span>
          </button>
        );
      })}
    </div>
  );
};

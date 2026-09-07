import { useState, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type RailItemConfig } from '@/components/shell/rail.types';
import { cn } from '@/lib/utils';

export interface RailItemProps {
  item: RailItemConfig;
  isActive: boolean;
  onSelect: () => void;
  isMobile?: boolean;
}

export const RailItem: FC<RailItemProps> = ({ item, isActive, onSelect, isMobile = false }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const IconComponent = item.icon;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-label={item.label}
        onClick={onSelect}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className={cn(
          'relative z-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer',
          isMobile ? 'w-10 h-10' : 'w-11 h-11',
          isActive ? 'text-ruby font-semibold' : 'text-text-muted hover:text-text-primary'
        )}
      >
        {isActive && (
          <>
            {/* Luminous Multicolor Glow Ring */}
            <motion.div
              layoutId="rail-glow-ring"
              transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.8 }}
              className="absolute -inset-1 rounded-2xl opacity-40 blur-md pointer-events-none"
              style={{ background: 'var(--glow-spectrum)' }}
            />
            {/* Jelly Squash-and-Stretch Active Pill */}
            <motion.div
              layoutId="rail-active-lens"
              animate={{
                scaleX: [1, 1.12, 0.96, 1],
                scaleY: [1, 0.92, 1.04, 1],
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.8 }}
              className="absolute inset-0 rounded-xl bg-subtle border border-border-highlight shadow-glass"
            />
          </>
        )}
        <IconComponent className="w-5 h-5 relative z-10 shrink-0" />
      </button>

      {/* Floating Contextual Tooltip (Desktop only) */}
      {!isMobile && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-full ml-3.5 z-50 pointer-events-none px-3 py-1.5 rounded-lg bg-surface border border-border shadow-glass whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">{item.label}</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-subtle text-text-muted border border-border">
                  {item.shortcut}
                </kbd>
              </div>
              <p className="text-[11px] text-text-secondary">{item.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

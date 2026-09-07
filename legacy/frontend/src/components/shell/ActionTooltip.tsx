import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ActionTooltipProps {
  isVisible: boolean;
  title: string;
  subtitle: string;
}

export const ActionTooltip: FC<ActionTooltipProps> = ({ isVisible, title, subtitle }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          className="absolute left-full ml-3.5 top-1 z-50 pointer-events-none px-3 py-1.5 rounded-lg bg-surface border border-border shadow-glass whitespace-nowrap"
        >
          <div className="text-xs font-semibold text-text-primary">{title}</div>
          <div className="text-[11px] text-text-secondary">{subtitle}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

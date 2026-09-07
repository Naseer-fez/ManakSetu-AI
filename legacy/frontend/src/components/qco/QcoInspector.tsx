import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MandatoryQCO } from '@/types';
import { X } from 'lucide-react';
import { CopyAction } from '@/components/primitives/CopyAction';

interface QcoInspectorProps {
  qco: MandatoryQCO | null;
  onClose: () => void;
}

export const QcoInspector: FC<QcoInspectorProps> = ({ qco, onClose }) => {
  return (
    <AnimatePresence>
      {qco && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="absolute top-0 right-0 w-full max-w-md h-full bg-panel border-l border-border shadow-2xl z-50 flex flex-col"
        >
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-text-primary">QCO Details</h3>
            <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <div className="mb-6">
              <h4 className="text-xs text-text-muted mb-1">Standard Code</h4>
              <p className="text-sm font-medium text-text-primary">{qco.order_number}</p>
            </div>
            <div className="mb-6">
              <h4 className="text-xs text-text-muted mb-1">Issuing Ministry</h4>
              <p className="text-sm text-text-secondary">{qco.issuing_ministry}</p>
            </div>
            <div className="mb-6">
              <h4 className="text-xs text-text-muted mb-1">Effective Date</h4>
              <p className="text-sm text-text-secondary">{qco.effective_date}</p>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs text-text-muted">Clause Requirement</h4>
                <CopyAction content={qco.clause_requirement} />
              </div>
              <p className="text-sm text-text-secondary bg-surface p-4 rounded-xl border border-border">
                {qco.clause_requirement}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

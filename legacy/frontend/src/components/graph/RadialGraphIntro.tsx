import { type FC } from 'react';
import { motion } from 'framer-motion';

export const RadialGraphIntro: FC = () => {
  const nodes = ['Standards', 'QCOs', 'Labs', 'Products', 'Safety', 'Tests'];
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-canvas z-10">
      {nodes.map((label, i) => {
        const angle = (i / nodes.length) * Math.PI * 2;
        const radius = 100;
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: 1, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className="absolute p-3 rounded-full bg-surface border border-border text-sm text-text-primary shadow-lg"
          >
            {label}
          </motion.div>
        );
      })}
    </div>
  );
};

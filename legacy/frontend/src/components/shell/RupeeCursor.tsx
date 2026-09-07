import { useEffect, useState, type FC } from 'react';
import { motion, useSpring } from 'framer-motion';

export const RupeeCursor: FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isInteractive, setIsInteractive] = useState<boolean>(false);
  const [isOverInput, setIsOverInput] = useState<boolean>(false);

  const springConfig = { stiffness: 500, damping: 28, mass: 0.2 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isCoarse || isReduced) return;

    const handlePointerMove = (e: PointerEvent): void => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const overInput = Boolean(target.closest('input, textarea, [contenteditable="true"]'));
      setIsOverInput(overInput);

      const overInteractive = Boolean(
        target.closest('button, a, [role="button"], [role="tab"], [role="radio"]')
      );
      setIsInteractive(overInteractive);
    };

    const handlePointerLeave = (): void => setIsVisible(false);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible || isOverInput) return null;

  return (
    <motion.div
      style={{ x: cursorX, y: cursorY }}
      animate={{
        scale: isInteractive ? 1.6 : 1.0,
      }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className="fixed top-0 left-0 pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center select-none"
      aria-hidden="true"
    >
      <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-ruby/20 border border-ruby/40 backdrop-blur-[2px] shadow-glass shadow-ruby/25">
        <span className="text-[13px] font-bold text-white leading-none">₹</span>
      </div>
    </motion.div>
  );
};

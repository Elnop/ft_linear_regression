import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { Rectangle } from '@/lib/paint/types.ts';
import '@/features/dashboard/chart/chart.css';

export type OverlayPanelProps = {
  visible: boolean;
  rectangle: Rectangle;
  children: ReactNode;
};

export function OverlayPanel({ visible, rectangle, children }: OverlayPanelProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="overlay-panel"
          style={{ left: rectangle.x, top: rectangle.y, width: rectangle.width, height: rectangle.height }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

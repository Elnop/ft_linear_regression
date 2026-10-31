import { AnimatePresence, motion } from 'motion/react';
import '@/features/dashboard/controls/controls.css';

type SkipButtonProps = {
  visible: boolean;
  onSkip: () => void;
};

export function SkipButton({ visible, onSkip }: SkipButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className="button-skip glass dashboard-hit"
          onClick={onSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          PASSER
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
            <path d="M5 5v14l9-7zM14 5v14l9-7z" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

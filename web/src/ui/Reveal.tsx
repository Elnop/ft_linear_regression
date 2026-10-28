import { motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';

type Props = {
  visible: boolean;
  delay?: number; // seconds, only when appearing
  from?: { x?: number; y?: number };
  className?: string;
  style?: CSSProperties;
  label?: string;
  as?: 'div' | 'section' | 'aside' | 'header' | 'footer';
  children: ReactNode;
};

// Fades and slides a block in; hidden blocks are inert and out of the a11y tree.
export function Reveal({ visible, delay = 0, from = { y: 14 }, className, style, label, as = 'div', children }: Props) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      style={{ ...style, pointerEvents: visible ? undefined : 'none' }}
      aria-label={label}
      aria-hidden={visible ? undefined : true}
      inert={!visible}
      initial={false}
      animate={visible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: from.x ?? 0, y: from.y ?? 0 }}
      transition={{ duration: visible ? 0.7 : 0.3, delay: visible ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

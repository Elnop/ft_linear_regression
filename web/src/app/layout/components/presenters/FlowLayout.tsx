import type { ReactNode } from 'react';
import { Reveal } from '@/components/shared/motion/presenters/Reveal.tsx';

type Props = {
  visible: boolean;
  padding: number;
  top: number;
  head: ReactNode;
  panels: ReactNode;
  bar: ReactNode;
  documentation: ReactNode;
};

export function FlowLayout({ visible, padding, top, head, panels, bar, documentation }: Props) {
  return (
    <div className="wall-flow" style={{ padding: `${top}px ${padding}px ${padding}px` }}>
      <Reveal visible={visible}>{head}</Reveal>
      <Reveal visible={visible} as="aside" label="Prédiction et précision" className="wall-aside" style={{ position: 'relative' }}>
        {panels}
      </Reveal>
      <Reveal visible={visible} as="footer">
        {bar}
      </Reveal>
      {visible && documentation}
    </div>
  );
}

import type { ReactNode } from 'react';
import { Reveal } from '@/components/shared/motion/presenters/Reveal.tsx';

type Props = {
  visible: boolean;
  pad: number;
  top: number;
  head: ReactNode;
  panels: ReactNode;
  bar: ReactNode;
  doc?: ReactNode;
};

export function FlowLayout({ visible, pad, top, head, panels, bar, doc }: Props) {
  return (
    <div className="wu-flow" style={{ padding: `${top}px ${pad}px ${pad}px` }}>
      <Reveal visible={visible}>{head}</Reveal>
      <Reveal visible={visible} as="aside" label="Prédiction et précision" className="wu-aside" style={{ position: 'relative' }}>
        {panels}
      </Reveal>
      <Reveal visible={visible} as="footer">
        {bar}
      </Reveal>
      {visible && doc}
    </div>
  );
}

import type { ReactNode } from 'react';
import { Reveal } from '@/components/shared/motion/presenters/Reveal.tsx';
import { ASIDE_WIDTH, footerBottom, HEAD_TO_ASIDE } from '@/lib/layout.ts';

type Props = {
  visible: boolean;
  padding: number;
  top: number;
  head: ReactNode;
  panels: ReactNode;
  bar: ReactNode;
};

export function WideLayout({ visible, padding, top, head, panels, bar }: Props) {
  return (
    <>
      <Reveal visible={visible} from={{ y: -12 }} style={{ position: 'absolute', top, right: padding }}>
        {head}
      </Reveal>
      <Reveal
        visible={visible}
        from={{ x: 24 }}
        as="aside"
        label="Prédiction et précision"
        className="wall-aside"
        style={{ right: padding, top: top + HEAD_TO_ASIDE, width: ASIDE_WIDTH }}
      >
        {panels}
      </Reveal>
      <Reveal visible={visible} from={{ y: 24 }} as="footer" style={{ position: 'absolute', left: padding, right: padding, bottom: footerBottom(padding) }}>
        {bar}
      </Reveal>
    </>
  );
}

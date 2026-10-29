import type { ReactNode } from 'react';
import { Reveal } from '@/components/shared/motion/presenters/Reveal.tsx';
import { ASIDE_W } from '@/lib/layout.ts';

type Props = {
  visible: boolean;
  pad: number;
  top: number;
  head: ReactNode;
  panels: ReactNode;
  bar: ReactNode;
};

export function WideLayout({ visible, pad, top, head, panels, bar }: Props) {
  return (
    <>
      <Reveal visible={visible} from={{ y: -12 }} style={{ position: 'absolute', top, right: pad }}>
        {head}
      </Reveal>
      <Reveal
        visible={visible}
        from={{ x: 24 }}
        as="aside"
        label="Prédiction et précision"
        className="wu-aside"
        style={{ right: pad, top: top + 92, width: ASIDE_W }}
      >
        {panels}
      </Reveal>
      <Reveal visible={visible} from={{ y: 24 }} as="footer" style={{ position: 'absolute', left: pad, right: pad, bottom: Math.round(pad * 0.5) }}>
        {bar}
      </Reveal>
    </>
  );
}

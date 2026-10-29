import { Reveal } from '@/components/shared/motion/presenters/Reveal.tsx';

const SUBTITLE = 'prix ~ kilométrage · descente de gradient · 24 voitures';

type Props = {
  visible: boolean;
  fixed: boolean;
  left: number;
  top: number;
  small: boolean;
};

export function Subtitle({ visible, fixed, left, top, small }: Props) {
  return (
    <Reveal visible={visible} style={{ position: fixed ? 'fixed' : 'absolute', left, top }}>
      <p className="wu-subtitle" style={{ position: 'static', fontSize: small ? 14 : 17 }}>
        {SUBTITLE}
      </p>
    </Reveal>
  );
}

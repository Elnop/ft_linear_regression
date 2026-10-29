import { SprayCanArt } from '@/features/decor/spray-can/components/presenters/SprayCanArt.tsx';
import { useSprayCan } from '@/features/decor/spray-can/hooks/useSprayCan.ts';
import type { PaintEngine } from '@/lib/paint/engine.ts';
import '@/features/decor/spray-can/spray-can.css';

export type SprayCanProps = {
  engine: PaintEngine | null;
  hidden?: boolean;
};

export function SprayCan({ engine, hidden = false }: SprayCanProps) {
  const { box, mist } = useSprayCan(engine, hidden);
  return (
    <>
      <canvas ref={mist} className="spray-mist" aria-hidden="true" />
      <div ref={box} className="spray-can gone" aria-hidden="true">
        <SprayCanArt />
      </div>
    </>
  );
}

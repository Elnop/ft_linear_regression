import { SprayCanArt } from '@/features/decor/spray-can/components/presenters/SprayCanArt.tsx';
import { useSprayCan } from '@/features/decor/spray-can/hooks/useSprayCan.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { useEngine } from '@/lib/paint/engineStore.ts';
import '@/features/decor/spray-can/spray-can.css';

export function SprayCan() {
  const engine = useEngine();
  const skipping = useSequence((s) => s.skipping);
  const { box, mist } = useSprayCan(engine, skipping);
  return (
    <>
      <canvas ref={mist} className="spray-mist" aria-hidden="true" />
      <div ref={box} className="spray-can gone" aria-hidden="true">
        <SprayCanArt />
      </div>
    </>
  );
}

import { SprayCanArt } from '@/features/wall/features/spray-can/components/presenters/SprayCanArt.tsx';
import { useSprayCan } from '@/features/wall/features/spray-can/hooks/useSprayCan.ts';
import { useEngine } from '@/features/wall/shared/stores/engineStore.ts';
import '@/features/wall/features/spray-can/styles/spray-can.css';

export function SprayCan() {
  const engine = useEngine();
  const { box, mist } = useSprayCan(engine);
  return (
    <>
      <canvas ref={mist} className="spray-mist" aria-hidden="true" />
      <div ref={box} className="spray-can gone" aria-hidden="true">
        <SprayCanArt />
      </div>
    </>
  );
}

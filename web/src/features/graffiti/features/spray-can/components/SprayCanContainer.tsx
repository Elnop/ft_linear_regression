import { SprayCanArt } from '@/features/graffiti/features/spray-can/components/SprayCanArt.tsx';
import { useSprayCan } from '@/features/graffiti/features/spray-can/useSprayCan.ts';
import { useEngine } from '@/features/graffiti/shared/engineStore.ts';
import '@/features/graffiti/features/spray-can/spray-can.css';

export function SprayCanContainer() {
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

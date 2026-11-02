import { useMemo } from 'react';
import { Sticker } from '@/features/graffiti/features/stickers/components/Sticker.tsx';
import { placeStickers } from '@/features/graffiti/features/stickers/lib/placeStickers.ts';
import { useScene } from '@/shared/useScene.ts';
import '@/features/graffiti/features/stickers/stickers.css';

export function StickersContainer() {
  const scene = useScene();
  const stickers = useMemo(() => placeStickers(scene), [scene]);
  return (
    <div className="wall-stickers" aria-hidden="true">
      {stickers.map((sticker, i) => (
        <Sticker key={i} {...sticker} />
      ))}
    </div>
  );
}

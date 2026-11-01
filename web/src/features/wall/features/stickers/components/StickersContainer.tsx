import { useMemo } from 'react';
import { Sticker } from '@/features/wall/features/stickers/components/Sticker.tsx';
import { placeStickers } from '@/features/wall/features/stickers/lib/placeStickers.ts';
import { useScene } from '@/shared/useScene.ts';
import '@/features/wall/features/stickers/stickers.css';

export function StickersContainer() {
  const scene = useScene();
  const stickers = useMemo(() => placeStickers(scene), [scene]);
  return (
    <div className="wall-stickers" aria-hidden="true">
      {stickers.map((sticker, i) => (
        <Sticker key={i} id={`sticker-${i}`} {...sticker} />
      ))}
    </div>
  );
}

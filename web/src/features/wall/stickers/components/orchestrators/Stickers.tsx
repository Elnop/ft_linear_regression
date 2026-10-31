import { useMemo } from 'react';
import { Sticker } from '@/features/wall/stickers/components/presenters/Sticker.tsx';
import { placeStickers } from '@/features/wall/stickers/lib/placeStickers.ts';
import { useScene } from '@/shared/hooks/useScene.ts';
import '@/features/wall/stickers/styles/stickers.css';

export function Stickers() {
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

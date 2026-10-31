import { useMemo } from 'react';
import { Sticker } from '@/features/wall/stickers/components/presenters/Sticker.tsx';
import { placeStickers } from '@/features/wall/stickers/lib/placeStickers.ts';
import { useTitleLayout } from '@/features/wall/shared/hooks/useTitleLayout.ts';
import { useChart, useViewport } from '@/shared/stores/viewportStore.ts';
import '@/features/wall/stickers/styles/stickers.css';

export function Stickers() {
  const { width } = useViewport();
  const chart = useChart();
  const title = useTitleLayout();
  const titleRight = title.rectangle.x + title.rectangle.width;
  const stickers = useMemo(() => placeStickers(chart, width, titleRight), [chart, width, titleRight]);
  return (
    <div className="wall-stickers" aria-hidden="true">
      {stickers.map((sticker, i) => (
        <Sticker key={i} id={`sticker-${i}`} {...sticker} />
      ))}
    </div>
  );
}

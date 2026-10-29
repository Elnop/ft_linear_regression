import { useMemo } from 'react';
import { Sticker } from '@/features/decor/stickers/components/presenters/Sticker.tsx';
import { placeStickers } from '@/features/decor/stickers/lib/placement.ts';
import { useTitleLayout } from '@/features/title/hooks/useTitleLayout.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';
import '@/features/decor/stickers/stickers.css';

export function Stickers() {
  const { width } = useViewport();
  const chart = useChart();
  const title = useTitleLayout();
  const titleRight = title.rect.x + title.rect.w;
  const stickers = useMemo(() => placeStickers(chart, width, titleRight), [chart, width, titleRight]);
  return (
    <div className="wu-stickers" aria-hidden="true">
      {stickers.map((s, i) => (
        <Sticker key={i} id={`sticker-${i}`} {...s} />
      ))}
    </div>
  );
}

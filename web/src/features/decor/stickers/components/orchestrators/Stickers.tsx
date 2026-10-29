import { useMemo } from 'react';
import type { ChartMapping } from '@/lib/chart.ts';
import { Sticker } from '@/features/decor/stickers/components/presenters/Sticker.tsx';
import { placeStickers } from '@/features/decor/stickers/lib/placement.ts';
import '@/features/decor/stickers/stickers.css';

export type StickersProps = {
  chart: ChartMapping;
  width: number;
  titleRight?: number;
};

export function Stickers({ chart, width, titleRight }: StickersProps) {
  const stickers = useMemo(() => placeStickers(chart, width, titleRight), [chart, width, titleRight]);
  return (
    <div className="wu-stickers" aria-hidden="true">
      {stickers.map((s, i) => (
        <Sticker key={i} id={`sticker-${i}`} {...s} />
      ))}
    </div>
  );
}

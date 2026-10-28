import type { ChartMapping } from '../paint/index.ts';
import artby from '../assets/stickers/artby.webp';
import human from '../assets/stickers/human.webp';
import noai from '../assets/stickers/noai.webp';
import robot from '../assets/stickers/robot.webp';
import scraped from '../assets/stickers/scraped.webp';
import theft from '../assets/stickers/theft.webp';
import train from '../assets/stickers/train.webp';
import unplug from '../assets/stickers/unplug.webp';

export type StickersProps = {
  chart: ChartMapping;
  width: number;
  // Right edge of the title, so the lone sticker lands past it.
  titleRight?: number;
};

type Item = { src: string; dx: number; dy: number; w: number; rot: number };
type Cluster = { u: number; v: number; items: Item[] }; // anchor in chart area fractions

// The stickers sit above the paint canvas, so they only go where the
// dataset never paints: the cheap low-mileage corner and the dear
// high-mileage corner of the plot are empty (the price drops with km).
const CLUSTERS: Cluster[] = [
  {
    u: 0.03,
    v: 0.62,
    items: [
      { src: robot, dx: 95, dy: 0, w: 54, rot: 12 },
      { src: noai, dx: 0, dy: 16, w: 74, rot: -8 },
      { src: human, dx: 64, dy: 56, w: 82, rot: 4 },
      { src: theft, dx: 9, dy: 102, w: 78, rot: -3 },
    ],
  },
  {
    u: 0.74,
    v: 0.04,
    items: [
      { src: unplug, dx: 77, dy: 0, w: 58, rot: 8 },
      { src: artby, dx: 0, dy: 31, w: 72, rot: -5 },
      { src: train, dx: 129, dy: 44, w: 78, rot: -3 },
      { src: scraped, dx: 57, dy: 71, w: 68, rot: 2 },
    ],
  },
];

// Damaged anti-AI stickers on the wall, at a real-world scale (≈ 8 cm).
export function Stickers({ chart, width, titleRight }: StickersProps) {
  const { area } = chart;
  const k = Math.min(1, Math.max(0.6, width / 1440));
  const imgs: (Item & { x: number; y: number })[] = [];
  for (const c of CLUSTERS) {
    // Keep the whole cluster on screen.
    const right = Math.max(...c.items.map((it) => (it.dx + it.w) * k));
    const ax = Math.min(area.x + c.u * area.w, width - right - 6);
    const ay = area.y + c.v * area.h;
    for (const it of c.items) imgs.push({ ...it, x: ax + it.dx * k, y: ay + it.dy * k });
  }
  // Lone sticker between the title and the θ chips, when there is room.
  if (titleRight !== undefined && width >= 1024 && titleRight + 110 < width - 420) {
    imgs.push({ src: noai, dx: 0, dy: 0, w: 50, rot: 15, x: titleRight + 40, y: Math.max(20, area.y * 0.3) });
  }
  return (
    <div className="wu-stickers" aria-hidden="true">
      {imgs.map((s, i) => (
        <img
          key={i}
          src={s.src}
          alt=""
          draggable={false}
          style={{ left: s.x, top: s.y, width: s.w * k, transform: `rotate(${s.rot}deg)` }}
        />
      ))}
    </div>
  );
}

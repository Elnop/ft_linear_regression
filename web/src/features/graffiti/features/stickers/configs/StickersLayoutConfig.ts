import type { Cluster, Damage } from '@/features/graffiti/features/stickers/StickersTypes.ts';
import { car, descent, formula, logo42, norminette, piscine, react, typescript } from '@/features/graffiti/features/stickers/configs/ArtsConfig.ts';

export const CLUSTERS: Cluster[] = [
  {
    u: 0.03,
    v: 0.62,
    items: [
      { art: logo42, offsetX: 98, offsetY: 0, width: 56, rotation: 10, damage: { seed: 3, scrape: 0.63, peel: ['topRight', 0.3] } },
      { art: car, offsetX: 0, offsetY: 14, width: 80, rotation: -8, damage: { seed: 11, scrape: 0.6 } },
      { art: piscine, offsetX: 72, offsetY: 60, width: 96, rotation: 4, damage: { seed: 5, scrape: 0.63, tear: 0.68 } },
      { art: formula, offsetX: 6, offsetY: 108, width: 120, rotation: -3, damage: { seed: 9, scrape: 0.62, peel: ['bottomRight', 0.3] } },
    ],
  },
  {
    u: 0.74,
    v: 0.04,
    items: [
      { art: typescript, offsetX: 82, offsetY: 0, width: 52, rotation: 8, damage: { seed: 2, scrape: 0.65 } },
      { art: react, offsetX: 0, offsetY: 26, width: 72, rotation: -6, damage: { seed: 8, scrape: 0.63, peel: ['bottomLeft', 0.45] } },
      { art: descent, offsetX: 140, offsetY: 40, width: 82, rotation: -3, damage: { seed: 14, scrape: 0.61, tear: 0.72 } },
      { art: norminette, offsetX: 58, offsetY: 78, width: 92, rotation: 3, damage: { seed: 6, scrape: 0.6 } },
    ],
  },
];

export const STICKER_SCALE = { referenceWidth: 1440, minimum: 0.6, edgeMargin: 6 } as const;

const TITLE_DAMAGE: Damage = { seed: 21, scrape: 0.64, peel: ['bottomRight', 0.32] };

export const TITLE_STICKER = {
  art: logo42,
  damage: TITLE_DAMAGE,
  width: 50,
  rotation: 15,
  gapAfterTitle: 40,
  roomAfterTitle: 110,
  reservedRight: 420,
  minimumY: 20,
  chartTopRatio: 0.3,
} as const;

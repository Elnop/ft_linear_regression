import type { PlacedSticker } from '@/features/graffiti/features/stickers/StickersTypes.ts';
import { CLUSTERS, STICKER_SCALE, TITLE_STICKER } from '@/features/graffiti/features/stickers/configs/StickersLayoutConfig.ts';
import type { Scene } from '@/shared/types/SceneTypes.ts';

export function placeStickers({ width, wide, chart: { area }, title }: Scene): PlacedSticker[] {
  const titleRight = title.rectangle.x + title.rectangle.width;
  const scale = Math.min(1, Math.max(STICKER_SCALE.minimum, width / STICKER_SCALE.referenceWidth));
  const placed: PlacedSticker[] = [];
  for (const cluster of CLUSTERS) {
    const right = Math.max(...cluster.items.map((item) => (item.offsetX + item.width) * scale));
    const anchorX = Math.min(area.x + cluster.u * area.width, width - right - STICKER_SCALE.edgeMargin);
    const anchorY = area.y + cluster.v * area.height;
    for (const item of cluster.items)
      placed.push({ art: item.art, damage: item.damage, width: item.width * scale, x: anchorX + item.offsetX * scale, y: anchorY + item.offsetY * scale, rotation: item.rotation });
  }
  if (wide && titleRight + TITLE_STICKER.roomAfterTitle < width - TITLE_STICKER.reservedRight) {
    placed.push({
      art: TITLE_STICKER.art,
      damage: TITLE_STICKER.damage,
      width: TITLE_STICKER.width * scale,
      x: titleRight + TITLE_STICKER.gapAfterTitle,
      y: Math.max(TITLE_STICKER.minimumY, area.y * TITLE_STICKER.chartTopRatio),
      rotation: TITLE_STICKER.rotation,
    });
  }
  return placed;
}

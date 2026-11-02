import { sceneFor } from '@/shared/lib/sceneFor.ts';
import type { Regions } from '@/features/graffiti/shared/types/LayerTypes.ts';

export function wallRegions(width: number, height: number): Regions {
  const { chart, title } = sceneFor(width, height);
  return { chart: chart.area, title: title.rectangle };
}

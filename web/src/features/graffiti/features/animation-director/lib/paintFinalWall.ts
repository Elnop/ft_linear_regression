import type { OffscreenWall } from '@/features/graffiti/shared/lib/OffscreenWall.ts';
import { WallPainter } from '@/features/graffiti/features/animation-director/lib/WallPainter.ts';
import { paintTitle } from '@/features/graffiti/features/animation-director/lib/paintTitle.ts';
import type { FinalWall, FinalWallRecipe, Run } from '@/features/graffiti/features/animation-director/types/AnimationDirectorTypes.ts';

export async function paintFinalWall(wall: OffscreenWall, run: Run, { samples, plan, order, withTitle, dry }: FinalWallRecipe): Promise<FinalWall> {
  const painter = new WallPainter(wall, samples);
  await run.wait(painter.stampPoints(run, order, 0));
  const title = withTitle ? await run.wait(paintTitle(wall, run)) : null;
  await painter.sprayPasses(run, plan);
  await painter.redot(run, order);
  const layers = await run.wait(wall.finish({ dry }));
  return { layers, title, fanLayers: painter.fanLayers };
}

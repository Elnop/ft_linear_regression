import type { PaintLayer } from '@/features/graffiti/shared/lib/PaintLayer.ts';
import { stepFlow } from '@/features/graffiti/shared/lib/stepFlow.ts';
import { DRY_GLOSS, FLOW_STEP } from '@/features/graffiti/shared/configs/FlowConfig.ts';

export function flowLayer(layer: PaintLayer, deltaSeconds: number): void {
  const stepCount = Math.max(2, Math.ceil(deltaSeconds / FLOW_STEP));
  for (let step = 0; step < stepCount; step++) stepFlow(layer, deltaSeconds / stepCount);
  layer.gloss = Math.max(DRY_GLOSS, layer.gloss - deltaSeconds * 0.08);
}

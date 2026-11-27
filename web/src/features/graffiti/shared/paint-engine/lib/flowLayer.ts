import type { PaintLayer } from '@/features/graffiti/shared/paint-engine/lib/PaintLayer.ts';
import { stepFlow } from '@/features/graffiti/shared/paint-engine/lib/stepFlow.ts';
import {
  DRY_GLOSS,
  FLOW_STEP,
} from '@/features/graffiti/shared/paint-engine/configs/FlowConfig.ts';

export function flowLayer(layer: PaintLayer, deltaSeconds: number): void {
  const stepCount = Math.max(2, Math.ceil(deltaSeconds / FLOW_STEP));
  for (let step = 0; step < stepCount; step++) stepFlow(layer, deltaSeconds / stepCount);
  layer.gloss = Math.max(DRY_GLOSS, layer.gloss - deltaSeconds * 0.08);
}

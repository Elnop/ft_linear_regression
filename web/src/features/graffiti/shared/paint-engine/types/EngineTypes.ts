import type { PaintEngine } from '@/features/graffiti/shared/paint-engine/lib/PaintEngine.ts';

export type EngineState = { engine: PaintEngine | null; failed: boolean };

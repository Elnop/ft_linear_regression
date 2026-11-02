import type { PaintEngine } from '@/features/graffiti/shared/lib/PaintEngine.ts';

export type EngineState = { engine: PaintEngine | null; failed: boolean };

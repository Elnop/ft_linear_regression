import type { Sample } from '@core/types/CoreTypes.ts';

export type DatasetRow = Sample & { estimate: number | null };

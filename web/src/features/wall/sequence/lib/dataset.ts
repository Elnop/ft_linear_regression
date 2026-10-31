import raw from '@dataset?raw';
import { parseDataset } from '@core/csv.ts';
import type { Sample } from '@core/CoreTypes.ts';

export const DATA: Sample[] = parseDataset(raw);

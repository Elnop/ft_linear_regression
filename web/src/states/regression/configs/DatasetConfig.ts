import raw from '@dataset?raw';
import { parseDataset } from '@core/parseDataset.ts';
import type { Sample } from '@core/types/CoreTypes.ts';

export const DATA: Sample[] = parseDataset(raw);

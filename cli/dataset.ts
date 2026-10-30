import { readFileSync } from 'node:fs';
import { parseDataset } from '../core/csv.ts';
import type { Sample } from '../core/types.ts';
import { errorCode, fail } from './process.ts';

export function loadDataset(path: string): Sample[] {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    fail(`cannot read "${path}": ${errorCode(error)}`);
  }
  try {
    return parseDataset(text);
  } catch (error) {
    fail(`${path}: ${(error as Error).message}`);
  }
}

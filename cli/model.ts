import { readFileSync } from 'node:fs';
import { parseDataset } from '../core/csv.ts';
import type { Sample, Thetas } from '../core/types.ts';

// model.json lives at the project root, whatever the current directory is.
export const MODEL_PATH = new URL('../model.json', import.meta.url);

export function fail(message: string): never {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

export function isThetas(value: unknown): value is Thetas {
  if (typeof value !== 'object' || value === null) return false;
  const { theta0, theta1 } = value as Record<string, unknown>;
  return Number.isFinite(theta0) && Number.isFinite(theta1);
}

// Returns null when no training has been run yet; fails on an unreadable or corrupted file.
export function readModel(): Thetas | null {
  let text: string;
  try {
    text = readFileSync(MODEL_PATH, 'utf8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    fail(`cannot read model.json: ${(e as NodeJS.ErrnoException).code ?? (e as Error).message}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    fail('model.json is not valid JSON, run the training again');
  }
  if (!isThetas(parsed)) fail('model.json is corrupted, run the training again');
  return { theta0: parsed.theta0, theta1: parsed.theta1 };
}

export function loadDataset(path: string): Sample[] {
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (e) {
    fail(`cannot read "${path}": ${(e as NodeJS.ErrnoException).code ?? (e as Error).message}`);
  }
  try {
    return parseDataset(text);
  } catch (e) {
    fail(`${path}: ${(e as Error).message}`);
  }
}

import { readFileSync } from 'node:fs';
import { parseArgs, type ParseArgsOptionsConfig } from 'node:util';
import { parseDataset } from '../core/csv.ts';
import type { Sample, Thetas } from '../core/types.ts';

export const MODEL_PATH = new URL('../model.json', import.meta.url);

export function fail(message: string): never {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

export function errorCode(error: unknown): string {
  return (error as NodeJS.ErrnoException).code ?? (error as Error).message;
}

// Parses `[dataset.csv]` plus the given options, and handles --help and usage errors.
export function parseCli<Options extends ParseArgsOptionsConfig>(usage: string, options: Options) {
  let parsed;
  try {
    parsed = parseArgs({
      allowPositionals: true,
      options: { ...options, help: { type: 'boolean', short: 'h', default: false } },
    });
  } catch (error) {
    fail(`${(error as Error).message}\n\n${usage}`);
  }
  const { values, positionals } = parsed;
  if ((values as { help: boolean }).help) {
    console.log(usage);
    process.exit(0);
  }
  if (positionals.length > 1) fail(`expected at most one dataset file\n\n${usage}`);
  return { values, datasetPath: positionals[0] ?? 'data.csv' };
}

function isThetas(value: unknown): value is Thetas {
  if (typeof value !== 'object' || value === null) return false;
  const { theta0, theta1 } = value as Record<string, unknown>;
  return Number.isFinite(theta0) && Number.isFinite(theta1);
}

export function readModel(): Thetas | null {
  let text: string;
  try {
    text = readFileSync(MODEL_PATH, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    fail(`cannot read model.json: ${errorCode(error)}`);
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
  } catch (error) {
    fail(`cannot read "${path}": ${errorCode(error)}`);
  }
  try {
    return parseDataset(text);
  } catch (error) {
    fail(`${path}: ${(error as Error).message}`);
  }
}

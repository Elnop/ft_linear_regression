import { readFileSync, writeFileSync } from 'node:fs';
import { hasFiniteThetas } from '../core/thetas.ts';
import type { Thetas } from '../core/CoreTypes.ts';
import { errorCode, fail } from './process.ts';

const MODEL_PATH = new URL('../model.json', import.meta.url);

function isThetas(value: unknown): value is Thetas {
  if (typeof value !== 'object' || value === null) return false;
  const { theta0, theta1 } = value as Record<string, unknown>;
  return typeof theta0 === 'number' && typeof theta1 === 'number' && hasFiniteThetas({ theta0, theta1 });
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

export function writeModel(thetas: Thetas): void {
  try {
    writeFileSync(MODEL_PATH, JSON.stringify({ theta0: thetas.theta0, theta1: thetas.theta1 }, null, 2) + '\n');
  } catch (error) {
    fail(`cannot write model: ${errorCode(error)}`);
  }
}

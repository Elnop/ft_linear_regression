import { parseArgs, type ParseArgsOptionsConfig } from 'node:util';
import { fail } from './process.ts';

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

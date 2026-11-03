#!/usr/bin/env node
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { treeViolations } from './treeViolations.ts';

const { values, positionals } = parseArgs({ allowPositionals: true, options: { categories: { type: 'string' } } });
const categories = values.categories?.split(',').map((category) => category.trim());
const violations = treeViolations(resolve(positionals[0] ?? 'src'), categories);
for (const violation of violations) console.error(violation);
process.exitCode = violations.length === 0 ? 0 : 1;

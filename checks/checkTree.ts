import { resolve } from 'node:path';
import { treeViolations } from './tree/treeViolations.ts';

const violations = treeViolations(resolve(process.argv[2] ?? 'src'));
for (const violation of violations) console.error(violation);
process.exitCode = violations.length === 0 ? 0 : 1;

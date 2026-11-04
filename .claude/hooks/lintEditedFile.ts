import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const web = join(root, 'web');
function field(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined;
}

const input: unknown = JSON.parse(readFileSync(0, 'utf8'));
const filePath = field(field(input, 'tool_input'), 'file_path');
const file = typeof filePath === 'string' ? filePath : '';
const fromRoot = relative(root, file);
const inRepo = !fromRoot.startsWith('..') && !fromRoot.split('/').includes('node_modules');
const created = field(input, 'tool_name') === 'Write';
const problems: string[] = [];

function check(label: string, command: string, args: string[], cwd: string) {
  const result = spawnSync('npx', [command, ...args], { cwd, encoding: 'utf8' });
  if (result.status !== 0) problems.push(`${label}:\n${result.stdout}${result.stderr}`);
}

if (inRepo && /\.tsx?$/u.test(file)) {
  const cwd = fromRoot.startsWith('web/') ? web : root;
  check(`oxlint found problems in ${fromRoot}`, 'oxlint', ['--type-aware', relative(cwd, file)], cwd);
}
if (inRepo && (created || file.endsWith('.md'))) check('alint found problems in the repo layout or the docs', 'alint', ['check'], root);
if (inRepo && created && fromRoot.startsWith('web/src/')) check('check-tree found problems in web/src', 'check-tree', ['src'], web);

if (problems.length > 0) {
  process.stderr.write(`${problems.join('\n')}\nFix them before going on.\n`);
  process.exit(2);
}

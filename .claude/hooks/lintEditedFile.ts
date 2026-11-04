import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const web = join(root, 'web');
const { tool_input: toolInput } = JSON.parse(readFileSync(0, 'utf8')) as { tool_input?: { file_path?: string } };
const file = toolInput?.file_path ?? '';
const fromRoot = relative(root, file);
const linted = /\.tsx?$/.test(file) && !fromRoot.startsWith('..') && !fromRoot.split('/').includes('node_modules');

if (linted) {
  const cwd = fromRoot.startsWith('web/') ? web : root;
  const result = spawnSync('npx', ['oxlint', '--type-aware', relative(cwd, file)], { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(`oxlint found problems in ${fromRoot}, fix them before going on:\n${result.stdout}${result.stderr}`);
    process.exit(2);
  }
}

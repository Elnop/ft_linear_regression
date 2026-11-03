import { readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

const DEFAULT_CATEGORY_FOLDERS = ['components', 'orchestrators', 'presenters', 'hooks', 'styles', 'types', 'configs', 'stores', 'lib'];
const TEST_FILE = /\.test\.tsx?$/;

function folderViolations(folder: string, name: string, categoryFolders: ReadonlySet<string>): string[] {
  const entries = readdirSync(folder, { withFileTypes: true });
  const children = entries.filter((entry) => !TEST_FILE.test(entry.name));
  const stylesheets = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.css'));
  const hasStylesFolder = entries.some((entry) => entry.isDirectory() && entry.name === 'styles');
  const violations: string[] = [];
  if (children.length === 0) violations.push(`${name} is empty: delete it`);
  if (children.length === 1 && categoryFolders.has(basename(folder))) violations.push(`${name} holds a single child: move it up one level and delete the folder`);
  if (stylesheets.length > 0 && hasStylesFolder) violations.push(`${name} has a styles/ folder: move ${stylesheets.map((entry) => entry.name).join(', ')} into it`);
  if (stylesheets.length > 1 && basename(folder) !== 'styles') violations.push(`${name} holds ${stylesheets.length} stylesheets: move them into a styles/ folder`);
  return violations;
}

export function treeViolations(root: string, categoryFolders: readonly string[] = DEFAULT_CATEGORY_FOLDERS): string[] {
  const categories = new Set(categoryFolders);
  const walk = (folder: string): string[] => [
    ...folderViolations(folder, relative(join(root, '..'), folder), categories),
    ...readdirSync(folder, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) => walk(join(folder, entry.name))),
  ];
  return walk(root);
}

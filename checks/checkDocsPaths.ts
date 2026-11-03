import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const BASES = ['', 'web/', 'web/src/', 'web/src/features/'];
const ROOT_FOLDERS = /^(\.github|app|checks|cli|core|docs|features|shared|states|web)\//;
// git lists the documents, so whatever .gitignore leaves out is never checked. -z keeps accented names unquoted.
const DOCUMENTS = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', 'README.md', 'docs'], { cwd: ROOT, encoding: 'utf8' })
  .split('\0')
  .filter((name) => name.endsWith('.md') && existsSync(new URL(name, ROOT)));

function citedPaths(markdown: string): string[] {
  const prose = markdown.replace(/^```[\s\S]*?^```/gm, '');
  const quoted = [...prose.matchAll(/`([^`\s]+)`/g)].flatMap((match) => match[1] ?? []);
  return quoted.filter((text) => text.includes('/') && !/[<>*?@:=(){}]/.test(text) && (/\.[a-z]+$/.test(text) || ROOT_FOLDERS.test(text)));
}

function linkedPaths(markdown: string, document: string): URL[] {
  const folder = new URL(document.replace(/[^/]+$/, ''), ROOT);
  return [...markdown.matchAll(/\]\(([^)#\s]+)\)/g)]
    .flatMap((match) => match[1] ?? [])
    .filter((target) => !/^[a-z]+:/.test(target))
    .map((target) => new URL(target, folder));
}

const exists = (path: string) => BASES.some((base) => existsSync(new URL(base + path, ROOT)));

const violations = DOCUMENTS.flatMap((document) => {
  const markdown = readFileSync(new URL(document, ROOT), 'utf8');
  const missing = [
    ...citedPaths(markdown).filter((path) => !exists(path)),
    ...linkedPaths(markdown, document)
      .filter((url) => !existsSync(url))
      .map((url) => url.pathname),
  ];
  return missing.map((path) => `${document}: ${path} does not exist`);
});

if (violations.length > 0) {
  console.error(violations.join('\n'));
  process.exit(1);
}

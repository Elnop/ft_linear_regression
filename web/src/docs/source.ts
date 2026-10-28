// Cuts functions out of the real core/ sources (imported with ?raw), so the
// documentation always shows the code that actually runs.

// The exported function `name` with the comment lines right above it.
export function pick(source: string, name: string): string {
  const lines = source.split('\n');
  const start = lines.findIndex((l) => new RegExp(`^export function\\*? ${name}\\b`).test(l));
  if (start < 0) throw new Error(`function ${name} not found`);
  let first = start;
  while (first > 0 && lines[first - 1].startsWith('//')) first--;
  const end = lines.findIndex((l, i) => i > start && l === '}');
  return lines.slice(first, end + 1).join('\n');
}

export type Token = { kind: 'comment' | 'string' | 'number' | 'keyword' | 'type' | 'call' | 'text'; text: string };

const KEYWORDS = new Set([
  'export', 'function', 'const', 'let', 'return', 'for', 'of', 'if', 'throw', 'new', 'yield',
  'type', 'import', 'from', 'continue', 'true', 'false',
]);

const TOKEN = /(\/\/[^\n]*)|('[^']*'|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

// Minimal TypeScript highlighting: enough for the few snippets shown.
export function tokenize(code: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    if (m.index > last) out.push({ kind: 'text', text: code.slice(last, m.index) });
    const [text, comment, string, number, word] = m;
    if (comment) out.push({ kind: 'comment', text });
    else if (string) out.push({ kind: 'string', text });
    else if (number) out.push({ kind: 'number', text });
    else if (KEYWORDS.has(word)) out.push({ kind: 'keyword', text });
    else if (/^[A-Z]/.test(word)) out.push({ kind: 'type', text });
    else if (code[m.index + text.length] === '(') out.push({ kind: 'call', text });
    else out.push({ kind: 'text', text });
    last = m.index + text.length;
  }
  if (last < code.length) out.push({ kind: 'text', text: code.slice(last) });
  return out;
}

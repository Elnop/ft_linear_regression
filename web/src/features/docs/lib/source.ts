export function pick(source: string, name: string): string {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => new RegExp(`^export function\\*? ${name}\\b`).test(line));
  if (start < 0) throw new Error(`function ${name} not found`);
  const end = lines.findIndex((line, i) => i > start && line === '}');
  return lines.slice(start, end + 1).join('\n');
}

export type Token = { kind: 'string' | 'number' | 'keyword' | 'type' | 'call' | 'text'; text: string };

const KEYWORDS = new Set([
  'export', 'function', 'const', 'let', 'return', 'for', 'of', 'if', 'throw', 'new', 'yield',
  'type', 'import', 'from', 'continue', 'true', 'false',
]);

const TOKEN = /('[^']*'|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    if (match.index > last) tokens.push({ kind: 'text', text: code.slice(last, match.index) });
    const [text, string, number, word] = match;
    if (string) tokens.push({ kind: 'string', text });
    else if (number) tokens.push({ kind: 'number', text });
    else if (KEYWORDS.has(word)) tokens.push({ kind: 'keyword', text });
    else if (/^[A-Z]/.test(word)) tokens.push({ kind: 'type', text });
    else if (code[match.index + text.length] === '(') tokens.push({ kind: 'call', text });
    else tokens.push({ kind: 'text', text });
    last = match.index + text.length;
  }
  if (last < code.length) tokens.push({ kind: 'text', text: code.slice(last) });
  return tokens;
}

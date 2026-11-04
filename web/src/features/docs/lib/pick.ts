export function pick(source: string, name: string): string {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => new RegExp(`^(export )?function\\*? ${name}\\b`, 'u').test(line));
  if (start < 0) throw new Error(`function ${name} not found`);
  const end = lines.findIndex((line, i) => i > start && line === '}');
  if (end < 0) throw new Error(`function ${name} has no closing brace`);
  return lines.slice(start, end + 1).join('\n');
}

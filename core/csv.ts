import type { Sample } from './types.ts';

function parseField(field: string, name: string, line: number): number {
  const trimmed = field.trim();
  const value = Number(trimmed);
  if (trimmed === '' || !Number.isFinite(value)) {
    throw new Error(`line ${line}: invalid ${name} "${trimmed}"`);
  }
  return value;
}

export function parseDataset(text: string): Sample[] {
  const lines = text.split(/\r?\n/);
  const header = lines[0]?.trim().toLowerCase();
  if (header !== 'km,price') {
    throw new Error(`line 1: expected header "km,price", got "${lines[0] ?? ''}"`);
  }

  const data: Sample[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue;
    const fields = line.split(',');
    if (fields.length !== 2) {
      throw new Error(`line ${i + 1}: expected 2 fields, got ${fields.length}`);
    }
    const km = parseField(fields[0], 'km', i + 1);
    const price = parseField(fields[1], 'price', i + 1);
    if (km < 0) throw new Error(`line ${i + 1}: km must not be negative`);
    data.push({ km, price });
  }

  if (data.length === 0) throw new Error('dataset is empty');
  return data;
}

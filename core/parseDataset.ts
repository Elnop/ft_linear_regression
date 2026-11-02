import type { Sample } from './types/CoreTypes.ts';

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
  for (const [index, raw] of lines.entries()) {
    const line = raw.trim();
    if (index === 0 || line === '') continue;
    const number = index + 1;
    const fields = line.split(',');
    const [kmField, priceField] = fields;
    if (fields.length !== 2 || kmField === undefined || priceField === undefined) {
      throw new Error(`line ${number}: expected 2 fields, got ${fields.length}`);
    }
    const km = parseField(kmField, 'km', number);
    const price = parseField(priceField, 'price', number);
    if (km < 0) throw new Error(`line ${number}: km must not be negative`);
    data.push({ km, price });
  }

  if (data.length === 0) throw new Error('dataset is empty');
  return data;
}

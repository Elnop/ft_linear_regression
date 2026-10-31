export function parseMileage(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const mileage = Number(trimmed);
  return Number.isFinite(mileage) ? mileage : null;
}

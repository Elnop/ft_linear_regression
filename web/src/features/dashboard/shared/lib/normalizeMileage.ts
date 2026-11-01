export function normalizeMileage(text: string): string {
  return text.replace(/\s/g, '').replace(',', '.');
}

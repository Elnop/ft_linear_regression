export function normalizeMileage(text: string): string {
  return text.replaceAll(/\s/gu, '').replace(',', '.');
}

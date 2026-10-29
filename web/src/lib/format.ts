const NNBSP = ' ';
const MINUS = '−';

export function formatNumber(n: number | null | undefined, decimals = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  if (!Number.isFinite(n)) return n > 0 ? '∞' : `${MINUS}∞`;
  const [int, frac] = Math.abs(n).toFixed(decimals).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
  const sign = n < 0 && Number(Math.abs(n).toFixed(decimals)) !== 0 ? MINUS : '';
  return sign + grouped + (frac ? `.${frac}` : '');
}

export const isDisplayablePrice = (price: number) => Number.isFinite(price) && Math.abs(price) < 1e7;

export function parseKm(text: string): number | null {
  const t = text.trim();
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
}

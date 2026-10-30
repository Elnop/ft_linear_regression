const NARROW_NO_BREAK_SPACE = ' ';
const MINUS = '−';
const COMPACT_FROM = 1e9;

export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (!Number.isFinite(value)) return value > 0 ? '∞' : `${MINUS}∞`;
  if (Math.abs(value) >= COMPACT_FROM) {
    const [mantissa, exponent] = Math.abs(value).toExponential(1).split('e+');
    return `${value < 0 ? MINUS : ''}${mantissa}e${exponent}`;
  }
  const [integerPart, fractionPart] = Math.abs(value).toFixed(decimals).split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NO_BREAK_SPACE);
  const sign = value < 0 && Number(Math.abs(value).toFixed(decimals)) !== 0 ? MINUS : '';
  return sign + grouped + (fractionPart ? `.${fractionPart}` : '');
}

export const isDisplayablePrice = (price: number) => Number.isFinite(price) && Math.abs(price) < 1e7;

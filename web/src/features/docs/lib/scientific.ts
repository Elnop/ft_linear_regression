const SUPERSCRIPTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

export function scientific(value: number): string {
  const [mantissa = '', exponent = '0'] = value.toExponential(1).split('e');
  const digits = String(Math.abs(Number(exponent))).replace(/\d/g, (digit) => SUPERSCRIPTS[Number(digit)] ?? digit);
  return `${mantissa.replace('.', ',')} × 10${Number(exponent) < 0 ? '⁻' : ''}${digits}`;
}

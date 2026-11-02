export function readRem(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

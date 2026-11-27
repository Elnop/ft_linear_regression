export function readRem(): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
}

import { useEffect, useState } from 'react';
import { chartMapping, type ChartMapping } from '../paint/index.ts';

// From this width on, the panels sit in a column right of the chart;
// below it they scroll under the chart, over the fixed wall.
export const WIDE = 1024;
export const ASIDE_W = 340;

export const pagePad = (width: number) => Math.min(44, Math.max(16, width * 0.03));

// Chart placement that leaves room for the UI. Use it instead of
// chartMapping(width, height) so the paint and the axes line up.
export function chartFor(width: number, height: number): ChartMapping {
  if (width < WIDE) return chartMapping(width, height);
  return chartMapping(width - ASIDE_W - pagePad(width) - 12, height);
}

// Size of the full-screen wall (the paint canvas covers the viewport).
export function useWallSize(): { width: number; height: number } {
  const read = () => ({ width: window.innerWidth, height: window.innerHeight });
  const [size, setSize] = useState(read);
  useEffect(() => {
    const on = () => setSize(read());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return size;
}

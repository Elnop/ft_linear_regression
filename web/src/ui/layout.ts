import { useEffect, useState } from 'react';
import { chartMapping, type ChartMapping } from '../paint/index.ts';

export const WIDE = 1024;
export const ASIDE_W = 340;

export const pagePad = (width: number) => Math.min(44, Math.max(16, width * 0.03));

export function chartFor(width: number, height: number): ChartMapping {
  if (width < WIDE) return chartMapping(width, height);
  return chartMapping(width - ASIDE_W - pagePad(width) - 12, height);
}

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

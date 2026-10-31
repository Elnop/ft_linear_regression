import { useMemo } from 'react';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { chartFor } from '@/shared/lib/layout.ts';
import type { ChartMapping } from '@/shared/types/ChartTypes.ts';

type Viewport = { width: number; height: number };

const read = (): Viewport => ({ width: window.innerWidth, height: window.innerHeight });

const viewportStore = createStore<Viewport>()(read);
window.addEventListener('resize', () => viewportStore.setState(read()));

export const useViewport = (): Viewport => useStore(viewportStore, (state) => state);

export function useChart(): ChartMapping {
  const { width, height } = useViewport();
  return useMemo(() => chartFor(width, height), [width, height]);
}

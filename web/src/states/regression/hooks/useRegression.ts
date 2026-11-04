import { useStore } from 'zustand';
import { regressionStore } from '@/states/regression/stores/regressionStore.ts';
import type { RegressionState } from '@/states/regression/RegressionTypes.ts';

export function useRegression<T>(selector: (state: RegressionState) => T): T {
  return useStore(regressionStore, selector);
}

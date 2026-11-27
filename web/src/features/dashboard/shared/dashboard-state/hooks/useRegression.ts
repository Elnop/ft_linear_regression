import { useStore } from 'zustand';
import { regressionStore } from '@/shared/regression/regressionStore.ts';
import type { RegressionState } from '@/shared/regression/RegressionTypes.ts';

export function useRegression<T>(selector: (state: RegressionState) => T): T {
  return useStore(regressionStore, selector);
}

import { useStore } from 'zustand';
import { regressionStore } from '@/shared-features/regression/stores/regressionStore.ts';
import type { RegressionState } from '@/shared-features/regression/RegressionTypes.ts';

export function useRegression<T>(selector: (state: RegressionState) => T): T {
  return useStore(regressionStore, selector);
}

import { useStore } from 'zustand';
import { viewStore } from '@/features/dashboard/shared/dashboard-state/stores/viewStore.ts';
import { shownView } from '@/features/dashboard/shared/dashboard-state/lib/shownView.ts';
import type { View } from '@/features/dashboard/shared/dashboard-state/DashboardTypes.ts';
import { useAnimationPlayback } from '@/features/dashboard/shared/dashboard-state/hooks/useAnimationPlayback.ts';

export function useView(): View {
  const chosen = useStore(viewStore, (state) => state.view);
  const painted = useAnimationPlayback((state) => state.painted);
  return shownView(chosen, painted);
}

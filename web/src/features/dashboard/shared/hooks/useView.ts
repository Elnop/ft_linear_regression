import { useStore } from 'zustand';
import { viewStore } from '@/features/dashboard/shared/stores/viewStore.ts';
import { shownView } from '@/features/dashboard/shared/lib/shownView.ts';
import type { View } from '@/features/dashboard/shared/DashboardTypes.ts';
import { useAnimationPlayback } from '@/states/animation-playback/useAnimationPlayback.ts';

export function useView(): View {
  const chosen = useStore(viewStore, (state) => state.view);
  const painted = useAnimationPlayback((state) => state.painted);
  return shownView(chosen, painted);
}

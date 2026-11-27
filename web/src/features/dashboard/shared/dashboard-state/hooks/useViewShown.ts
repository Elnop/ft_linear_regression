import type { View } from '@/features/dashboard/shared/dashboard-state/DashboardTypes.ts';
import { useView } from '@/features/dashboard/shared/dashboard-state/hooks/useView.ts';
import { selectInterfaceVisible } from '@/features/dashboard/shared/dashboard-state/lib/animationPlaybackSelectors.ts';
import { useAnimationPlayback } from '@/features/dashboard/shared/dashboard-state/hooks/useAnimationPlayback.ts';

export function useViewShown(view: View): boolean {
  const current = useView();
  const interfaceVisible = useAnimationPlayback(selectInterfaceVisible);
  return interfaceVisible && current === view;
}

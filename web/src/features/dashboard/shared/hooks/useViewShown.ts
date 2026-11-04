import type { View } from '@/features/dashboard/shared/DashboardTypes.ts';
import { useView } from '@/features/dashboard/shared/hooks/useView.ts';
import { selectInterfaceVisible } from '@/features/dashboard/shared/lib/animationPlaybackSelectors.ts';
import { useAnimationPlayback } from '@/shared-features/animation-playback/useAnimationPlayback.ts';

export function useViewShown(view: View): boolean {
  const current = useView();
  const interfaceVisible = useAnimationPlayback(selectInterfaceVisible);
  return interfaceVisible && current === view;
}

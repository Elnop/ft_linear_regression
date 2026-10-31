import type { Overlay } from '@/features/dashboard/shared/types/DashboardTypes.ts';
import { useOverlay } from '@/features/dashboard/shared/stores/overlayStore.ts';
import { selectInterfaceVisible } from '@/features/dashboard/shared/lib/animationPlaybackSelectors.ts';
import { useAnimationPlayback } from '@/states/animation-playback/hooks/useAnimationPlayback.ts';

export function useOverlayShown(overlay: Overlay): boolean {
  const current = useOverlay();
  const interfaceVisible = useAnimationPlayback(selectInterfaceVisible);
  return interfaceVisible && current === overlay;
}

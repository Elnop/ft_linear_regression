import type { Overlay } from '@/features/dashboard/shared/DashboardTypes.ts';
import { usePlayground } from '@/features/dashboard/shared/stores/playgroundStore.ts';
import { selectInterfaceVisible } from '@/features/wall/sequence/lib/selectors.ts';
import { useSequence } from '@/features/wall/sequence/stores/sequenceStore.ts';

export function useOverlayShown(overlay: Overlay): boolean {
  const current = usePlayground((state) => state.overlay);
  const interfaceVisible = useSequence(selectInterfaceVisible);
  return interfaceVisible && current === overlay;
}

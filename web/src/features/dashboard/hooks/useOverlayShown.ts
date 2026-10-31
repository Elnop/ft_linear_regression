import type { Overlay } from '@/features/dashboard/chart/lib/overlay.ts';
import { usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { selectInterfaceVisible } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';

export function useOverlayShown(overlay: Overlay): boolean {
  const current = usePlayground((state) => state.overlay);
  const interfaceVisible = useSequence(selectInterfaceVisible);
  return interfaceVisible && current === overlay;
}

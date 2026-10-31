import type { Overlay } from '@/features/dashboard/shared/types/DashboardTypes.ts';
import { usePlayground } from '@/features/dashboard/shared/stores/playgroundStore.ts';
import { selectInterfaceVisible } from '@/features/dashboard/shared/lib/sequenceSelectors.ts';
import { useSequencePort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';

export function useOverlayShown(overlay: Overlay): boolean {
  const current = usePlayground((state) => state.overlay);
  const interfaceVisible = useSequencePort(selectInterfaceVisible);
  return interfaceVisible && current === overlay;
}

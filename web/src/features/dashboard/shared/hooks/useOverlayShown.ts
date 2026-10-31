import type { Overlay } from '@/features/dashboard/shared/types/DashboardTypes.ts';
import { useOverlay } from '@/features/dashboard/shared/stores/overlayStore.ts';
import { selectInterfaceVisible } from '@/features/dashboard/shared/lib/sequenceSelectors.ts';
import { useSequencePort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';

export function useOverlayShown(overlay: Overlay): boolean {
  const current = useOverlay();
  const interfaceVisible = useSequencePort(selectInterfaceVisible);
  return interfaceVisible && current === overlay;
}

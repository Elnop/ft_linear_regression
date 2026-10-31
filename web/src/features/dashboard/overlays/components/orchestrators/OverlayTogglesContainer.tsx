import { OverlayToggles } from '@/features/dashboard/overlays/components/presenters/OverlayToggles.tsx';
import { toggleOverlay, usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';

export function OverlayTogglesContainer() {
  const overlay = usePlayground((state) => state.overlay);
  return <OverlayToggles overlay={overlay} onToggle={toggleOverlay} />;
}

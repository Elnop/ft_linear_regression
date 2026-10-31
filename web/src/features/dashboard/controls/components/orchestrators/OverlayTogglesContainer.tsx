import { OverlayToggles } from '@/features/dashboard/controls/components/presenters/OverlayToggles.tsx';
import { toggleOverlay, usePlayground } from '@/features/dashboard/shared/stores/playgroundStore.ts';

export function OverlayTogglesContainer() {
  const overlay = usePlayground((state) => state.overlay);
  return <OverlayToggles overlay={overlay} onToggle={toggleOverlay} />;
}

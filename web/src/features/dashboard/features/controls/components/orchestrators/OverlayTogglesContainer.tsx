import { OverlayToggles } from '@/features/dashboard/features/controls/components/presenters/OverlayToggles.tsx';
import { toggleOverlay, useOverlay } from '@/features/dashboard/shared/stores/overlayStore.ts';

export function OverlayTogglesContainer() {
  const overlay = useOverlay();
  return <OverlayToggles overlay={overlay} onToggle={toggleOverlay} />;
}

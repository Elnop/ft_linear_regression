import { ViewToggles } from '@/features/dashboard/features/views/components/presenters/ViewToggles.tsx';
import { toggleView, useView } from '@/features/dashboard/shared/stores/viewStore.ts';

export function ViewTogglesContainer() {
  const view = useView();
  return <ViewToggles view={view} onToggle={toggleView} />;
}

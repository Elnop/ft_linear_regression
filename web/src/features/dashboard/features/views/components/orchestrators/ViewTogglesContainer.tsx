import { ViewToggles } from '@/features/dashboard/features/views/components/presenters/ViewToggles.tsx';
import { viewActions } from '@/features/dashboard/shared/stores/viewStore.ts';
import { useView } from '@/features/dashboard/shared/hooks/useView.ts';

export function ViewTogglesContainer() {
  const view = useView();
  return <ViewToggles view={view} onToggle={viewActions.toggle} />;
}

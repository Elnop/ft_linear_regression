import type { View } from '@/features/dashboard/shared/DashboardTypes.ts';

export function shownView(chosen: View, painted: boolean): View {
  return !painted && chosen === 'wall' ? 'chart' : chosen;
}

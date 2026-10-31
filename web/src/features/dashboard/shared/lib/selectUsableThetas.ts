import { hasFiniteThetas } from '@core/hasFiniteThetas.ts';
import type { ModelView } from '@/features/dashboard/shared/types/PortsTypes.ts';

export const selectUsableThetas = (state: ModelView) =>
  state.thetas && !state.diverged && hasFiniteThetas(state.thetas) ? state.thetas : null;

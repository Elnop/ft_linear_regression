import type { View } from '@/features/dashboard/shared/DashboardTypes.ts';
import '@/features/dashboard/features/views/styles/view-toggles.css';

type ViewTogglesProps = {
  view: View;
  onToggle: (view: View) => void;
};

const TOGGLES = [
  { view: 'chart', label: 'GRAPHE', title: 'Afficher le graphe en version lisible', icon: 'M4 4v16h16M8 15l4-4 3 3 5-6' },
  { view: 'dataset', label: 'DATA', title: 'Afficher le dataset', icon: 'M4 5h16M4 12h16M4 19h16M10 5v14' },
] as const;

export function ViewToggles({ view, onToggle }: ViewTogglesProps) {
  return TOGGLES.map((toggle) => (
    <button
      key={toggle.view}
      type="button"
      className="view-toggle glass dashboard-hit"
      aria-pressed={view === toggle.view}
      onClick={() => onToggle(toggle.view)}
      title={toggle.title}
    >
      {toggle.label}
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={toggle.icon} />
      </svg>
    </button>
  ));
}

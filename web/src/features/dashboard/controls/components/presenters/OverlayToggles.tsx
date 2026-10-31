import type { Overlay } from '@/features/dashboard/shared/DashboardTypes.ts';
import '@/features/dashboard/controls/controls.css';

type OverlayTogglesProps = {
  overlay: Overlay;
  onToggle: (overlay: Overlay) => void;
};

const TOGGLES = [
  { overlay: 'chart', label: 'GRAPHE', title: 'Afficher le graphe en version lisible', icon: 'M4 4v16h16M8 15l4-4 3 3 5-6' },
  { overlay: 'dataset', label: 'DATA', title: 'Afficher le dataset', icon: 'M4 5h16M4 12h16M4 19h16M10 5v14' },
] as const;

export function OverlayToggles({ overlay, onToggle }: OverlayTogglesProps) {
  return TOGGLES.map((toggle) => (
    <button
      key={toggle.overlay}
      type="button"
      className="overlay-toggle glass dashboard-hit"
      aria-pressed={overlay === toggle.overlay}
      onClick={() => onToggle(toggle.overlay)}
      title={toggle.title}
    >
      {toggle.label}
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={toggle.icon} />
      </svg>
    </button>
  ));
}

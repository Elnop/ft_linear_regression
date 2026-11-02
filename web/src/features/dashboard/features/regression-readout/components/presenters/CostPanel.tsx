import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import type { CostPoint } from '@core/types/CoreTypes.ts';
import '@/features/dashboard/shared/shared.css';
import '@/features/dashboard/features/regression-readout/regression-readout.css';

type CostPanelProps = {
  history: CostPoint[];
  diverged: boolean;
};

const WIDTH = 280;
const HEIGHT = 76;
const PADDING = 6;

function sparkline(history: CostPoint[]): string {
  const points = history
    .filter((point) => Number.isFinite(point.cost) && point.cost > 0)
    .map((point) => ({ logIteration: Math.log1p(point.iteration), logCost: Math.log10(point.cost) }));
  const last = points.at(-1);
  if (!last) return '';
  const logCosts = points.map((point) => point.logCost);
  const lowest = Math.min(...logCosts);
  const highest = Math.max(...logCosts);
  const span = highest - lowest || 1;
  return points
    .map(({ logIteration, logCost }) => {
      const x = last.logIteration === 0 ? WIDTH / 2 : (logIteration / last.logIteration) * WIDTH;
      const y = PADDING + (1 - (logCost - lowest) / span) * (HEIGHT - 2 * PADDING);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function CostPanel({ history, diverged }: CostPanelProps) {
  const last = history[history.length - 1];
  const points = sparkline(history);
  const color = diverged ? 'var(--danger)' : 'var(--cyan)';
  const lastIteration = last?.iteration ?? 0;
  return (
    <figure className="dashboard-panel glass dashboard-hit">
      <div className="tape cost-tape" aria-hidden="true" />
      <figcaption className="cost-header">
        <span className="label">Coût J(θ) · log-log</span>
        <span className="cost-value" style={{ color }}>
          {last ? formatNumber(last.cost) : '—'}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Évolution du coût sur ${lastIteration} itérations`} className="cost-chart">
        <line className="cost-baseline" x1="0" y1={HEIGHT} x2={WIDTH} y2={HEIGHT} strokeWidth="1" strokeDasharray="3 5" />
        {points && (
          <>
            <polyline points={points} fill="none" stroke={color} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" className="cost-glow" />
            <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
      </svg>
      <div className="cost-footer">
        <span>0</span>
        <span>{formatNumber(lastIteration)} itérations</span>
      </div>
    </figure>
  );
}

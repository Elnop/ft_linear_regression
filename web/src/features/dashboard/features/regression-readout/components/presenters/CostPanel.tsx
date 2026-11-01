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
  const positivePoints = history.filter((point) => Number.isFinite(point.cost) && point.cost > 0);
  if (positivePoints.length === 0) return '';
  const logCosts = positivePoints.map((point) => Math.log10(point.cost));
  const lowest = Math.min(...logCosts);
  const highest = Math.max(...logCosts);
  const span = highest - lowest || 1;
  const logLastIteration = Math.log1p(positivePoints[positivePoints.length - 1].iteration);
  return logCosts
    .map((logCost, i) => {
      const x = logLastIteration === 0 ? WIDTH / 2 : (Math.log1p(positivePoints[i].iteration) / logLastIteration) * WIDTH;
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
    <figure className="panel glass dashboard-hit">
      <div className="tape cost-tape" aria-hidden="true" />
      <figcaption className="cost-header">
        <span className="label">Coût J(θ) · log-log</span>
        <span className="cost-value" style={{ color }}>
          {last ? formatNumber(last.cost) : '—'}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Évolution du coût sur ${lastIteration} itérations`} className="cost-chart">
        <line x1="0" y1={HEIGHT} x2={WIDTH} y2={HEIGHT} stroke="rgba(239,236,230,0.2)" strokeWidth="1" strokeDasharray="3 5" />
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

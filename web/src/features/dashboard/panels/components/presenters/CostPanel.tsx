import { formatNumber } from '@/lib/format.ts';
import type { CostPoint } from '@/features/sequence/types.ts';
import '@/features/dashboard/panels/panels.css';

export type CostPanelProps = {
  history: CostPoint[];
  diverged?: boolean;
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
  const count = positivePoints.length;
  return logCosts
    .map((logCost, i) => {
      const x = count === 1 ? WIDTH / 2 : (i / (count - 1)) * WIDTH;
      const y = PADDING + (1 - (logCost - lowest) / span) * (HEIGHT - 2 * PADDING);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function CostPanel({ history, diverged = false }: CostPanelProps) {
  const last = history[history.length - 1];
  const points = sparkline(history);
  const color = diverged ? 'var(--danger)' : 'var(--cyan)';
  const lastIteration = last?.iteration ?? 0;
  return (
    <figure className="panel glass wall-hit" style={{ margin: 0 }}>
      <div className="tape" aria-hidden="true" style={{ right: 30, top: -10, width: 70, height: 20, transform: 'rotate(5deg)' }} />
      <figcaption className="cost-header">
        <span className="label">Coût J(θ) · log</span>
        <span className="cost-value" style={{ color }}>
          {last ? formatNumber(last.cost) : '—'}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Évolution du coût sur ${lastIteration} passages`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <line x1="0" y1={HEIGHT} x2={WIDTH} y2={HEIGHT} stroke="rgba(239,236,230,0.2)" strokeWidth="1" strokeDasharray="3 5" />
        {points && (
          <>
            <polyline points={points} fill="none" stroke={color} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" opacity="0.18" style={{ filter: 'blur(4px)' }} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
      </svg>
      <div className="cost-footer">
        <span>0</span>
        <span>{formatNumber(lastIteration)} passages</span>
      </div>
    </figure>
  );
}

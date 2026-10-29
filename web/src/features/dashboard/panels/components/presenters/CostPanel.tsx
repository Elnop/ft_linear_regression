import { formatNumber } from '@/lib/format.ts';
import type { CostPoint } from '@/features/sequence/types.ts';
import '@/features/dashboard/panels/panels.css';

export type CostPanelProps = {
  history: CostPoint[];
  diverged?: boolean;
};

const W = 280;
const H = 76;
const PAD = 6;

function sparkline(history: CostPoint[]): string {
  const pts = history.filter((p) => Number.isFinite(p.cost) && p.cost > 0);
  if (pts.length === 0) return '';
  const logs = pts.map((p) => Math.log10(p.cost));
  const lo = Math.min(...logs);
  const hi = Math.max(...logs);
  const span = hi - lo || 1;
  const n = pts.length;
  return logs
    .map((l, i) => {
      const x = n === 1 ? W / 2 : (i / (n - 1)) * W;
      const y = PAD + (1 - (l - lo) / span) * (H - 2 * PAD);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function CostPanel({ history, diverged = false }: CostPanelProps) {
  const last = history[history.length - 1];
  const points = sparkline(history);
  const color = diverged ? 'var(--danger)' : 'var(--cyan)';
  const lastIter = last?.iter ?? 0;
  return (
    <figure className="panel glass wu-hit" style={{ margin: 0 }}>
      <div className="tape" aria-hidden="true" style={{ right: 30, top: -10, width: 70, height: 20, transform: 'rotate(5deg)' }} />
      <figcaption className="cost-head">
        <span className="label">Coût J(θ) · log</span>
        <span className="cost-value" style={{ color }}>
          {last ? formatNumber(last.cost) : '—'}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Évolution du coût sur ${lastIter} passages`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <line x1="0" y1={H} x2={W} y2={H} stroke="rgba(239,236,230,0.2)" strokeWidth="1" strokeDasharray="3 5" />
        {points && (
          <>
            <polyline points={points} fill="none" stroke={color} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" opacity="0.18" style={{ filter: 'blur(4px)' }} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
      </svg>
      <div className="cost-foot">
        <span>0</span>
        <span>{formatNumber(lastIter)} passages</span>
      </div>
    </figure>
  );
}

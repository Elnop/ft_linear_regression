import { formatNumber } from '@/lib/format.ts';
import '@/features/dashboard/panels/panels.css';

export type PrecisionPanelProps = {
  r2: number | null;
  rmse: number | null;
  mae: number | null;
};

export function PrecisionPanel({ r2, rmse, mae }: PrecisionPanelProps) {
  return (
    <dl className="panel glass metrics wall-hit" aria-label="Précision" style={{ margin: 0 }}>
      <Metric label="R²" value={formatNumber(r2, 3)} color="var(--magenta)" />
      <Metric label="RMSE" value={formatNumber(rmse)} />
      <Metric label="MAE" value={formatNumber(mae)} />
    </dl>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="metric">
      <dt className="label">{label}</dt>
      <dd style={{ color, fontSize: value.length > 5 ? 19 : undefined }}>{value}</dd>
    </div>
  );
}

import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import '@/features/dashboard/panels/panels.css';

type PrecisionPanelProps = {
  r2: number | null;
  rmse: number | null;
  mae: number | null;
};

export function PrecisionPanel({ r2, rmse, mae }: PrecisionPanelProps) {
  return (
    <dl className="panel glass metrics dashboard-hit" aria-label="Précision">
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

import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import '@/features/dashboard/shared/shared.css';
import '@/features/dashboard/features/regression-readout/regression-readout.css';

type PrecisionPanelProps = {
  r2: number | null;
  rmse: number | null;
  mae: number | null;
};

export function PrecisionPanel({ r2, rmse, mae }: PrecisionPanelProps) {
  return (
    <section className="dashboard-panel glass dashboard-hit" aria-label="Précision">
      <dl className="readout-metrics">
        <Metric label="R²" value={formatNumber(r2, 3)} color="var(--magenta)" />
        <Metric label="RMSE" value={formatNumber(rmse)} />
        <Metric label="MAE" value={formatNumber(mae)} />
      </dl>
    </section>
  );
}

type MetricProps = { label: string; value: string; color?: string };

function Metric({ label, value, color }: MetricProps) {
  return (
    <div className="readout-metric">
      <dt className="label">{label}</dt>
      <dd className={value.length > 5 ? 'readout-metric-long' : undefined} style={{ color }}>
        {value}
      </dd>
    </div>
  );
}

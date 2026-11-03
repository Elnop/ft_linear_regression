import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import '@/features/dashboard/features/regression-readout/regression-readout.css';

type HeaderChipsProps = {
  theta0: number | null;
  theta1: number | null;
  progress: { label: string; value: string };
};

export function HeaderChips({ theta0, theta1, progress }: HeaderChipsProps) {
  return (
    <section className="dashboard-chips" aria-label="Paramètres du modèle">
      <dl className="dashboard-chips-list">
        <Chip label="θ0" value={formatNumber(theta0, 2)} />
        <Chip label="θ1" value={formatNumber(theta1, 6)} />
        <Chip label={progress.label} value={progress.value} plain />
      </dl>
    </section>
  );
}

type ChipProps = { label: string; value: string; plain?: boolean };

function Chip({ label, value, plain }: ChipProps) {
  return (
    <div className="readout-chip glass dashboard-hit">
      <dt className="label">{label}</dt>
      <dd className={plain ? 'readout-chip-value readout-chip-value-plain' : 'readout-chip-value'}>{value}</dd>
    </div>
  );
}

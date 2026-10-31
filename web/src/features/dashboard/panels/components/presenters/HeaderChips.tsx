import { formatNumber } from '@/lib/format.ts';
import '@/features/dashboard/panels/panels.css';

type HeaderChipsProps = {
  theta0: number | null;
  theta1: number | null;
  progress: { label: string; value: string };
};

export function HeaderChips({ theta0, theta1, progress }: HeaderChipsProps) {
  return (
    <dl className="dashboard-chips" aria-label="Paramètres du modèle">
      <Chip label="θ0" value={formatNumber(theta0, 2)} />
      <Chip label="θ1" value={formatNumber(theta1, 6)} />
      <Chip label={progress.label} value={progress.value} plain />
    </dl>
  );
}

function Chip({ label, value, plain }: { label: string; value: string; plain?: boolean }) {
  return (
    <div className="chip glass dashboard-hit">
      <dt className="label">{label}</dt>
      <dd className={plain ? 'chip-value chip-value-plain' : 'chip-value'} aria-live="off">
        {value}
      </dd>
    </div>
  );
}

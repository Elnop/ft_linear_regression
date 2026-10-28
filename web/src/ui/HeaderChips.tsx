import type { CSSProperties } from 'react';
import { formatNumber } from './format.ts';

export type HeaderChipsProps = {
  theta0: number | null;
  theta1: number | null;
  progress: { label: string; value: string };
  className?: string;
  style?: CSSProperties;
};

export function HeaderChips({ theta0, theta1, progress, className = '', style }: HeaderChipsProps) {
  return (
    <dl className={`wu-chips ${className}`} style={{ margin: 0, ...style }} aria-label="Paramètres du modèle">
      <Chip label="θ0" value={formatNumber(theta0, 2)} />
      <Chip label="θ1" value={formatNumber(theta1, 6)} />
      <Chip label={progress.label} value={progress.value} plain />
    </dl>
  );
}

function Chip({ label, value, plain }: { label: string; value: string; plain?: boolean }) {
  return (
    <div className="chip glass wu-hit">
      <dt className="label">{label}</dt>
      <dd className="chip-value" style={{ margin: 0, color: plain ? 'var(--ink)' : undefined }} aria-live="off">
        {value}
      </dd>
    </div>
  );
}

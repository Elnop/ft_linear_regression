import { useId } from 'react';
import { formatNumber, parseKm } from '@/lib/format.ts';
import '@/features/dashboard/panels/panels.css';

export type PredictPanelProps = {
  value: string;
  onChange: (value: string) => void;
  price: number | null;
};

export function PredictPanel({ value, onChange, price }: PredictPanelProps) {
  const id = useId();
  const invalid = value.trim() !== '' && parseKm(value) === null;
  return (
    <div className="panel glass wall-hit">
      <div className="tape" aria-hidden="true" style={{ left: 24, transform: 'rotate(-4deg)' }} />
      <label htmlFor={id} className="label">
        Prédire · kilométrage
      </label>
      <div className="km-field" data-invalid={invalid}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
        />
        <span aria-hidden="true" style={{ fontSize: 13, color: 'var(--ink-dimmed)' }}>
          km
        </span>
      </div>
      <div className="predict-output">
        <span style={{ fontSize: 12, color: 'var(--ink-dimmed)' }}>θ0 + θ1 × km</span>
        <output htmlFor={id} className="predict-price" aria-live="polite">
          {invalid || price === null ? '—' : `${formatNumber(price)} €`}
        </output>
      </div>
      {invalid && (
        <span id={`${id}-error`} className="error" role="alert">
          kilométrage invalide : un nombre positif, sans signe ni exposant
        </span>
      )}
    </div>
  );
}

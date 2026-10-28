import { useId } from 'react';
import { formatNumber, parseKm } from './format.ts';

export type PredictPanelProps = {
  value: string; // raw text of the field (controlled)
  onChange: (value: string) => void;
  price: number | null; // estimate for the current valid value
};

export function PredictPanel({ value, onChange, price }: PredictPanelProps) {
  const id = useId();
  const invalid = value.trim() !== '' && parseKm(value) === null;
  return (
    <div className="panel glass wu-hit">
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
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-err` : undefined}
        />
        <span aria-hidden="true" style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
          km
        </span>
      </div>
      <div className="predict-out">
        <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>θ0 + θ1 × km</span>
        <output htmlFor={id} className="predict-price" aria-live="polite">
          {invalid || price === null ? '—' : `${formatNumber(price)} €`}
        </output>
      </div>
      {invalid && (
        <span id={`${id}-err`} className="error" role="alert">
          kilométrage invalide : un nombre positif, sans signe ni exposant
        </span>
      )}
    </div>
  );
}

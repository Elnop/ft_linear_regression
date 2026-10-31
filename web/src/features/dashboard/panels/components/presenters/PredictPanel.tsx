import { useId } from 'react';
import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import '@/features/dashboard/panels/panels.css';

type PredictPanelProps = {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  price: number | null;
};

export function PredictPanel({ value, onChange, invalid, price }: PredictPanelProps) {
  const id = useId();
  return (
    <div className="panel glass dashboard-hit">
      <div className="tape predict-tape" aria-hidden="true" />
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
        <span aria-hidden="true" className="km-unit">
          km
        </span>
      </div>
      <div className="predict-output">
        <span className="predict-formula">θ0 + θ1 × km</span>
        <output htmlFor={id} className="predict-price" aria-live="polite">
          {price === null ? '—' : `${formatNumber(price)} €`}
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

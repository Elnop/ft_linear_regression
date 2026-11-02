import { useId } from 'react';
import '@/features/dashboard/features/training/training.css';

type ControlBarProps = {
  disabled: boolean;
  training: { active: boolean; onTrain: () => void; onReset: () => void };
  learningRate: { value: number; onChange: (learningRate: number) => void; warn: boolean };
};

export function ControlBar({ disabled, training, learningRate }: ControlBarProps) {
  const learningRateId = useId();
  return (
    <div className="dashboard-bar glass dashboard-hit" role="group" aria-label="Entraînement">
      <div className="bar-buttons">
        <button type="button" className="button-train" onClick={training.onTrain} disabled={disabled || training.active}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
            <path d="M7 4.5v15l12-7.5z" />
          </svg>
          <span>TAGUER</span>
          <span className="sr-only"> (entraîner le modèle)</span>
        </button>
        <button type="button" className="button-icon" onClick={training.onReset} disabled={disabled} aria-label="Effacer le mur">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" />
          </svg>
        </button>
      </div>

      <div className="learning-rate">
        <label htmlFor={learningRateId} className="label">
          Learning rate
        </label>
        <input
          id={learningRateId}
          type="range"
          min={0.01}
          max={3}
          step={0.01}
          value={learningRate.value}
          disabled={disabled}
          onChange={(event) => learningRate.onChange(Number(event.target.value))}
        />
        <output htmlFor={learningRateId}>{learningRate.value.toFixed(2)}</output>
      </div>

      <span className="training-hint" role="status" style={{ visibility: learningRate.warn ? 'visible' : 'hidden' }}>
        {learningRate.warn ? 'ça va couler partout…' : ''}
      </span>
    </div>
  );
}

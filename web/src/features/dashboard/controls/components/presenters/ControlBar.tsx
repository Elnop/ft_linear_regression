import { useId } from 'react';
import '@/features/dashboard/controls/controls.css';

export type ControlBarProps = {
  trainingActive: boolean;
  disabled?: boolean;
  onTrain: () => void;
  onReset: () => void;
  learningRate: number;
  onLearningRateChange: (lr: number) => void;
  diverged?: boolean;
};

const willDiverge = (learningRate: number) => learningRate > 1.75;

export function ControlBar(p: ControlBarProps) {
  const lrId = useId();
  const warn = p.diverged || willDiverge(p.learningRate);
  return (
    <div className="wu-bar glass wu-hit" role="group" aria-label="Entraînement">
      <div className="bar-buttons">
        <button type="button" className="btn-train" onClick={p.onTrain} disabled={p.disabled || p.trainingActive}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
            <path d="M7 4.5v15l12-7.5z" />
          </svg>
          <span aria-hidden="true">TAGUER</span>
          <span className="sr-only">Entraîner le modèle</span>
        </button>
        <button type="button" className="btn-icon" onClick={p.onReset} disabled={p.disabled} aria-label="Effacer le mur">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" />
          </svg>
        </button>
      </div>

      <div className="lr">
        <label htmlFor={lrId} className="label" style={{ whiteSpace: 'nowrap' }}>
          Learning rate
        </label>
        <input
          id={lrId}
          type="range"
          min={0.01}
          max={2.5}
          step={0.01}
          value={p.learningRate}
          disabled={p.disabled}
          onChange={(e) => p.onLearningRateChange(Number(e.target.value))}
        />
        <output htmlFor={lrId}>{p.learningRate.toFixed(2)}</output>
      </div>

      <span className="hint" role="status" style={{ visibility: warn ? 'visible' : 'hidden' }}>
        {warn ? 'ça va couler partout…' : ''}
      </span>
    </div>
  );
}

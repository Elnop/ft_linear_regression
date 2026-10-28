import { useId, type CSSProperties } from 'react';

export type ControlBarProps = {
  trainingActive: boolean;
  disabled?: boolean; // e.g. during the intro
  onTrain: () => void;
  onReset: () => void;
  paused?: boolean;
  onPause?: () => void; // the pause button is hidden without it
  learningRate: number;
  onLearningRateChange: (lr: number) => void;
  speed: number;
  speeds?: number[];
  onSpeedChange: (speed: number) => void;
  diverged?: boolean;
  className?: string;
  style?: CSSProperties;
};

// The descent diverges above lr ≈ 1.76 on this dataset (see docs/algorithme.md § 4).
export const willDiverge = (learningRate: number) => learningRate > 1.75;

export function ControlBar(p: ControlBarProps) {
  const lrId = useId();
  const speeds = p.speeds ?? [1, 4, 16];
  const warn = p.diverged || willDiverge(p.learningRate);
  return (
    <div className={`wu-bar glass wu-hit ${p.className ?? ''}`} style={p.style} role="group" aria-label="Entraînement">
      <div className="bar-buttons">
        <button type="button" className="btn-train" onClick={p.onTrain} disabled={p.disabled || p.trainingActive}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
            <path d="M7 4.5v15l12-7.5z" />
          </svg>
          <span aria-hidden="true">TAGUER</span>
          <span className="sr-only">Entraîner le modèle</span>
        </button>
        {p.onPause && (
          <button
            type="button"
            className="btn-icon"
            onClick={p.onPause}
            disabled={p.disabled || !p.trainingActive}
            aria-pressed={!!p.paused}
            aria-label={p.paused ? 'Reprendre' : 'Pause'}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d={p.paused ? 'M7 4.5v15l12-7.5z' : 'M8 5v14M16 5v14'} />
            </svg>
          </button>
        )}
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

      {speeds.length > 0 && (
        <div className="segmented" role="group" aria-label="Vitesse d'animation">
          {speeds.map((s) => (
            <button key={s} type="button" aria-pressed={s === p.speed} onClick={() => p.onSpeedChange(s)}>
              ×{s}
            </button>
          ))}
        </div>
      )}

      <span className="hint" role="status" style={{ visibility: warn ? 'visible' : 'hidden' }}>
        {warn ? 'ça va couler partout…' : ''}
      </span>
    </div>
  );
}

import type { ReactNode } from 'react';

export function HeadBar({ chips, toggles }: { chips: ReactNode; toggles: ReactNode }) {
  return (
    <div className="wall-head">
      {chips}
      <div className="wall-head-actions">
        {toggles}
        <button type="button" className="documentation-jump glass wall-hit" onClick={scrollToDocumentation}>
          DOC
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
            <path d="M11 4h2v12l5-5 1.4 1.4L12 19.8 4.6 12.4 6 11l5 5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function scrollToDocumentation() {
  document.getElementById('documentation')?.scrollIntoView({ behavior: 'smooth' });
}

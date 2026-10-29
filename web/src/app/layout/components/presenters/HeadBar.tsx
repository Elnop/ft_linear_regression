import type { ReactNode } from 'react';

export function HeadBar({ chips }: { chips: ReactNode }) {
  return (
    <div className="wu-head">
      {chips}
      <button type="button" className="doc-jump glass wu-hit" onClick={scrollToDoc}>
        DOC
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
          <path d="M11 4h2v12l5-5 1.4 1.4L12 19.8 4.6 12.4 6 11l5 5z" />
        </svg>
      </button>
    </div>
  );
}

function scrollToDoc() {
  document.getElementById('doc')?.scrollIntoView({ behavior: 'smooth' });
}

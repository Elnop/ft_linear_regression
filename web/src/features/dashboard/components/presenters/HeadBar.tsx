import type { ReactNode } from 'react';
import { scrollToElement } from '@/shared/lib/scrollToElement.ts';
import '@/features/dashboard/shared/shared.css';

export function HeadBar({ chips, toggles }: { chips: ReactNode; toggles: ReactNode }) {
  return (
    <div className="dashboard-head">
      {chips}
      <div className="dashboard-head-actions">
        {toggles}
        <button type="button" className="head-button documentation-jump glass dashboard-hit" onClick={() => scrollToElement('documentation')}>
          DOC
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
            <path d="M11 4h2v12l5-5 1.4 1.4L12 19.8 4.6 12.4 6 11l5 5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

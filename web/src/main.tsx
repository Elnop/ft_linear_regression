import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import { App } from '@/app/App.tsx';
import { applyPalette } from '@/shared/lib/applyPalette.ts';
import { applyTypeScale } from '@/shared/lib/applyTypeScale.ts';

applyPalette(document.documentElement);
applyTypeScale(document.documentElement);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

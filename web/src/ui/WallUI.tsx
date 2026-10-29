import type { ReactNode } from 'react';
import type { ChartMapping } from '@/paint/index.ts';
import type { TitleLayout } from '@/title/index.ts';
import { ChartAxes } from './ChartAxes.tsx';
import { ControlBar, type ControlBarProps } from './ControlBar.tsx';
import { CostPanel, type CostPoint } from './CostPanel.tsx';
import { HeaderChips } from './HeaderChips.tsx';
import { ASIDE_W, pagePad, WIDE } from './layout.ts';
import { PredictPanel } from './PredictPanel.tsx';
import { PrecisionPanel } from './PrecisionPanel.tsx';
import { PriceMarker } from './PriceMarker.tsx';
import { Reveal } from './Reveal.tsx';
import { SkipButton } from './SkipButton.tsx';
import { Stickers } from './Stickers.tsx';
import './ui.css';

export type WallUIProps = {
  width: number;
  height: number;
  chart: ChartMapping;
  title: TitleLayout;

  uiVisible: boolean;
  axesVisible?: boolean;
  showSkip: boolean;
  onSkip: () => void;

  theta0: number | null;
  theta1: number | null;
  progress: { label: string; value: string };
  costHistory: CostPoint[];
  r2: number | null;
  rmse: number | null;
  mae: number | null;
  diverged: boolean;

  km: string;
  onKmChange: (km: string) => void;
  price: number | null;
  marker: { x: number; y: number } | null;

  controls: Omit<ControlBarProps, 'diverged' | 'className' | 'style'>;

  doc?: ReactNode;
};

const SUBTITLE = 'prix ~ kilométrage · descente de gradient · 24 voitures';

export function WallUI(p: WallUIProps) {
  const { width, height, chart, title } = p;
  const wide = width >= WIDE;
  const pad = pagePad(width);
  const area = chart.area;
  const axesVisible = p.axesVisible ?? p.uiVisible;
  const subtitleTop = title.rect.y + title.rect.h + 4;

  const chips = (
    <div className="wu-head">
      <HeaderChips theta0={p.theta0} theta1={p.theta1} progress={p.progress} />
      {p.doc && (
        <button type="button" className="doc-jump glass wu-hit" onClick={scrollToDoc}>
          DOC
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
            <path d="M11 4h2v12l5-5 1.4 1.4L12 19.8 4.6 12.4 6 11l5 5z" />
          </svg>
        </button>
      )}
    </div>
  );
  const panels = (
    <>
      <PredictPanel value={p.km} onChange={p.onKmChange} price={p.price} />
      <CostPanel history={p.costHistory} diverged={p.diverged} />
      <PrecisionPanel r2={p.r2} rmse={p.rmse} mae={p.mae} />
    </>
  );
  const bar = <ControlBar {...p.controls} diverged={p.diverged} />;

  return (
    <>
      <Stickers chart={chart} width={width} titleRight={title.rect.x + title.rect.w} />
      <ChartAxes chart={chart} width={width} height={height} visible={axesVisible} />
      <PriceMarker at={p.uiVisible ? p.marker : null} price={p.price} axisY={area.y + area.h} width={width} />

      <div className="wu-root" style={wide || p.uiVisible ? undefined : { overflowY: 'hidden' }}>
        <h1 className="sr-only">ft_linear_regression</h1>
        <Reveal visible={p.uiVisible} style={{ position: wide ? 'absolute' : 'fixed', left: title.rect.x, top: subtitleTop }}>
          <p className="wu-subtitle" style={{ position: 'static', fontSize: width < 600 ? 14 : 17 }}>
            {SUBTITLE}
          </p>
        </Reveal>

        {wide ? (
          <>
            <Reveal visible={p.uiVisible} from={{ y: -12 }} style={{ position: 'absolute', top: title.rect.y, right: pad }}>
              {chips}
            </Reveal>
            <Reveal
              visible={p.uiVisible}
             
              from={{ x: 24 }}
              as="aside"
              label="Prédiction et précision"
              className="wu-aside"
              style={{ right: pad, top: title.rect.y + 92, width: ASIDE_W }}
            >
              {panels}
            </Reveal>
            <Reveal visible={p.uiVisible} from={{ y: 24 }} as="footer" style={{ position: 'absolute', left: pad, right: pad, bottom: Math.round(pad * 0.5) }}>
              {bar}
            </Reveal>
          </>
        ) : (
          <div className="wu-flow" style={{ padding: `${area.y + area.h + 70}px ${pad}px ${pad}px` }}>
            <Reveal visible={p.uiVisible}>
              {chips}
            </Reveal>
            <Reveal visible={p.uiVisible} as="aside" label="Prédiction et précision" className="wu-aside" style={{ position: 'relative' }}>
              {panels}
            </Reveal>
            <Reveal visible={p.uiVisible} as="footer">
              {bar}
            </Reveal>
            {p.uiVisible && p.doc}
          </div>
        )}

        <SkipButton
          visible={p.showSkip}
          onSkip={p.onSkip}
          style={{ position: 'fixed', right: pad, bottom: wide && p.uiVisible ? Math.round(pad * 0.5) + 86 : pad }}
        />
      </div>

      {wide && p.uiVisible && p.doc && (
        <div className="doc-page" style={{ padding: `0 ${pad}px ${pad}px` }}>
          {p.doc}
        </div>
      )}
    </>
  );
}

function scrollToDoc() {
  document.getElementById('doc')?.scrollIntoView({ behavior: 'smooth' });
}

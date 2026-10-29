import type { ReactNode } from 'react';
import type { ChartMapping } from '@/lib/chart.ts';
import type { TitleLayout } from '@/features/title/lib/layout.ts';
import { ChartAxes } from '@/features/dashboard/chart/components/presenters/ChartAxes.tsx';
import { ControlBar, type ControlBarProps } from '@/features/dashboard/controls/components/presenters/ControlBar.tsx';
import { CostPanel, type CostPoint } from '@/features/dashboard/panels/components/presenters/CostPanel.tsx';
import { HeaderChips } from '@/features/dashboard/panels/components/presenters/HeaderChips.tsx';
import { pagePad, WIDE } from '@/lib/layout.ts';
import { PredictPanel } from '@/features/dashboard/panels/components/presenters/PredictPanel.tsx';
import { PrecisionPanel } from '@/features/dashboard/panels/components/presenters/PrecisionPanel.tsx';
import { PriceMarker } from '@/features/dashboard/chart/components/presenters/PriceMarker.tsx';
import { SkipButton } from '@/features/dashboard/controls/components/presenters/SkipButton.tsx';
import { FlowLayout } from '@/features/dashboard/layout/components/presenters/FlowLayout.tsx';
import { HeadBar } from '@/features/dashboard/layout/components/presenters/HeadBar.tsx';
import { Subtitle } from '@/features/dashboard/layout/components/presenters/Subtitle.tsx';
import { WideLayout } from '@/features/dashboard/layout/components/presenters/WideLayout.tsx';
import '@/features/dashboard/layout/layout.css';

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

export function WallUI(p: WallUIProps) {
  const { width, height, chart, title } = p;
  const wide = width >= WIDE;
  const pad = pagePad(width);
  const area = chart.area;
  const axesVisible = p.axesVisible ?? p.uiVisible;

  const head = <HeadBar chips={<HeaderChips theta0={p.theta0} theta1={p.theta1} progress={p.progress} />} withDoc={!!p.doc} />;
  const panels = (
    <>
      <PredictPanel value={p.km} onChange={p.onKmChange} price={p.price} />
      <CostPanel history={p.costHistory} diverged={p.diverged} />
      <PrecisionPanel r2={p.r2} rmse={p.rmse} mae={p.mae} />
    </>
  );
  const bar = <ControlBar {...p.controls} diverged={p.diverged} />;
  const slots = { visible: p.uiVisible, pad, head, panels, bar };

  return (
    <>
      <ChartAxes chart={chart} width={width} height={height} visible={axesVisible} />
      <PriceMarker at={p.uiVisible ? p.marker : null} price={p.price} axisY={area.y + area.h} width={width} />

      <div className="wu-root" style={wide || p.uiVisible ? undefined : { overflowY: 'hidden' }}>
        <h1 className="sr-only">ft_linear_regression</h1>
        <Subtitle visible={p.uiVisible} fixed={!wide} left={title.rect.x} top={title.rect.y + title.rect.h + 4} small={width < 600} />
        {wide ? <WideLayout {...slots} top={title.rect.y} /> : <FlowLayout {...slots} top={area.y + area.h + 70} doc={p.doc} />}
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

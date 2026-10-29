import type { ReactNode } from 'react';
import type { ChartMapping } from '@/lib/chart.ts';
import type { TitleLayout } from '@/features/title/lib/layout.ts';
import { ChartAxes } from '@/features/dashboard/chart/components/presenters/ChartAxes.tsx';
import { ControlBar, type ControlBarProps } from '@/features/dashboard/controls/components/presenters/ControlBar.tsx';
import { CostPanel, type CostPanelProps } from '@/features/dashboard/panels/components/presenters/CostPanel.tsx';
import { HeaderChips, type HeaderChipsProps } from '@/features/dashboard/panels/components/presenters/HeaderChips.tsx';
import { pagePad, WIDE } from '@/lib/layout.ts';
import { PredictPanel, type PredictPanelProps } from '@/features/dashboard/panels/components/presenters/PredictPanel.tsx';
import { PrecisionPanel, type PrecisionPanelProps } from '@/features/dashboard/panels/components/presenters/PrecisionPanel.tsx';
import { PriceMarker } from '@/features/dashboard/chart/components/presenters/PriceMarker.tsx';
import { SkipButton } from '@/features/dashboard/controls/components/presenters/SkipButton.tsx';
import { FlowLayout } from '@/features/dashboard/layout/components/presenters/FlowLayout.tsx';
import { HeadBar } from '@/features/dashboard/layout/components/presenters/HeadBar.tsx';
import { Subtitle } from '@/features/dashboard/layout/components/presenters/Subtitle.tsx';
import { WideLayout } from '@/features/dashboard/layout/components/presenters/WideLayout.tsx';
import '@/features/dashboard/layout/layout.css';

export type WallUIProps = {
  viewport: { width: number; height: number; chart: ChartMapping; title: TitleLayout };
  intro: { uiVisible: boolean; showSkip: boolean; onSkip: () => void };
  header: HeaderChipsProps;
  predict: PredictPanelProps;
  cost: CostPanelProps;
  precision: PrecisionPanelProps;
  controls: ControlBarProps;
  marker: { x: number; y: number } | null;
  doc?: ReactNode;
};

export function WallUI(p: WallUIProps) {
  const { width, height, chart, title } = p.viewport;
  const { uiVisible, showSkip, onSkip } = p.intro;
  const wide = width >= WIDE;
  const pad = pagePad(width);
  const area = chart.area;

  const head = <HeadBar chips={<HeaderChips {...p.header} />} withDoc={!!p.doc} />;
  const panels = (
    <>
      <PredictPanel {...p.predict} />
      <CostPanel {...p.cost} />
      <PrecisionPanel {...p.precision} />
    </>
  );
  const bar = <ControlBar {...p.controls} />;
  const slots = { visible: uiVisible, pad, head, panels, bar };

  return (
    <>
      <ChartAxes chart={chart} width={width} height={height} visible={uiVisible} />
      <PriceMarker at={uiVisible ? p.marker : null} price={p.predict.price} axisY={area.y + area.h} width={width} />

      <div className="wu-root" style={wide || uiVisible ? undefined : { overflowY: 'hidden' }}>
        <h1 className="sr-only">ft_linear_regression</h1>
        <Subtitle visible={uiVisible} fixed={!wide} left={title.rect.x} top={title.rect.y + title.rect.h + 4} small={width < 600} />
        {wide ? <WideLayout {...slots} top={title.rect.y} /> : <FlowLayout {...slots} top={area.y + area.h + 70} doc={p.doc} />}
        <SkipButton
          visible={showSkip}
          onSkip={onSkip}
          style={{ position: 'fixed', right: pad, bottom: wide && uiVisible ? Math.round(pad * 0.5) + 86 : pad }}
        />
      </div>

      {wide && uiVisible && p.doc && (
        <div className="doc-page" style={{ padding: `0 ${pad}px ${pad}px` }}>
          {p.doc}
        </div>
      )}
    </>
  );
}

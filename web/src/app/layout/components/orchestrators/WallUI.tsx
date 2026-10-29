import { FlowLayout } from '@/app/layout/components/presenters/FlowLayout.tsx';
import { HeadBar } from '@/app/layout/components/presenters/HeadBar.tsx';
import { Subtitle } from '@/app/layout/components/presenters/Subtitle.tsx';
import { WideLayout } from '@/app/layout/components/presenters/WideLayout.tsx';
import { PriceMarkerContainer } from '@/features/dashboard/chart/components/orchestrators/PriceMarkerContainer.tsx';
import { ChartAxes } from '@/features/dashboard/chart/components/presenters/ChartAxes.tsx';
import { ControlBarContainer } from '@/features/dashboard/controls/components/orchestrators/ControlBarContainer.tsx';
import { SkipButton } from '@/features/dashboard/controls/components/presenters/SkipButton.tsx';
import { CostPanelContainer } from '@/features/dashboard/panels/components/orchestrators/CostPanelContainer.tsx';
import { HeaderChipsContainer } from '@/features/dashboard/panels/components/orchestrators/HeaderChipsContainer.tsx';
import { PrecisionPanelContainer } from '@/features/dashboard/panels/components/orchestrators/PrecisionPanelContainer.tsx';
import { PredictPanelContainer } from '@/features/dashboard/panels/components/orchestrators/PredictPanelContainer.tsx';
import { DocPage } from '@/features/docs/components/orchestrators/DocPage.tsx';
import { selectCanSkip, selectUiVisible } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { useTitleLayout } from '@/features/title/hooks/useTitleLayout.ts';
import { CHART_TO_FLOW, footerBottom, pagePad, SKIP_ABOVE_BAR, SMALL, SUBTITLE_GAP, WIDE } from '@/lib/layout.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';
import '@/app/layout/layout.css';

export function WallUI() {
  const { width, height } = useViewport();
  const chart = useChart();
  const title = useTitleLayout();
  const uiVisible = useSequence(selectUiVisible);
  const canSkip = useSequence(selectCanSkip);
  const skip = useSequence((s) => s.skip);

  const wide = width >= WIDE;
  const pad = pagePad(width);
  const area = chart.area;

  const head = <HeadBar chips={<HeaderChipsContainer />} />;
  const panels = (
    <>
      <PredictPanelContainer />
      <CostPanelContainer />
      <PrecisionPanelContainer />
    </>
  );
  const bar = <ControlBarContainer />;
  const slots = { visible: uiVisible, pad, head, panels, bar };

  return (
    <>
      <ChartAxes chart={chart} width={width} height={height} visible={uiVisible} />
      <PriceMarkerContainer />

      <div className="wu-root" style={wide || uiVisible ? undefined : { overflowY: 'hidden' }}>
        <h1 className="sr-only">ft_linear_regression</h1>
        <Subtitle visible={uiVisible} fixed={!wide} left={title.rect.x} top={title.rect.y + title.rect.h + SUBTITLE_GAP} small={width < SMALL} />
        {wide ? <WideLayout {...slots} top={title.rect.y} /> : <FlowLayout {...slots} top={area.y + area.h + CHART_TO_FLOW} doc={<DocPage />} />}
        <SkipButton
          visible={canSkip}
          onSkip={skip}
          style={{ position: 'fixed', right: pad, bottom: wide && uiVisible ? footerBottom(pad) + SKIP_ABOVE_BAR : pad }}
        />
      </div>

      {wide && uiVisible && (
        <div className="doc-page" style={{ padding: `0 ${pad}px ${pad}px` }}>
          <DocPage />
        </div>
      )}
    </>
  );
}

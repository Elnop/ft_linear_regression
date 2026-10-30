import { FlowLayout } from '@/app/layout/components/presenters/FlowLayout.tsx';
import { HeadBar } from '@/app/layout/components/presenters/HeadBar.tsx';
import { Subtitle } from '@/app/layout/components/presenters/Subtitle.tsx';
import { WideLayout } from '@/app/layout/components/presenters/WideLayout.tsx';
import { DatasetPanelContainer } from '@/features/dashboard/chart/components/orchestrators/DatasetPanelContainer.tsx';
import { OverlayTogglesContainer } from '@/features/dashboard/chart/components/orchestrators/OverlayTogglesContainer.tsx';
import { PlainChartContainer } from '@/features/dashboard/chart/components/orchestrators/PlainChartContainer.tsx';
import { PriceMarkerContainer } from '@/features/dashboard/chart/components/orchestrators/PriceMarkerContainer.tsx';
import { ChartAxes } from '@/features/dashboard/chart/components/presenters/ChartAxes.tsx';
import { ControlBarContainer } from '@/features/dashboard/controls/components/orchestrators/ControlBarContainer.tsx';
import { SkipButton } from '@/features/dashboard/controls/components/presenters/SkipButton.tsx';
import { CostPanelContainer } from '@/features/dashboard/panels/components/orchestrators/CostPanelContainer.tsx';
import { HeaderChipsContainer } from '@/features/dashboard/panels/components/orchestrators/HeaderChipsContainer.tsx';
import { PrecisionPanelContainer } from '@/features/dashboard/panels/components/orchestrators/PrecisionPanelContainer.tsx';
import { PredictPanelContainer } from '@/features/dashboard/panels/components/orchestrators/PredictPanelContainer.tsx';
import { usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { DocumentationPage } from '@/features/docs/components/orchestrators/DocumentationPage.tsx';
import { selectCanSkip, selectInterfaceVisible } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { useTitleLayout } from '@/features/title/hooks/useTitleLayout.ts';
import { CHART_TO_FLOW, footerBottom, pagePadding, SKIP_ABOVE_BAR, SMALL, SUBTITLE_GAP, WIDE } from '@/lib/layout.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';
import '@/app/layout/layout.css';

export function WallInterface() {
  const { width, height } = useViewport();
  const chart = useChart();
  const title = useTitleLayout();
  const interfaceVisible = useSequence(selectInterfaceVisible);
  const canSkip = useSequence(selectCanSkip);
  const skip = useSequence((state) => state.skip);
  const overlay = usePlayground((state) => state.overlay);

  const wide = width >= WIDE;
  const padding = pagePadding(width);
  const area = chart.area;

  const head = <HeadBar chips={<HeaderChipsContainer />} toggles={<OverlayTogglesContainer />} />;
  const panels = (
    <>
      <PredictPanelContainer />
      <CostPanelContainer />
      <PrecisionPanelContainer />
    </>
  );
  const bar = <ControlBarContainer />;
  const slots = { visible: interfaceVisible, padding, head, panels, bar };

  return (
    <>
      <ChartAxes chart={chart} width={width} height={height} visible={interfaceVisible && overlay === 'wall'} />
      <PriceMarkerContainer />
      <PlainChartContainer />
      <DatasetPanelContainer />

      <div className="wall-root" style={wide || interfaceVisible ? undefined : { overflowY: 'hidden' }}>
        <h1 className="sr-only">ft_linear_regression</h1>
        <Subtitle visible={interfaceVisible} fixed={!wide} left={title.rectangle.x} top={title.rectangle.y + title.rectangle.height + SUBTITLE_GAP} small={width < SMALL} />
        {wide ? <WideLayout {...slots} top={title.rectangle.y} /> : <FlowLayout {...slots} top={area.y + area.height + CHART_TO_FLOW} documentation={<DocumentationPage />} />}
        <SkipButton
          visible={canSkip}
          onSkip={skip}
          style={{ position: 'fixed', right: padding, bottom: wide && interfaceVisible ? footerBottom(padding) + SKIP_ABOVE_BAR : padding }}
        />
      </div>

      {wide && interfaceVisible && (
        <div className="documentation-page" style={{ padding: `0 ${padding}px ${padding}px` }}>
          <DocumentationPage />
        </div>
      )}
    </>
  );
}

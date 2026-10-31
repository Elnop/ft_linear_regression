import type { CSSProperties } from 'react';
import { HeadBar } from '@/app/layout/components/presenters/HeadBar.tsx';
import { Reveal } from '@/components/shared/motion/presenters/Reveal.tsx';
import { ChartAxesContainer } from '@/features/dashboard/chart/components/orchestrators/ChartAxesContainer.tsx';
import { DatasetPanelContainer } from '@/features/dashboard/chart/components/orchestrators/DatasetPanelContainer.tsx';
import { OverlayTogglesContainer } from '@/features/dashboard/chart/components/orchestrators/OverlayTogglesContainer.tsx';
import { PlainChartContainer } from '@/features/dashboard/chart/components/orchestrators/PlainChartContainer.tsx';
import { PriceMarkerContainer } from '@/features/dashboard/chart/components/orchestrators/PriceMarkerContainer.tsx';
import { ControlBarContainer } from '@/features/dashboard/controls/components/orchestrators/ControlBarContainer.tsx';
import { SkipButtonContainer } from '@/features/dashboard/controls/components/orchestrators/SkipButtonContainer.tsx';
import { CostPanelContainer } from '@/features/dashboard/panels/components/orchestrators/CostPanelContainer.tsx';
import { HeaderChipsContainer } from '@/features/dashboard/panels/components/orchestrators/HeaderChipsContainer.tsx';
import { PrecisionPanelContainer } from '@/features/dashboard/panels/components/orchestrators/PrecisionPanelContainer.tsx';
import { PredictPanelContainer } from '@/features/dashboard/panels/components/orchestrators/PredictPanelContainer.tsx';
import { DocumentationPage } from '@/features/docs/components/orchestrators/DocumentationPage.tsx';
import { selectInterfaceVisible } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { useTitleLayout } from '@/features/title/hooks/useTitleLayout.ts';
import { CHART_TO_FLOW, pagePadding, WIDE } from '@/lib/layout.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';
import '@/app/layout/layout.css';

export function Dashboard() {
  const { width } = useViewport();
  const { area } = useChart();
  const title = useTitleLayout();
  const visible = useSequence(selectInterfaceVisible);
  const padding = pagePadding(width);
  const top = width >= WIDE ? title.rectangle.y : area.y + area.height + CHART_TO_FLOW;
  const geometry: CSSProperties & Record<`--${string}`, string> = { '--dashboard-top': `${top}px`, '--dashboard-padding': `${padding}px` };

  return (
    <>
      <ChartAxesContainer />
      <PriceMarkerContainer />
      <PlainChartContainer />
      <DatasetPanelContainer />
      <div className="dashboard-root" style={geometry}>
        <h1 className="sr-only">ft_linear_regression</h1>
        <Reveal visible={visible} from={{ y: -12 }} className="dashboard-head-slot">
          <HeadBar chips={<HeaderChipsContainer />} toggles={<OverlayTogglesContainer />} />
        </Reveal>
        <Reveal visible={visible} from={{ x: 24 }} as="aside" label="Prédiction et précision" className="dashboard-aside">
          <PredictPanelContainer />
          <CostPanelContainer />
          <PrecisionPanelContainer />
        </Reveal>
        <Reveal visible={visible} from={{ y: 24 }} as="footer" className="dashboard-footer">
          <ControlBarContainer />
        </Reveal>
        <SkipButtonContainer />
      </div>
      {visible && (
        <div className="documentation-page" style={{ padding: `0 ${padding}px ${padding}px` }}>
          <DocumentationPage />
        </div>
      )}
    </>
  );
}

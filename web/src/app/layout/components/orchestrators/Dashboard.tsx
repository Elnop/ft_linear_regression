import type { CSSProperties } from 'react';
import { HeadBar } from '@/app/layout/components/presenters/HeadBar.tsx';
import { Reveal } from '@/app/layout/components/presenters/Reveal.tsx';
import { WallAxesContainer } from '@/features/dashboard/wall-axes/components/orchestrators/WallAxesContainer.tsx';
import { DatasetPanelContainer } from '@/features/dashboard/dataset-panel/components/orchestrators/DatasetPanelContainer.tsx';
import { OverlayTogglesContainer } from '@/features/dashboard/controls/components/orchestrators/OverlayTogglesContainer.tsx';
import { PlainChartContainer } from '@/features/dashboard/plain-chart/components/orchestrators/PlainChartContainer.tsx';
import { WallMarkerContainer } from '@/features/dashboard/wall-marker/components/orchestrators/WallMarkerContainer.tsx';
import { ControlBarContainer } from '@/features/dashboard/controls/components/orchestrators/ControlBarContainer.tsx';
import { SkipButtonContainer } from '@/features/dashboard/controls/components/orchestrators/SkipButtonContainer.tsx';
import { CostPanelContainer } from '@/features/dashboard/panels/components/orchestrators/CostPanelContainer.tsx';
import { HeaderChipsContainer } from '@/features/dashboard/panels/components/orchestrators/HeaderChipsContainer.tsx';
import { PrecisionPanelContainer } from '@/features/dashboard/panels/components/orchestrators/PrecisionPanelContainer.tsx';
import { PredictPanelContainer } from '@/features/dashboard/panels/components/orchestrators/PredictPanelContainer.tsx';
import { DocumentationPage } from '@/features/docs/components/orchestrators/DocumentationPage.tsx';
import { selectInterfaceVisible } from '@/features/dashboard/shared/lib/sequenceSelectors.ts';
import { useSequencePort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';
import { useScene } from '@/shared/hooks/useScene.ts';
import '@/app/layout/styles/layout.css';

export function Dashboard() {
  const { padding, dashboardTop } = useScene();
  const visible = useSequencePort(selectInterfaceVisible);
  const geometry: CSSProperties & Record<`--${string}`, string> = { '--dashboard-top': `${dashboardTop}px`, '--dashboard-padding': `${padding}px` };

  return (
    <>
      <WallAxesContainer />
      <WallMarkerContainer />
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

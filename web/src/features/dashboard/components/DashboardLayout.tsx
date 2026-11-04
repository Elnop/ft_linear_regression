import type { CSSProperties, ReactNode } from 'react';
import { HeadBar } from '@/features/dashboard/components/presenters/HeadBar.tsx';
import { Reveal } from '@/features/dashboard/components/presenters/Reveal.tsx';
import { WallAxesContainer } from '@/features/dashboard/features/views/components/orchestrators/WallAxesContainer.tsx';
import { DatasetPanelContainer } from '@/features/dashboard/features/views/components/orchestrators/DatasetPanelContainer.tsx';
import { ViewTogglesContainer } from '@/features/dashboard/features/views/components/orchestrators/ViewTogglesContainer.tsx';
import { PlainChartContainer } from '@/features/dashboard/features/views/components/orchestrators/PlainChartContainer.tsx';
import { WallMarkerContainer } from '@/features/dashboard/features/prediction/components/orchestrators/WallMarkerContainer.tsx';
import { ControlBarContainer } from '@/features/dashboard/features/training/components/orchestrators/ControlBarContainer.tsx';
import { SkipButtonContainer } from '@/features/dashboard/features/training/components/orchestrators/SkipButtonContainer.tsx';
import { CostPanelContainer } from '@/features/dashboard/features/regression-readout/components/orchestrators/CostPanelContainer.tsx';
import { HeaderChipsContainer } from '@/features/dashboard/features/regression-readout/components/orchestrators/HeaderChipsContainer.tsx';
import { PrecisionPanelContainer } from '@/features/dashboard/features/regression-readout/components/orchestrators/PrecisionPanelContainer.tsx';
import { PredictPanelContainer } from '@/features/dashboard/features/prediction/components/orchestrators/PredictPanelContainer.tsx';
import { selectInterfaceVisible } from '@/features/dashboard/shared/lib/animationPlaybackSelectors.ts';
import { useAnimationPlayback } from '@/shared-features/animation-playback/useAnimationPlayback.ts';
import { useScene } from '@/shared/useScene.ts';
import { ASIDE_WIDTH_REM, HEAD_WIDTH_REM } from '@/shared/configs/SceneConfig.ts';
import '@/features/dashboard/dashboard.css';

type DashboardLayoutProps = { documentation: ReactNode };

export function DashboardLayout({ documentation }: DashboardLayoutProps) {
  const { padding, dashboardTop } = useScene();
  const visible = useAnimationPlayback(selectInterfaceVisible);
  const geometry: CSSProperties & Record<`--${string}`, string> = {
    '--dashboard-top': `${dashboardTop}px`,
    '--dashboard-padding': `${padding}px`,
    '--aside-width': `${ASIDE_WIDTH_REM}rem`,
    '--head-width': `${HEAD_WIDTH_REM}rem`,
  };

  return (
    <>
      <WallAxesContainer />
      <WallMarkerContainer />
      <PlainChartContainer />
      <DatasetPanelContainer />
      <main className="dashboard-root" style={geometry}>
        <h1 className="sr-only">ft_linear_regression</h1>
        <Reveal visible={visible} from={{ y: -12 }} className="dashboard-head-slot">
          <HeadBar chips={<HeaderChipsContainer />} toggles={<ViewTogglesContainer />} />
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
      </main>
      {visible && (
        <div className="documentation-page" style={{ padding: `0 ${padding}px ${padding}px` }}>
          {documentation}
        </div>
      )}
    </>
  );
}

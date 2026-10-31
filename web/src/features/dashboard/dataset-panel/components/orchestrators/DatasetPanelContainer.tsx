import { DatasetPanel } from '@/features/dashboard/dataset-panel/components/presenters/DatasetPanel.tsx';
import { OverlayPanel } from '@/features/dashboard/shared/components/presenters/OverlayPanel.tsx';
import { overlayRectangle } from '@/features/dashboard/shared/lib/overlayRectangle.ts';
import { useOverlayShown } from '@/features/dashboard/shared/hooks/useOverlayShown.ts';
import { displayableEstimate } from '@/features/dashboard/shared/lib/displayableEstimate.ts';
import { selectUsableThetas } from '@/features/dashboard/shared/lib/selectUsableThetas.ts';
import { useModelPort } from '@/features/dashboard/shared/ports/DashboardPorts.ts';
import { useScene } from '@/shared/hooks/useScene.ts';

export function DatasetPanelContainer() {
  const { width, chart } = useScene();
  const visible = useOverlayShown('dataset');
  const thetas = useModelPort(selectUsableThetas);
  const samples = useModelPort((state) => state.samples);
  const rows = samples.map((sample) => ({ ...sample, estimate: displayableEstimate(thetas, sample.km) }));

  return (
    <OverlayPanel visible={visible} rectangle={overlayRectangle(chart, width)}>
      <DatasetPanel rows={rows} />
    </OverlayPanel>
  );
}

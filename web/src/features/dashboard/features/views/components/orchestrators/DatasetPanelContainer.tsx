import { DatasetPanel } from '@/features/dashboard/features/views/components/presenters/DatasetPanel.tsx';
import { OverlayPanel } from '@/features/dashboard/features/views/components/presenters/OverlayPanel.tsx';
import { overlayRectangle } from '@/features/dashboard/features/views/lib/overlayRectangle.ts';
import { useViewShown } from '@/features/dashboard/shared/hooks/useViewShown.ts';
import { displayableEstimate } from '@/features/dashboard/shared/lib/displayableEstimate.ts';
import { selectUsableThetas } from '@/features/dashboard/shared/lib/selectUsableThetas.ts';
import { useRegression } from '@/shared-features/regression/hooks/useRegression.ts';
import { useScene } from '@/shared/useScene.ts';

export function DatasetPanelContainer() {
  const { width, chart } = useScene();
  const visible = useViewShown('dataset');
  const thetas = useRegression(selectUsableThetas);
  const samples = useRegression((state) => state.samples);
  const rows = samples.map((sample) => ({ ...sample, estimate: displayableEstimate(thetas, sample.km) }));

  return (
    <OverlayPanel visible={visible} rectangle={overlayRectangle(chart, width)}>
      <DatasetPanel rows={rows} />
    </OverlayPanel>
  );
}

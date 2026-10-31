import { DatasetPanel } from '@/features/dashboard/chart/components/presenters/DatasetPanel.tsx';
import { OverlayPanel } from '@/features/dashboard/chart/components/presenters/OverlayPanel.tsx';
import { overlayRectangle } from '@/features/dashboard/chart/lib/overlay.ts';
import { useOverlayShown } from '@/features/dashboard/hooks/useOverlayShown.ts';
import { displayableEstimate } from '@/features/dashboard/lib/estimate.ts';
import { DATA } from '@/features/sequence/lib/dataset.ts';
import { selectUsableThetas } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';

export function DatasetPanelContainer() {
  const { width } = useViewport();
  const chart = useChart();
  const visible = useOverlayShown('dataset');
  const thetas = useSequence(selectUsableThetas);
  const rows = DATA.map((sample) => ({ ...sample, estimate: displayableEstimate(thetas, sample.km) }));

  return (
    <OverlayPanel visible={visible} rectangle={overlayRectangle(chart, width)}>
      <DatasetPanel rows={rows} />
    </OverlayPanel>
  );
}

import { DatasetPanel } from '@/features/dashboard/dataset-panel/components/presenters/DatasetPanel.tsx';
import { OverlayPanel } from '@/features/dashboard/shared/components/presenters/OverlayPanel.tsx';
import { overlayRectangle } from '@/features/dashboard/shared/lib/overlayRectangle.ts';
import { useOverlayShown } from '@/features/dashboard/shared/hooks/useOverlayShown.ts';
import { displayableEstimate } from '@/features/dashboard/shared/lib/displayableEstimate.ts';
import { DATA } from '@/shared/configs/DatasetConfig.ts';
import { selectUsableThetas } from '@/features/wall/sequence/lib/selectors.ts';
import { useSequence } from '@/features/wall/sequence/stores/sequenceStore.ts';
import { useChart, useViewport } from '@/shared/stores/viewportStore.ts';

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

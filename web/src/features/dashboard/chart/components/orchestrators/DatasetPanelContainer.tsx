import { estimatePrice } from '@core/hypothesis.ts';
import { hasFiniteThetas } from '@core/thetas.ts';
import { DatasetPanel } from '@/features/dashboard/chart/components/presenters/DatasetPanel.tsx';
import { OverlayPanel } from '@/features/dashboard/chart/components/presenters/OverlayPanel.tsx';
import { overlayRectangle } from '@/features/dashboard/chart/lib/overlay.ts';
import { usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { DATA } from '@/features/sequence/lib/dataset.ts';
import { selectInterfaceVisible } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { isDisplayablePrice } from '@/lib/format.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';

export function DatasetPanelContainer() {
  const { width } = useViewport();
  const chart = useChart();
  const overlay = usePlayground((state) => state.overlay);
  const interfaceVisible = useSequence(selectInterfaceVisible);
  const thetas = useSequence((state) => state.thetas);
  const diverged = useSequence((state) => state.diverged);
  const usable = thetas && !diverged && hasFiniteThetas(thetas) ? thetas : null;
  const rows = DATA.map((sample) => {
    const estimate = usable ? estimatePrice(usable, sample.km) : null;
    return { ...sample, estimate: estimate !== null && isDisplayablePrice(estimate) ? estimate : null };
  });

  const rectangle = overlayRectangle(chart, width);

  return (
    <OverlayPanel visible={overlay === 'dataset' && interfaceVisible} rectangle={rectangle}>
      <DatasetPanel rows={rows} />
    </OverlayPanel>
  );
}

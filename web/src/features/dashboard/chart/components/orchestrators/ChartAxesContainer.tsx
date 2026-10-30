import { ChartAxes } from '@/features/dashboard/chart/components/presenters/ChartAxes.tsx';
import { usePlayground } from '@/features/dashboard/stores/playgroundStore.ts';
import { selectInterfaceVisible } from '@/features/sequence/lib/selectors.ts';
import { useSequence } from '@/features/sequence/stores/sequenceStore.ts';
import { useChart, useViewport } from '@/lib/viewport/viewportStore.ts';

export function ChartAxesContainer() {
  const { width, height } = useViewport();
  const chart = useChart();
  const overlay = usePlayground((state) => state.overlay);
  const interfaceVisible = useSequence(selectInterfaceVisible);
  return <ChartAxes chart={chart} width={width} height={height} visible={interfaceVisible && overlay === 'wall'} />;
}

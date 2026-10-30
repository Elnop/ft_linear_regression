import { DashboardLayout } from '@/app/layout/components/orchestrators/DashboardLayout.tsx';
import { ChartAxesContainer } from '@/features/dashboard/chart/components/orchestrators/ChartAxesContainer.tsx';
import { DatasetPanelContainer } from '@/features/dashboard/chart/components/orchestrators/DatasetPanelContainer.tsx';
import { PlainChartContainer } from '@/features/dashboard/chart/components/orchestrators/PlainChartContainer.tsx';
import { PriceMarkerContainer } from '@/features/dashboard/chart/components/orchestrators/PriceMarkerContainer.tsx';
import '@/app/layout/layout.css';

export function Dashboard() {
  return (
    <>
      <ChartAxesContainer />
      <PriceMarkerContainer />
      <PlainChartContainer />
      <DatasetPanelContainer />
      <DashboardLayout />
    </>
  );
}

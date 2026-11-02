import type { ChartMapping } from '@/shared/types/ChartTypes.ts';
import type { TitleLayout } from '@/shared/types/TitleTypes.ts';

export type Scene = {
  width: number;
  height: number;
  wide: boolean;
  padding: number;
  chart: ChartMapping;
  title: TitleLayout;
  dashboardTop: number;
};

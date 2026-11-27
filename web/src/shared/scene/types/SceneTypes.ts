import type { ChartMapping } from '@/shared/scene/types/ChartTypes.ts';
import type { TitleLayout } from '@/shared/scene/types/TitleTypes.ts';

export type Scene = {
  width: number;
  height: number;
  rem: number;
  wide: boolean;
  padding: number;
  chart: ChartMapping;
  title: TitleLayout;
  dashboardTop: number;
};

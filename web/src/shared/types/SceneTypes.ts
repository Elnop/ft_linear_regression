import type { ChartMapping } from './ChartTypes.ts';
import type { TitleLayout } from './TitleTypes.ts';

export type Scene = {
  width: number;
  height: number;
  wide: boolean;
  padding: number;
  chart: ChartMapping;
  title: TitleLayout;
  dashboardTop: number;
};

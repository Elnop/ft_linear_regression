import type { ChartDomain } from '@/shared/lib/chart.ts';

const KM_STEP = 50_000;
const PRICE_STEP = 1_000;

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let value = from; value <= to + 1e-9; value += step) out.push(value);
  return out;
}

export function chartTicks({ kmMin, kmMax, priceMin, priceMax }: ChartDomain): { kmTicks: number[]; priceTicks: number[] } {
  return { kmTicks: range(kmMin, kmMax, KM_STEP), priceTicks: range(priceMin, priceMax, PRICE_STEP) };
}

export const formatTick = (value: number) => (value === 0 ? '0' : `${Math.round(value / 1000)}k`);

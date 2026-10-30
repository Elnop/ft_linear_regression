import { motion } from 'motion/react';
import type { ChartMapping } from '@/lib/chart.ts';
import { SMALL } from '@/lib/layout.ts';
import '@/features/dashboard/chart/chart.css';

export type ChartAxesProps = {
  chart: ChartMapping;
  width: number;
  height: number;
  visible?: boolean;
};

const CHALK = 'rgba(239,236,230,0.62)';
const KM_STEP = 50_000;
const PRICE_STEP = 1_000;

const range = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let value = from; value <= to + 1e-9; value += step) out.push(value);
  return out;
};

const short = (value: number) => (value === 0 ? '0' : `${Math.round(value / 1000)}k`);

export function ChartAxes({ chart, width, height, visible = true }: ChartAxesProps) {
  const { area, domain } = chart;
  const bottom = area.y + area.height;
  const right = area.x + area.width;
  const small = width < SMALL;
  const fontSize = small ? 12 : 15;
  const kmTicks = range(domain.kmMin, domain.kmMax, KM_STEP);
  const priceTicks = range(domain.priceMin, domain.priceMax, PRICE_STEP);
  return (
    <motion.svg
      className="wall-axes"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Graphe du prix (${short(domain.priceMin)} à ${short(domain.priceMax)} €) en fonction du kilométrage (${short(domain.kmMin)} à ${short(domain.kmMax)} km)`}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <g stroke="rgba(239,236,230,0.09)" strokeWidth="1" strokeDasharray="2 7">
        {priceTicks.slice(1).map((price) => (
          <line key={price} x1={area.x} x2={right} y1={chart.y(price)} y2={chart.y(price)} />
        ))}
        {kmTicks.slice(1).map((km) => (
          <line key={km} x1={chart.x(km)} x2={chart.x(km)} y1={area.y} y2={bottom} />
        ))}
      </g>
      <g stroke={CHALK} strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d={`M${area.x} ${area.y - 10} L${area.x} ${bottom} L${right + 10} ${bottom}`} strokeDasharray="18 5 4 5" />
        {kmTicks.map((km) => (
          <line key={km} x1={chart.x(km)} x2={chart.x(km)} y1={bottom} y2={bottom + 7} />
        ))}
        {priceTicks.map((price) => (
          <line key={price} x1={area.x - 7} x2={area.x} y1={chart.y(price)} y2={chart.y(price)} />
        ))}
      </g>
      <g className="axis-text" fontSize={fontSize}>
        {kmTicks.map((km) => (
          <text key={km} x={chart.x(km)} y={bottom + 12 + fontSize} textAnchor="middle">
            {short(km)}
          </text>
        ))}
        {priceTicks.map((price) => (
          <text key={price} x={area.x - 12} y={chart.y(price) + fontSize * 0.36} textAnchor="end">
            {short(price)}
          </text>
        ))}
        <text x={area.x + 12} y={bottom - 12} textAnchor="start" fontSize={fontSize + 2}>
          kilométrage (km) →
        </text>
        <text x={area.x - 12} y={area.y - (small ? 16 : 22)} textAnchor="start" fontSize={fontSize + 2}>
          ↑ prix (€)
        </text>
      </g>
    </motion.svg>
  );
}

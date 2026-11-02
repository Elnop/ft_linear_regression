import { motion } from 'motion/react';
import { axisLayout } from '@/features/dashboard/features/views/lib/axisLayout.ts';
import { formatTick } from '@/features/dashboard/features/views/lib/ticks.ts';

import { COMPACT_BELOW } from '@/features/dashboard/shared/DashboardLayoutConfig.ts';
import '@/features/dashboard/features/views/styles/wall-axes.css';
import type { ChartMapping } from '@/shared/types/ChartTypes.ts';

type WallAxesProps = {
  chart: ChartMapping;
  width: number;
  height: number;
  visible: boolean;
};

export function WallAxes({ chart, width, height, visible }: WallAxesProps) {
  const { area, domain } = chart;
  const small = width < COMPACT_BELOW;
  const fontSize = small ? 12 : 15;
  const { bottom, right, priceGrid, kmGrid, kmLabels, priceLabels } = axisLayout(chart, fontSize, 12);
  return (
    <motion.svg
      className="wall-axes"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Graphe du prix (${formatTick(domain.priceMin)} à ${formatTick(domain.priceMax)} €) en fonction du kilométrage (${formatTick(domain.kmMin)} à ${formatTick(domain.kmMax)} km)`}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <g className="wall-axes-grid" strokeWidth="1" strokeDasharray="2 7">
        {[...priceGrid.slice(1), ...kmGrid.slice(1)].map(({ key, ...segment }) => (
          <line key={`${segment.x1}-${segment.y1}-${key}`} {...segment} />
        ))}
      </g>
      <g className="wall-axes-chalk" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d={`M${area.x} ${area.y - 10} L${area.x} ${bottom} L${right + 10} ${bottom}`} strokeDasharray="18 5 4 5" />
        {kmGrid.map(({ key, x1 }) => (
          <line key={key} x1={x1} x2={x1} y1={bottom} y2={bottom + 7} />
        ))}
        {priceGrid.map(({ key, y1 }) => (
          <line key={key} x1={area.x - 7} x2={area.x} y1={y1} y2={y1} />
        ))}
      </g>
      <g className="axis-text" fontSize={fontSize}>
        {kmLabels.map(({ key, text, x, y }) => (
          <text key={key} x={x} y={y} textAnchor="middle">
            {text}
          </text>
        ))}
        {priceLabels.map(({ key, text, x, y }) => (
          <text key={key} x={x} y={y} textAnchor="end">
            {text}
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

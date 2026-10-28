import { motion } from 'motion/react';
import type { ChartMapping } from '../paint/index.ts';

export type ChartAxesProps = {
  chart: ChartMapping; // the same mapping the paint uses (see chartFor)
  width: number;
  height: number;
  visible?: boolean;
  kmStep?: number;
  priceStep?: number;
};

const CHALK = 'rgba(239,236,230,0.62)';

const range = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(v);
  return out;
};

const short = (v: number) => (v === 0 ? '0' : `${Math.round(v / 1000)}k`);

// Chalk axes with tick labels, drawn over the wall so the painted data
// reads as a real graph.
export function ChartAxes({ chart, width, height, visible = true, kmStep = 50_000, priceStep = 1_000 }: ChartAxesProps) {
  const { area, domain } = chart;
  const bottom = area.y + area.h;
  const right = area.x + area.w;
  const small = width < 600;
  const fs = small ? 12 : 15;
  const kms = range(domain.kmMin, domain.kmMax, kmStep);
  const prices = range(domain.priceMin, domain.priceMax, priceStep);
  return (
    <motion.svg
      className="wu-axes"
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
        {prices.slice(1).map((p) => (
          <line key={p} x1={area.x} x2={right} y1={chart.y(p)} y2={chart.y(p)} />
        ))}
        {kms.slice(1).map((k) => (
          <line key={k} x1={chart.x(k)} x2={chart.x(k)} y1={area.y} y2={bottom} />
        ))}
      </g>
      <g stroke={CHALK} strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d={`M${area.x} ${area.y - 10} L${area.x} ${bottom} L${right + 10} ${bottom}`} strokeDasharray="18 5 4 5" />
        {kms.map((k) => (
          <line key={k} x1={chart.x(k)} x2={chart.x(k)} y1={bottom} y2={bottom + 7} />
        ))}
        {prices.map((p) => (
          <line key={p} x1={area.x - 7} x2={area.x} y1={chart.y(p)} y2={chart.y(p)} />
        ))}
      </g>
      <g className="axis-text" fontSize={fs}>
        {kms.map((k) => (
          <text key={k} x={chart.x(k)} y={bottom + 12 + fs} textAnchor="middle">
            {short(k)}
          </text>
        ))}
        {prices.map((p) => (
          <text key={p} x={area.x - 12} y={chart.y(p) + fs * 0.36} textAnchor="end">
            {short(p)}
          </text>
        ))}
        {/* Inside the plot, bottom-left: that corner never holds data (price drops with km). */}
        <text x={area.x + 12} y={bottom - 12} textAnchor="start" fontSize={fs + 2}>
          kilométrage (km) →
        </text>
        <text x={area.x - 12} y={area.y - (small ? 16 : 22)} textAnchor="start" fontSize={fs + 2}>
          ↑ prix (€)
        </text>
      </g>
    </motion.svg>
  );
}

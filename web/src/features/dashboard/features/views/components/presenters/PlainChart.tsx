import type { Sample } from '@core/types/CoreTypes.ts';
import { axisLayout } from '@/features/dashboard/features/views/lib/axisLayout.ts';

import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import { COMPACT_BELOW } from '@/features/dashboard/shared/DashboardLayoutConfig.ts';
import type { Rectangle, Vec2 } from '@/shared/types/GeometryTypes.ts';
import '@/features/dashboard/features/views/styles/plain-chart.css';
import type { ChartMapping } from '@/shared/types/ChartTypes.ts';

type PlainChartProps = {
  chart: ChartMapping;
  width: number;
  rectangle: Rectangle;
  samples: Sample[];
  line: [Vec2, Vec2] | null;
  prediction: { km: number; price: number; at: Vec2 } | null;
};

export function PlainChart({ chart, width, rectangle, samples, line, prediction }: PlainChartProps) {
  const { area } = chart;
  const fontSize = width < COMPACT_BELOW ? 11 : 13;
  const { bottom, right, priceGrid, kmGrid, kmLabels, priceLabels } = axisLayout(chart, fontSize, 10);

  return (
    <svg
      width={rectangle.width}
      height={rectangle.height}
      viewBox={`${rectangle.x} ${rectangle.y} ${rectangle.width} ${rectangle.height}`}
      role="img"
      aria-label={`Prix en fonction du kilométrage : ${samples.length} voitures et droite de régression`}
      fontSize={fontSize}
    >
      <g className="plain-grid">
        {[...priceGrid, ...kmGrid].map(({ key, ...segment }) => (
          <line key={`${segment.x1}-${segment.y1}-${key}`} {...segment} />
        ))}
      </g>
      <path className="plain-axis" d={`M${area.x} ${area.y} L${area.x} ${bottom} L${right} ${bottom}`} />
      <g className="plain-text">
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
        <text x={right - 8} y={bottom - 10} textAnchor="end">
          kilométrage (km)
        </text>
        <text x={area.x - 10} y={area.y - 14} textAnchor="start">
          prix (€)
        </text>
      </g>
      {line && <line className="plain-line" x1={line[0].x} y1={line[0].y} x2={line[1].x} y2={line[1].y} />}
      <g className="plain-points">
        {samples.map((sample, index) => (
          <circle key={index} cx={chart.x(sample.km)} cy={chart.y(sample.price)} r={4.5} />
        ))}
      </g>
      {prediction && (
        <g className="plain-prediction">
          <line x1={prediction.at.x} y1={prediction.at.y} x2={prediction.at.x} y2={bottom} />
          <circle cx={prediction.at.x} cy={prediction.at.y} r={6} />
          <text
            x={prediction.at.x + (prediction.at.x > right - 140 ? -12 : 12)}
            y={prediction.at.y - 12}
            textAnchor={prediction.at.x > right - 140 ? 'end' : 'start'}
          >
            {formatNumber(prediction.km)} km → {formatNumber(prediction.price)} €
          </text>
        </g>
      )}
    </svg>
  );
}

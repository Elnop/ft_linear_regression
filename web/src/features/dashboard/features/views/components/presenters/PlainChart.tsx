import type { Sample } from '@core/types/CoreTypes.ts';
import { axisLayout } from '@/features/dashboard/features/views/lib/axisLayout.ts';
import { predictionLabel } from '@/features/dashboard/features/views/lib/predictionLabel.ts';

import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import { textSize } from '@/shared/lib/typeScale.ts';
import type { Rectangle, Vec2 } from '@/shared/types/GeometryTypes.ts';
import '@/features/dashboard/features/views/styles/plain-chart.css';
import type { ChartMapping } from '@/shared/types/ChartTypes.ts';

type PlainChartProps = {
  chart: ChartMapping;
  width: number;
  rem: number;
  rectangle: Rectangle;
  samples: Sample[];
  line: [Vec2, Vec2] | null;
  prediction: { km: number; price: number; at: Vec2 } | null;
};

export function PlainChart({ chart, width, rem, rectangle, samples, line, prediction }: PlainChartProps) {
  const { area } = chart;
  const fontSize = textSize('xs', width, rem);
  const { bottom, right, priceGrid, kmGrid, kmLabels, priceLabels } = axisLayout(chart, fontSize, 0.625 * rem);
  const label = prediction && predictionLabel(prediction.at, rectangle, fontSize);

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
        <text x={right - 0.5 * rem} y={bottom - 0.625 * rem} textAnchor="end">
          kilométrage (km)
        </text>
        <text x={area.x - 0.625 * rem} y={area.y - 0.875 * rem} textAnchor="start">
          prix (€)
        </text>
      </g>
      {line && <line className="plain-line" x1={line[0].x} y1={line[0].y} x2={line[1].x} y2={line[1].y} />}
      <g className="plain-points">
        {samples.map((sample, index) => (
          <circle key={index} cx={chart.x(sample.km)} cy={chart.y(sample.price)} r={4.5} />
        ))}
      </g>
      {prediction && label && (
        <g className="plain-prediction">
          <line x1={prediction.at.x} y1={prediction.at.y} x2={prediction.at.x} y2={bottom} />
          <circle cx={prediction.at.x} cy={prediction.at.y} r={6} />
          <text x={label.x} y={label.y} textAnchor={label.anchor}>
            {formatNumber(prediction.km)} km → {formatNumber(prediction.price)} €
          </text>
        </g>
      )}
    </svg>
  );
}

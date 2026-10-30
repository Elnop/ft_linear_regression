import type { Sample } from '@core/types.ts';
import type { ChartMapping } from '@/lib/chart.ts';
import { formatNumber } from '@/lib/format.ts';
import { SMALL } from '@/lib/layout.ts';
import type { Rectangle, Vec2 } from '@/lib/paint/types.ts';
import '@/features/dashboard/chart/chart.css';

export type PlainChartProps = {
  chart: ChartMapping;
  width: number;
  rectangle: Rectangle;
  samples: Sample[];
  line: [Vec2, Vec2] | null;
  prediction: { km: number; price: number; at: Vec2 } | null;
};

const KM_STEP = 50_000;
const PRICE_STEP = 1_000;

const range = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let value = from; value <= to + 1e-9; value += step) out.push(value);
  return out;
};

const short = (value: number) => (value === 0 ? '0' : `${Math.round(value / 1000)}k`);

export function PlainChart({ chart, width, rectangle, samples, line, prediction }: PlainChartProps) {
  const { area, domain } = chart;
  const bottom = area.y + area.height;
  const right = area.x + area.width;
  const fontSize = width < SMALL ? 11 : 13;
  const kmTicks = range(domain.kmMin, domain.kmMax, KM_STEP);
  const priceTicks = range(domain.priceMin, domain.priceMax, PRICE_STEP);

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
        {priceTicks.map((price) => (
          <line key={price} x1={area.x} x2={right} y1={chart.y(price)} y2={chart.y(price)} />
        ))}
        {kmTicks.map((km) => (
          <line key={km} x1={chart.x(km)} x2={chart.x(km)} y1={area.y} y2={bottom} />
        ))}
      </g>
      <path className="plain-axis" d={`M${area.x} ${area.y} L${area.x} ${bottom} L${right} ${bottom}`} />
      <g className="plain-text">
        {kmTicks.map((km) => (
          <text key={km} x={chart.x(km)} y={bottom + fontSize + 8} textAnchor="middle">
            {short(km)}
          </text>
        ))}
        {priceTicks.map((price) => (
          <text key={price} x={area.x - 10} y={chart.y(price) + fontSize * 0.35} textAnchor="end">
            {short(price)}
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

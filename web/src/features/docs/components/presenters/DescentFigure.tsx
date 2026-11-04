import '@/features/docs/styles/code.css';
import '@/features/docs/styles/figure.css';
import { useRenderedWidth } from '@/features/docs/hooks/useRenderedWidth.ts';
import { readRem } from '@/shared/lib/readRem.ts';
import { textSize } from '@/shared/lib/typeScale.ts';

const VIEWBOX_WIDTH = 400;

export function DescentFigure() {
  const { ref, width } = useRenderedWidth<SVGSVGElement>();
  const labelSize = width > 0 ? (textSize('xs', document.documentElement.clientWidth, readRem()) * VIEWBOX_WIDTH) / width : undefined;
  function curve(x: number) {
    return 195 - 0.0052 * (x - 200) ** 2;
  }
  const path = Array.from({ length: 41 }, (_, i) => {
    const x = 20 + i * 9;
    return `${i ? 'L' : 'M'}${x},${curve(x).toFixed(1)}`;
  }).join(' ');
  const start = 40;
  const steps = [start, 105, 148, 176, 191];
  const strides = steps.slice(1).map((to, i) => ({ from: steps[i] ?? start, to }));

  return (
    <figure className="documentation-code documentation-figure">
      <svg ref={ref} viewBox="0 0 400 230" role="img" aria-label="Courbe du coût J en forme de bol, avec des pas successifs qui descendent vers le minimum">
        <line x1="20" y1="210" x2="390" y2="210" className="figure-axis" />
        <line x1="20" y1="10" x2="20" y2="210" className="figure-axis" />
        <g style={{ fontSize: labelSize }}>
          <text x="384" y="226" className="figure-label" textAnchor="end">
            θ
          </text>
          <text x="28" y="22" className="figure-label">
            J(θ)
          </text>
          <text x={start + 10} y={curve(start) + 4} className="figure-label">
            départ
          </text>
          <text x="200" y="174" className="figure-label" textAnchor="middle">
            minimum
          </text>
        </g>
        <path d={path} className="figure-curve" />
        {strides.map(({ from, to }) => (
          <line key={to} x1={from} y1={curve(from)} x2={to} y2={curve(to)} className="figure-step" />
        ))}
        {steps.map((x, i) => (
          <circle key={x} cx={x} cy={curve(x)} r={i ? 4 : 6} className="figure-dot" />
        ))}
        <line x1="200" y1="182" x2="200" y2="210" className="figure-minimum" />
      </svg>
      <figcaption>Chaque pas suit la pente. Les pas raccourcissent à mesure que la pente s'aplatit.</figcaption>
    </figure>
  );
}

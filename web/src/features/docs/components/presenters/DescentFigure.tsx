export function DescentFigure() {
  const curve = (x: number) => 195 - 0.0052 * (x - 200) ** 2;
  const path = Array.from({ length: 41 }, (_, i) => {
    const x = 20 + i * 9;
    return `${i ? 'L' : 'M'}${x},${curve(x).toFixed(1)}`;
  }).join(' ');
  const steps = [40, 105, 148, 176, 191];

  return (
    <figure className="doc-code doc-figure">
      <svg viewBox="0 0 400 230" role="img" aria-label="Courbe du coût J en forme de bol, avec des pas successifs qui descendent vers le minimum">
        <line x1="20" y1="210" x2="390" y2="210" className="fig-axis" />
        <line x1="20" y1="10" x2="20" y2="210" className="fig-axis" />
        <text x="384" y="226" className="fig-label" textAnchor="end">θ</text>
        <text x="28" y="22" className="fig-label">J(θ)</text>
        <path d={path} className="fig-curve" />
        {steps.slice(1).map((x, i) => (
          <line key={x} x1={steps[i]} y1={curve(steps[i])} x2={x} y2={curve(x)} className="fig-step" />
        ))}
        {steps.map((x, i) => (
          <circle key={x} cx={x} cy={curve(x)} r={i ? 4 : 6} className="fig-dot" />
        ))}
        <text x={steps[0] + 10} y={curve(steps[0]) + 4} className="fig-label">départ</text>
        <line x1="200" y1="182" x2="200" y2="210" className="fig-min" />
        <text x="200" y="174" className="fig-label" textAnchor="middle">minimum</text>
      </svg>
      <figcaption>Chaque pas suit la pente ; les pas raccourcissent à mesure que la pente s'aplatit.</figcaption>
    </figure>
  );
}

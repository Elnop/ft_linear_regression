import type { Sample } from '@core/CoreTypes.ts';
import { formatNumber } from '@/features/dashboard/shared/lib/formatNumber.ts';
import '@/features/dashboard/dataset-panel/dataset-panel.css';

export type DatasetRow = Sample & { estimate: number | null };

type DatasetPanelProps = {
  rows: DatasetRow[];
};

export function DatasetPanel({ rows }: DatasetPanelProps) {
  return (
    <section className="dataset" aria-label="Dataset" tabIndex={0}>
      <p className="label dataset-caption">data.csv · {rows.length} voitures</p>
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">km</th>
            <th scope="col">prix (€)</th>
            <th scope="col">estimé (€)</th>
            <th scope="col">écart (€)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td className="dataset-km">{formatNumber(row.km)}</td>
              <td>{formatNumber(row.price)}</td>
              <td className="dataset-estimate">{formatNumber(row.estimate)}</td>
              <td>{formatNumber(row.estimate === null ? null : row.price - row.estimate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

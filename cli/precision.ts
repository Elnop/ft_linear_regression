import { mae, mean, r2, rmse } from '../core/metrics.ts';
import { parseCli } from './args.ts';
import { loadDataset } from './dataset.ts';
import { readModel } from './model.ts';
import { fail } from './process.ts';

const USAGE = `Usage: npm run precision -- [dataset.csv]

  dataset.csv  km,price CSV file to evaluate on (default: data.csv)
  -h, --help   show this help`;

const { datasetPath } = parseCli(USAGE, {});

const thetas = readModel();
if (!thetas) fail('model.json not found, run the training first (npm run train)');

const data = loadDataset(datasetPath);
const meanPrice = mean(data.map(({ price }) => price));
const meanError = mae(data, thetas);

console.log(`Model: theta0=${thetas.theta0}  theta1=${thetas.theta1}`);
console.log(`Dataset: ${datasetPath} (${data.length} samples)`);
console.log(`R²:   ${r2(data, thetas).toFixed(4)}  (share of the price variance explained by the mileage)`);
console.log(`RMSE: ${rmse(data, thetas).toFixed(2)}  (typical error, large errors weigh more)`);
console.log(`MAE:  ${meanError.toFixed(2)}  (mean absolute error, ${((meanError / meanPrice) * 100).toFixed(1)}% of the mean price)`);

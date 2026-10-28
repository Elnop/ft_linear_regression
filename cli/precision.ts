import { parseArgs } from 'node:util';
import { mae, r2, rmse } from '../core/metrics.ts';
import { fail, loadDataset, readModel } from './model.ts';

const USAGE = `Usage: npm run precision -- [dataset.csv]

  dataset.csv  km,price CSV file to evaluate on (default: data.csv)
  -h, --help   show this help`;

function parseCli() {
  try {
    return parseArgs({
      allowPositionals: true,
      options: { help: { type: 'boolean', short: 'h', default: false } },
    });
  } catch (e) {
    fail(`${(e as Error).message}\n\n${USAGE}`);
  }
}

const { values, positionals } = parseCli();
if (values.help) {
  console.log(USAGE);
  process.exit(0);
}
if (positionals.length > 1) fail(`expected at most one dataset file\n\n${USAGE}`);

const thetas = readModel();
if (!thetas) fail('model.json not found, run the training first (npm run train)');

const datasetPath = positionals[0] ?? 'data.csv';
const data = loadDataset(datasetPath);
const meanPrice = data.reduce((sum, { price }) => sum + price, 0) / data.length;
const meanError = mae(data, thetas);

console.log(`Model: theta0=${thetas.theta0}  theta1=${thetas.theta1}`);
console.log(`Dataset: ${datasetPath} (${data.length} samples)`);
console.log(`R²:   ${r2(data, thetas).toFixed(4)}  (share of the price variance explained by the mileage)`);
console.log(`RMSE: ${rmse(data, thetas).toFixed(2)}  (typical error, large errors weigh more)`);
console.log(`MAE:  ${meanError.toFixed(2)}  (mean absolute error, ${((meanError / meanPrice) * 100).toFixed(1)}% of the mean price)`);

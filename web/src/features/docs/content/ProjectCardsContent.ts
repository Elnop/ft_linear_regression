import { FIGURES } from '@/features/docs/configs/DocFiguresConfig.ts';

const { descent } = FIGURES;

export const CLI = `$ npm run train
Dataset: data.csv (${FIGURES.sampleCount} samples)
Training: lr=${FIGURES.learningRate}, iterations=${FIGURES.iterations}
Done: theta0=${descent.theta0}  theta1=${descent.theta1}  cost=${descent.cost.toFixed(2)}
Saved to model.json

$ npm run predict
Mileage (km): ${FIGURES.exampleMileage}
Estimated price: ${FIGURES.examplePrice.toFixed(2)}

$ npm run precision
R²:   ${FIGURES.r2.toFixed(4)}
RMSE: ${FIGURES.rmse.toFixed(2)}
MAE:  ${FIGURES.mae.toFixed(2)}  (${((FIGURES.mae / FIGURES.meanPrice) * 100).toFixed(1)}% of the mean price)

$ npm run train -- data.csv --lr ${FIGURES.divergentLearningRate}
Error: training diverged at iteration ${FIGURES.divergenceIteration}, model not saved (try a smaller --lr)`;

export const TREE = `core/  calcul pur, partagé
cli/   train, predict, precision
web/   cette page (React, WebGL)
docs/  documentation détaillée`;

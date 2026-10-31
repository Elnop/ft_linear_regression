export const CLI = `$ npm run train
Dataset: data.csv (24 samples)
Training: lr=0.5, iterations=10000
Done: theta0=8499.599649933207  theta1=-0.02144896359170222  cost=222822.62
Saved to model.json

$ npm run predict
Mileage (km): 100000
Estimated price: 6354.70

$ npm run precision
R²:   0.7330
RMSE: 667.57
MAE:  557.84  (8.8% of the mean price)

$ npm run train -- data.csv --lr 3
Error: training diverged at iteration 788, model not saved (try a smaller --lr)`;

export const TREE = `core/  calcul pur, partagé
cli/   train, predict, precision
web/   cette page (React, WebGL)
docs/  documentation détaillée`;

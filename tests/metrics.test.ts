import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cost, mae, mean, r2, rmse } from '../core/metrics.ts';

const data = [
  { km: 0, price: 10 },
  { km: 1, price: 12 },
  { km: 2, price: 14 },
];

test('a perfect line has no error', () => {
  const thetas = { theta0: 10, theta1: 2 };
  assert.equal(cost(data, thetas), 0);
  assert.equal(rmse(data, thetas), 0);
  assert.equal(mae(data, thetas), 0);
  assert.equal(r2(data, thetas), 1);
});

test('errors of 3 on every sample', () => {
  const thetas = { theta0: 13, theta1: 2 };
  assert.equal(cost(data, thetas), 9 / 2);
  assert.equal(rmse(data, thetas), 3);
  assert.equal(mae(data, thetas), 3);
});

test('predicting the mean price explains nothing', () => {
  assert.equal(r2(data, { theta0: mean([10, 12, 14]), theta1: 0 }), 0);
});

test('r2 on constant prices', () => {
  const flat = [
    { km: 0, price: 5 },
    { km: 1, price: 5 },
  ];
  assert.equal(r2(flat, { theta0: 5, theta1: 0 }), 1);
  assert.equal(r2(flat, { theta0: 6, theta1: 0 }), 0);
});

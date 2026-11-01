import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDataset } from '../core/parseDataset.ts';

test('parses samples and skips blank lines', () => {
  assert.deepEqual(parseDataset('km,price\r\n240000,3650\n\n139800,3800\n'), [
    { km: 240000, price: 3650 },
    { km: 139800, price: 3800 },
  ]);
});

test('accepts a header in any case', () => {
  assert.equal(parseDataset('KM,Price\n1,2').length, 1);
});

test('rejects a wrong header', () => {
  assert.throws(() => parseDataset('mileage,price\n1,2'), /line 1: expected header/);
});

test('rejects a line with a wrong field count', () => {
  assert.throws(() => parseDataset('km,price\n1,2,3'), /line 2: expected 2 fields, got 3/);
});

test('rejects a non numeric or empty field', () => {
  assert.throws(() => parseDataset('km,price\n1,abc'), /line 2: invalid price "abc"/);
  assert.throws(() => parseDataset('km,price\n,2'), /line 2: invalid km ""/);
  assert.throws(() => parseDataset('km,price\nInfinity,2'), /invalid km/);
});

test('rejects a negative mileage', () => {
  assert.throws(() => parseDataset('km,price\n-1,2'), /km must not be negative/);
});

test('rejects a dataset without samples', () => {
  assert.throws(() => parseDataset('km,price\n\n'), /dataset is empty/);
});

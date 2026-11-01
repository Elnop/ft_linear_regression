import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseMileage } from '../core/parseMileage.ts';

test('accepts non-negative integers and decimals', () => {
  assert.equal(parseMileage('100000'), 100000);
  assert.equal(parseMileage(' 0 '), 0);
  assert.equal(parseMileage('1234.5'), 1234.5);
});

test('rejects signs, exponents and garbage', () => {
  for (const text of ['', '-1', '+1', '1e5', '.5', '1.', 'abc', '1 000', '1,5']) {
    assert.equal(parseMileage(text), null, text);
  }
});

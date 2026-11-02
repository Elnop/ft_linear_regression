import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectCanSkip } from '@/features/dashboard/shared/lib/animationPlaybackSelectors.ts';

const state = (phase: 'idle' | 'title' | 'descent' | 'interactive', trainingActive = false) => ({ phase, visiblePoints: 0, trainingActive, painted: true });

test('skipping is possible during the intro and during a training', () => {
  assert.equal(selectCanSkip(state('idle')), false);
  assert.equal(selectCanSkip(state('title')), true);
  assert.equal(selectCanSkip(state('descent')), true);
  assert.equal(selectCanSkip(state('interactive')), false);
  assert.equal(selectCanSkip(state('interactive', true)), true);
});

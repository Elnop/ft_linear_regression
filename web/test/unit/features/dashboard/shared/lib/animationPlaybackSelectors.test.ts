import { expect, test } from 'vitest';
import { selectCanSkip } from '@/features/dashboard/shared/lib/animationPlaybackSelectors.ts';

function state(phase: 'idle' | 'title' | 'descent' | 'interactive', trainingActive = false) {
  return { phase, visiblePoints: 0, trainingActive, painted: true };
}

test('skipping is possible during the intro and during a training', () => {
  expect(selectCanSkip(state('idle'))).toBe(false);
  expect(selectCanSkip(state('title'))).toBe(true);
  expect(selectCanSkip(state('descent'))).toBe(true);
  expect(selectCanSkip(state('interactive'))).toBe(false);
  expect(selectCanSkip(state('interactive', true))).toBe(true);
});

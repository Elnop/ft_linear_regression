import { describe, expect, it } from 'vitest';
import { TEXT_STEPS, TYPE_SCALE } from '@/shared/configs/TypeScaleConfig.ts';
import { fluidClamp, textSize } from '@/shared/lib/typeScale.ts';

const steps = TEXT_STEPS;

function evaluate(css: string, viewportWidth: number, rem: number): number {
  const match = /^clamp\(([\d.]+)rem, ([\d.]+)vw \+ ([\d.]+)rem, ([\d.]+)rem\)$/.exec(css);
  if (!match) throw new Error(`unexpected clamp: ${css}`);
  const [min = NaN, vw = NaN, offset = NaN, max = NaN] = match.slice(1).map(Number);
  return Math.min(Math.max(min * rem, (vw / 100) * viewportWidth + offset * rem), max * rem);
}

describe('typeScale', () => {
  it('textSize equals min at 320 and max at 1920 for every step', () => {
    for (const step of steps) {
      expect(textSize(step, 320, 16)).toBeCloseTo(TYPE_SCALE[step].min, 6);
      expect(textSize(step, 1920, 16)).toBeCloseTo(TYPE_SCALE[step].max, 6);
    }
    expect(textSize('md', 200, 16)).toBe(16);
    expect(textSize('md', 3000, 16)).toBe(20);
  });

  it('textSize scales with the root size', () => {
    // The vw term does not follow the root size, so the proportion is exact on the clamped bounds.
    for (const width of [200, 3000]) {
      expect(textSize('base', width, 20)).toBeCloseTo(textSize('base', width, 16) * 1.25, 9);
    }
  });

  it('fluidClamp matches textSize', () => {
    for (const step of steps) {
      expect(evaluate(fluidClamp(step), 1000, 16)).toBeCloseTo(textSize(step, 1000, 16), 3);
    }
  });

  it('every step can double under zoom (WCAG 1.4.4)', () => {
    for (const step of steps) {
      for (let width = 320; width <= 3840; width += 80) {
        expect(5 * textSize(step, width / 5, 16)).toBeGreaterThanOrEqual(2 * textSize(step, width, 16));
      }
    }
  });

  it('the floor is 0.75rem', () => {
    expect(Math.min(...Object.values(TYPE_SCALE).map((s) => s.min))).toBeGreaterThanOrEqual(12);
  });

  it('a 17px scrollbar moves a size by less than 0.5px', () => {
    for (const step of steps) {
      expect(textSize(step, 1920, 16) - textSize(step, 1903, 16)).toBeLessThan(0.5);
    }
  });
});

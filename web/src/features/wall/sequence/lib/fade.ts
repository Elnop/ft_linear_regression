import { STYLE } from '@/features/wall/sequence/configs/StyleConfig.ts';

export function fadeGray(age: number): number {
  return age <= 0 ? 0 : 1;
}

export function fadeOpacity(age: number): number {
  return age <= 0 ? 1 : STYLE.fadeFloor + (1 - STYLE.fadeFloor) * STYLE.fadeBase ** age;
}

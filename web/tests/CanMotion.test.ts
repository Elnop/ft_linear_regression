import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CanMotion } from '@/features/graffiti/features/spray-can/lib/CanMotion.ts';

const CAN_WIDTH = 100;
const FLOOR = 800;
const nozzle = { x: 400, y: 300, color: '#ff2bd6', active: 1 };

function steps(motion: CanMotion, seconds: number, active: typeof nozzle | null) {
  let pose = motion.step(0, active, CAN_WIDTH, FLOOR);
  for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 60) pose = motion.step(1 / 60, active, CAN_WIDTH, FLOOR);
  return pose;
}

test('the can follows the nozzle while it sprays', () => {
  const pose = steps(new CanMotion(1200, 240), 1, nozzle);
  assert.equal(pose.spraying, true);
  assert.equal(pose.color, nozzle.color);
  assert.ok(Math.abs(pose.x - (nozzle.x + CAN_WIDTH * 0.36)) < 2);
  assert.ok(Math.abs(pose.y - (nozzle.y - CAN_WIDTH * 0.1)) < 2);
});

test('an idle can falls below the floor and stops there', () => {
  const motion = new CanMotion(1200, 240);
  steps(motion, 1, nozzle);
  const resting = steps(motion, 2, null);
  assert.ok(resting.y < FLOOR);
  const fallen = steps(motion, 5, null);
  assert.equal(fallen.spraying, false);
  assert.ok(fallen.y >= FLOOR + CAN_WIDTH * 3);
  assert.ok(fallen.y < FLOOR + CAN_WIDTH * 3 + 200);
});

test('a fallen can comes back when the nozzle sprays again', () => {
  const motion = new CanMotion(1200, 240);
  steps(motion, 6, null);
  const pose = steps(motion, 1, nozzle);
  assert.ok(Math.abs(pose.y - (nozzle.y - CAN_WIDTH * 0.1)) < 2);
});

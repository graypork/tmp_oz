import test from 'node:test';
import assert from 'node:assert/strict';
import { clientToNormalized, clampPoint } from '../src/game/coordinates.ts';

test('client coordinates normalize independent of rendered size', () => {
  const p = clientToNormalized(300, 250, { left: 100, top: 50, width: 400, height: 400 });
  assert.deepEqual(p, { x: 0.5, y: 0.5 });
});

test('normalized point is clamped to image bounds', () => {
  assert.deepEqual(clampPoint({ x: -0.2, y: 1.3 }), { x: 0, y: 1 });
});

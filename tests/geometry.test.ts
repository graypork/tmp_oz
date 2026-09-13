import test from 'node:test';
import assert from 'node:assert/strict';
import { pointInPolygonInclusive, polygonCentroid } from '../src/game/geometry.ts';

const square = [
  { x: 0.2, y: 0.2 },
  { x: 0.8, y: 0.2 },
  { x: 0.8, y: 0.8 },
  { x: 0.2, y: 0.8 },
];

test('point inside polygon is accepted', () => {
  assert.equal(pointInPolygonInclusive({ x: 0.5, y: 0.5 }, square), true);
});

test('point on polygon edge is accepted', () => {
  assert.equal(pointInPolygonInclusive({ x: 0.2, y: 0.5 }, square), true);
});

test('point on polygon vertex is accepted', () => {
  assert.equal(pointInPolygonInclusive({ x: 0.2, y: 0.2 }, square), true);
});

test('point immediately outside polygon is rejected', () => {
  assert.equal(pointInPolygonInclusive({ x: 0.199, y: 0.5 }, square), false);
});

test('centroid of square is centered', () => {
  const c = polygonCentroid(square);
  assert.ok(Math.abs(c.x - 0.5) < 1e-9);
  assert.ok(Math.abs(c.y - 0.5) < 1e-9);
});

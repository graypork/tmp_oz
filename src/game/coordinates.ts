import type { Point } from './geometry.ts';

export type RectLike = { left: number; top: number; width: number; height: number };

export function clientToNormalized(clientX: number, clientY: number, rect: RectLike): Point {
  return {
    x: (clientX - rect.left) / rect.width,
    y: (clientY - rect.top) / rect.height,
  };
}

export function clampPoint(point: Point): Point {
  return {
    x: Math.min(1, Math.max(0, point.x)),
    y: Math.min(1, Math.max(0, point.y)),
  };
}

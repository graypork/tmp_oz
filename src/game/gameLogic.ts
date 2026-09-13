import type { AnswerArea } from '../types.ts';
import type { Point } from './geometry.ts';
import { pointInPolygonInclusive } from './geometry.ts';

export type PointerResolution =
  | { kind: 'new-correct'; answer: AnswerArea }
  | { kind: 'already-found'; answer: AnswerArea }
  | { kind: 'wrong' };

export function resolvePointer(point: Point, answers: AnswerArea[], foundIds: Set<string>): PointerResolution {
  const answer = answers.find((candidate) => pointInPolygonInclusive(point, candidate.polygon));
  if (!answer) return { kind: 'wrong' };
  if (foundIds.has(answer.id)) return { kind: 'already-found', answer };
  return { kind: 'new-correct', answer };
}

export function shouldConfirmAdvance(foundCount: number, totalAnswers: number): boolean {
  return totalAnswers > 0 && foundCount < totalAnswers;
}

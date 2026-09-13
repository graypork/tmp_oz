import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePointer, shouldConfirmAdvance } from '../src/game/gameLogic.ts';
import type { AnswerArea } from '../src/types.ts';

const answer: AnswerArea = {
  id: 'a1',
  label: 'sample',
  polygon: [
    { x: 0.2, y: 0.2 },
    { x: 0.8, y: 0.2 },
    { x: 0.8, y: 0.8 },
    { x: 0.2, y: 0.8 },
  ],
  leftMarker: { x: 0.5, y: 0.5 },
  rightMarker: { x: 0.5, y: 0.5 },
};

test('new answer hit is reported as correct', () => {
  assert.deepEqual(resolvePointer({ x: 0.5, y: 0.5 }, [answer], new Set()), { kind: 'new-correct', answer });
});

test('touching an already found answer is not treated as wrong', () => {
  assert.deepEqual(resolvePointer({ x: 0.5, y: 0.5 }, [answer], new Set(['a1'])), { kind: 'already-found', answer });
});

test('touching outside all answers is wrong', () => {
  assert.deepEqual(resolvePointer({ x: 0.05, y: 0.05 }, [answer], new Set()), { kind: 'wrong' });
});

test('advancing before all configured answers are found requires confirmation', () => {
  assert.equal(shouldConfirmAdvance(2, 5), true);
});

test('advancing after all answers are found does not require confirmation', () => {
  assert.equal(shouldConfirmAdvance(5, 5), false);
});

test('a round with no configured answers can be advanced without confirmation', () => {
  assert.equal(shouldConfirmAdvance(0, 0), false);
});

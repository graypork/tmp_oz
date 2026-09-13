import test from 'node:test';
import assert from 'node:assert/strict';
import { addFoundAnswer, createFoundState, previousGamePosition } from '../src/game/session.ts';

test('found answers are preserved independently per round', () => {
  const initial = createFoundState(2);
  const afterRoundOne = addFoundAnswer(initial, 0, 'r1-a');
  const afterRoundTwo = addFoundAnswer(afterRoundOne, 1, 'r2-a');

  assert.deepEqual([...afterRoundTwo[0]], ['r1-a']);
  assert.deepEqual([...afterRoundTwo[1]], ['r2-a']);
});

test('adding an answer does not mutate previous progress state', () => {
  const initial = createFoundState(2);
  const next = addFoundAnswer(initial, 0, 'r1-a');

  assert.equal(initial[0].size, 0);
  assert.equal(next[0].has('r1-a'), true);
});

test('previous from first round goes to start screen', () => {
  assert.deepEqual(previousGamePosition(0), { stage: 'start', roundIndex: 0 });
});

test('previous from later round goes to prior round', () => {
  assert.deepEqual(previousGamePosition(1), { stage: 'game', roundIndex: 0 });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { adjustTimerSeconds, clampTimerSeconds, formatSeconds, isCountdownWarningSecond } from '../src/game/time.ts';

test('formats three minutes', () => assert.equal(formatSeconds(180), '3:00'));
test('formats two minutes', () => assert.equal(formatSeconds(120), '2:00'));
test('formats one minute', () => assert.equal(formatSeconds(60), '1:00'));
test('pads seconds', () => assert.equal(formatSeconds(9), '0:09'));
test('formats zero', () => assert.equal(formatSeconds(0), '0:00'));

test('adjusts timer upward in 30 second steps', () => {
  assert.equal(adjustTimerSeconds(180, 30), 210);
});

test('adjusts timer downward in 30 second steps', () => {
  assert.equal(adjustTimerSeconds(180, -30), 150);
});

test('does not go below 30 seconds', () => {
  assert.equal(adjustTimerSeconds(30, -30), 30);
  assert.equal(clampTimerSeconds(0), 30);
});

test('does not go above 10 minutes', () => {
  assert.equal(adjustTimerSeconds(600, 30), 600);
  assert.equal(clampTimerSeconds(999), 600);
});


test('countdown warning beeps only from 10 through 1 seconds', () => {
  assert.equal(isCountdownWarningSecond(11), false);
  assert.equal(isCountdownWarningSecond(10), true);
  assert.equal(isCountdownWarningSecond(5), true);
  assert.equal(isCountdownWarningSecond(1), true);
  assert.equal(isCountdownWarningSecond(0), false);
});

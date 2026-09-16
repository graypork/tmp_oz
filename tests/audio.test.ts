import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNTDOWN_BEEP_VOLUME,
  TIME_UP_BEEP_VOLUME,
  createTimeUpBeepSchedule,
} from '../src/game/audio.ts';

test('countdown and time-up beeps are 125 percent of previous volume', () => {
  assert.equal(COUNTDOWN_BEEP_VOLUME, 0.15);
  assert.equal(TIME_UP_BEEP_VOLUME, 0.1625);
});

test('time-up sound is five groups of five beeps', () => {
  const schedule = createTimeUpBeepSchedule();

  assert.equal(schedule.length, 25);
  for (let group = 0; group < 5; group += 1) {
    const groupStart = group * 5;
    const groupBeepTimes = schedule.slice(groupStart, groupStart + 5);
    assert.equal(groupBeepTimes.length, 5);

    for (let index = 1; index < groupBeepTimes.length; index += 1) {
      assert.ok(groupBeepTimes[index] - groupBeepTimes[index - 1] <= 0.12);
    }

    if (group < 4) {
      const currentGroupLast = schedule[groupStart + 4];
      const nextGroupFirst = schedule[groupStart + 5];
      assert.ok(nextGroupFirst - currentGroupLast >= 0.2);
    }
  }
});

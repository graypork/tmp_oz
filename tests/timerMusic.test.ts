import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TIMER_MUSIC_DIMMED_VOLUME,
  TIMER_MUSIC_NORMAL_VOLUME,
  getTimerMusicVolume,
  shouldLoopTimerMusic,
} from '../src/game/timerMusic.ts';

test('timer music loops only when timer is longer than the track', () => {
  assert.equal(shouldLoopTimerMusic(180, 184.6), false);
  assert.equal(shouldLoopTimerMusic(184.6, 184.6), false);
  assert.equal(shouldLoopTimerMusic(210, 184.6), true);
});

test('timer music gets quieter during the final ten seconds', () => {
  assert.equal(getTimerMusicVolume(11), TIMER_MUSIC_NORMAL_VOLUME);
  assert.equal(getTimerMusicVolume(10), TIMER_MUSIC_DIMMED_VOLUME);
  assert.equal(getTimerMusicVolume(1), TIMER_MUSIC_DIMMED_VOLUME);
  assert.equal(getTimerMusicVolume(0), 0);
});

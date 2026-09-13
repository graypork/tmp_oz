import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSeconds } from '../src/game/time.ts';

test('formats two minutes', () => assert.equal(formatSeconds(120), '2:00'));
test('formats one minute', () => assert.equal(formatSeconds(60), '1:00'));
test('pads seconds', () => assert.equal(formatSeconds(9), '0:09'));
test('formats zero', () => assert.equal(formatSeconds(0), '0:00'));

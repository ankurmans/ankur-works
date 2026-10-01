import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoiceTurnDetector } from '../scripts/voice-turn-detector.js';

test('voice turn waits for speech and does not end on initial silence or a short pause', () => {
  const detector = createVoiceTurnDetector();
  assert.equal(detector.update(0.002, 0), false);
  assert.equal(detector.update(0.002, 2000), false);
  assert.equal(detector.update(0.04, 2100), false);
  assert.equal(detector.update(0.04, 2400), false);
  assert.equal(detector.heardSpeech(), true);
  assert.equal(detector.update(0.003, 3300), false);
  assert.equal(detector.update(0.04, 3400), false);
  assert.equal(detector.update(0.003, 4300), false);
  assert.equal(detector.update(0.003, 4500), true);
});

test('a brief noise burst does not count as a spoken turn', () => {
  const detector = createVoiceTurnDetector();
  assert.equal(detector.update(0.05, 0), false);
  assert.equal(detector.update(0.003, 100), false);
  assert.equal(detector.update(0.003, 2000), false);
  assert.equal(detector.heardSpeech(), false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { studioAt, INTRO_END } from '../src/studio.ts';

test('the scroll film begins at the autoplay rest pose and stays inside decoded media bounds', () => {
  const duration = 15.041667;
  assert.equal(studioAt(0, duration).videoTime, INTRO_END);
  let previous = INTRO_END;
  for (let i = 0; i <= 1000; i++) {
    const pose = studioAt(i / 1000, duration);
    assert.ok(pose.videoTime >= previous);
    assert.ok(pose.videoTime >= 0 && pose.videoTime < duration);
    previous = pose.videoTime;
  }
  assert.equal(studioAt(.65, duration).videoTime, studioAt(1, duration).videoTime);
});
test('reversing the scroll reproduces the exact media and image-reveal pose', () => {
  const positions = [0, .01, .15, .32, .45, .65, .76, .84, .97, 1];
  const forward = positions.map(p => studioAt(p));
  for (let i = positions.length - 1; i >= 0; i--) assert.deepEqual(studioAt(positions[i]), forward[i]);
});
test('headlines have distinct reading beats and contact controls wait for full reveal', () => {
  for (let i = 0; i <= 1000; i++) {
    const pose = studioAt(i / 1000);
    assert.ok(!(pose.introOpacity > 0 && pose.promiseOpacity > 0));
    if (pose.portalInteractive) assert.equal(pose.portalCopy, 1);
  }
  assert.equal(studioAt(.6).promiseOpacity, 1);
  assert.equal(studioAt(0).portalVisible, false);
  assert.equal(studioAt(1).portalInsetX, 0);
  assert.equal(studioAt(1).portalInsetY, 0);
});
test('short media cannot cause an out-of-range video seek', () => {
  for (const duration of [1, 3, 5, 15]) {
    for (const p of [-1, 0, .4, 1, 2]) {
      const time = studioAt(p, duration).videoTime;
      assert.ok(time >= 0 && time < duration);
    }
  }
});

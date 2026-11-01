import test from 'node:test';
import assert from 'node:assert/strict';
import { approachAt } from '../src/approach-motion.ts';

test('image transitions retain the full previous layer while growing at the same anchor', () => {
  for (const [p, i] of [[.37, 1], [.74, 2]]) {
    const pose = approachAt(p);
    assert.equal(pose[i - 1].imageScale, 1);
    assert.ok(pose[i].imageScale > .035 && pose[i].imageScale < 1);
    assert.ok(pose[i].backgroundOpacity > 0 && pose[i].backgroundOpacity < 1);
    assert.ok(pose[i].copyY > 0);
    assert.ok(pose[i - 1].copyY < 0);
  }
});
test('all chapters have an unobscured reading hold and one keyboard-accessible action', () => {
  for (const [p, i] of [[.18, 0], [.55, 1], [.93, 2]]) {
    const pose = approachAt(p);
    assert.equal(pose[i].copyOpacity, 1);
    assert.equal(pose[i].copyY, 0);
    assert.equal(pose[i].imageScale, 1);
    assert.equal(pose.filter(item => item.active).length, 1);
    assert.ok(pose[i].active);
  }
});
test('reverse scroll yields identical bounded states without accumulated transforms', () => {
  const points = Array.from({length: 501}, (_, i) => i / 500);
  const forward = points.map(approachAt);
  for (let i = 500; i >= 0; i--) {
    assert.deepEqual(approachAt(points[i]), forward[i]);
    for (const pose of forward[i]) {
      assert.ok(pose.imageScale > 0 && pose.imageScale <= 1);
      assert.ok(pose.backgroundOpacity >= 0 && pose.backgroundOpacity <= 1);
      assert.ok(pose.copyOpacity >= 0 && pose.copyOpacity <= 1);
    }
  }
  assert.deepEqual(approachAt(-1), approachAt(0));
  assert.deepEqual(approachAt(2), approachAt(1));
});

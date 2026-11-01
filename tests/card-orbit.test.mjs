import test from 'node:test';
import assert from 'node:assert/strict';
import { cardArc, sceneAt, openingAt, portfolioProgress, scrollStop, SCREENS, MOBILE_SCREENS, OPENING_END, ARRIVAL_END } from '../src/cinematic.ts';
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 1e-8, `${message}: ${a} vs ${b}`);

test('top-view card path has a constant radius and a tangent-aligned card plane', () => {
  for (const halfSpan of [42.9, 326.4, 489.6]) {
    const radius = halfSpan / Math.sin(Math.PI / 4);
    const centerZ = radius * Math.cos(Math.PI / 4);
    for (let i = 0; i <= 100; i++) {
      const pose = cardArc(i / 100, halfSpan);
      near(Math.hypot(pose.x, pose.z - centerZ), radius, 'circle radius');
      const yaw = pose.rotationY * Math.PI / 180;
      near(pose.x * Math.cos(yaw) - (pose.z - centerZ) * Math.sin(yaw), 0, 'radius perpendicular to card plane');
    }
  }
});

test('arc turns continuously between mirrored endpoints and recedes at its midpoint', () => {
  const start = cardArc(0, 300), middle = cardArc(.5, 300), end = cardArc(1, 300);
  near(start.x, 300, 'first position'); near(end.x, -300, 'second position');
  near(start.z, 0, 'first depth'); near(end.z, 0, 'second depth');
  near(start.rotationY, -45, 'first yaw'); near(end.rotationY, 45, 'second yaw');
  near(middle.x, 0, 'center'); near(middle.rotationY, 0, 'center yaw');
  assert.ok(middle.z < 0);
  let previous = -Infinity;
  for (let i = 0; i <= 100; i++) {
    const pose = cardArc(i / 100, 300);
    assert.ok(pose.rotationY >= previous); previous = pose.rotationY;
    const mirrored = cardArc(1 - i / 100, 300);
    near(pose.x, -mirrored.x, 'mirrored position'); near(pose.z, mirrored.z, 'mirrored depth');
  }
});

test('scroll reversal restores every sampled orbit pose without accumulated state', () => {
  const progress = [0, .07, .115, .16, .205, .24, .25, .29];
  const forward = progress.map(p => sceneAt(p, 1440, 900).portrait);
  for (let i = progress.length - 1; i >= 0; i--) assert.deepEqual(sceneAt(progress[i], 1440, 900).portrait, forward[i]);
});

test('second-to-third turn stays on the same circle and reveals the reverse face from the left', () => {
  for (const mobile of [false, true]) {
    const width = mobile ? 390 : 1440, height = mobile ? 844 : 900;
    const radius = width * (mobile ? .11 : .235) / Math.sin(Math.PI / 4);
    const centerZ = radius * Math.cos(Math.PI / 4);
    let lastYaw = 45;
    for (let i = 0; i <= 100; i++) {
      const p = .30 + .20 * i / 100;
      const {portrait, editor, framingOffset} = sceneAt(p, width, height, mobile);
      near(Math.hypot(portrait.x + framingOffset, portrait.z - centerZ), radius, 'continuation radius');
      near(portrait.x, editor.x, 'front/back x');
      near(portrait.z, editor.z, 'front/back z');
      near(portrait.rotationY - editor.rotationY, 180, 'reverse face normal');
      const portraitOffset = mobile ? height * .09 : 0;
      near(portrait.y + portraitOffset, editor.y + height * .06, 'shared world center');
      assert.ok(editor.x <= 1e-8, 'editor must remain on the left until centered');
      assert.ok(portrait.rotationY >= lastYaw - 1e-8, 'no direction reversal');
      assert.ok(portrait.opacity + editor.opacity === 1, 'one face visible');
      assert.ok(editor.scale > 0 && editor.scale <= 1);
      lastYaw = portrait.rotationY;
    }
    const settled = sceneAt(.5, width, height, mobile);
    near(settled.editor.x, 0, 'third pose centered');
    near(settled.editor.rotationY, 0, 'third pose upright');
    near(settled.portrait.rotationY, 180, 'front turned away');
    assert.equal(settled.portrait.opacity, 0);
    assert.equal(settled.editor.opacity, 1);
    const perspective = Math.max(1200, width * 1.6);
    near(settled.editor.scale * perspective / (perspective - settled.editor.z), 1, 'settled scale matches strip layer');
  }
});

// Project both horizontal corners, including perspective, rather than only
// checking the center: neither face may peek into view during the flip.
test('turnaround is wholly offscreen and returns from the left on desktop and phone', () => {
  for (const [width, height, mobile] of [[1440, 900, false], [390, 844, true]]) {
    const perspective = Math.max(1200, width * 1.6);
    let sawExit = false, sawReturn = false;
    for (let i = 0; i <= 400; i++) {
      const p = .30 + .20 * i / 400;
      const state = sceneAt(p, width, height, mobile);
      const face = state.portrait.opacity ? state.portrait : state.editor;
      const halfWidth = (state.portrait.opacity ? width * (mobile ? .65 : .38) : mobile ? width * .92 : Math.min(width * .82, height * 1.1)) / 2;
      const yaw = face.rotationY * Math.PI / 180;
      const right = Math.max(...[-halfWidth, halfWidth].map(localX => {
        const x = face.x + localX * face.scale * Math.cos(yaw);
        const z = face.z - localX * face.scale * Math.sin(yaw);
        return width / 2 + x * perspective / (perspective - z);
      }));
      if (state.portrait.rotationY >= 70 && state.portrait.rotationY <= 120) assert.ok(right < 0, `flip visible at ${p}: ${right}`);
      if (right < 0) sawExit = true;
      if (sawExit && right > 0 && state.editor.opacity) sawReturn = true;
      assert.deepEqual(sceneAt(p, width, height, mobile), state, 'reversing scroll restores the pose');
    }
    assert.ok(sawExit && sawReturn);
    near(sceneAt(.30, width, height, mobile).framingOffset, 0, 'start framing');
    near(sceneAt(.50, width, height, mobile).framingOffset, 0, 'end framing');
  }
});


test('opening reacts to the first pixel without a stationary scroll interval', () => {
  const start = openingAt(0);
  for (const pixels of [1, 10, 30, 80]) {
    const pose = openingAt(pixels / (900 * SCREENS));
    assert.ok(pose.posterZ < start.posterZ, 'dashboard recedes immediately');
    assert.ok(pose.bannerY < start.bannerY, 'banner leaves immediately');
    assert.ok(pose.backgroundY < start.backgroundY, 'backdrop moves immediately');
  }
  assert.ok(sceneAt(.001, 1440, 900).portrait.x < sceneAt(0, 1440, 900).portrait.x, 'avatar orbit has no initial hold');
  near(openingAt(OPENING_END).posterOpacity, 0, 'poster fully gone');
  near(openingAt(ARRIVAL_END).portfolioOpacity, 1, 'portfolio fully visible');
  near(portfolioProgress(scrollStop(.53)), .53, 'showcase navigation retains its scene pose');
  const samples = [0, .005, .04, .08, .12, .4, 1].map(p => openingAt(p));
  for (let i = samples.length - 1; i >= 0; i--) assert.deepEqual(openingAt([0, .005, .04, .08, .12, .4, 1][i]), samples[i]);
});


test('opening dashboard recedes monotonically into negative Z with a continuous fade', () => {
  let last = openingAt(0);
  for (let i = 1; i <= 120; i++) {
    const pose = openingAt(OPENING_END * i / 120);
    assert.ok(pose.posterZ < last.posterZ, 'always travels away from viewer');
    assert.ok(pose.posterOpacity <= last.posterOpacity, 'no flash or sudden reappearance');
    assert.ok(last.posterOpacity - pose.posterOpacity < .03, 'fade has no opacity jump');
    for (const perspective of [1200, 2035, 2304]) {
      const projectedScale = perspective / (perspective - pose.posterZ);
      assert.ok(projectedScale < perspective / (perspective - last.posterZ), 'perspective continuously shrinks the plane');
    }
    last = pose;
  }
  near(openingAt(0).openingBackgroundOpacity, 1, 'black/pink opening covers blue backdrop');
  near(openingAt(.20).openingBackgroundOpacity, 0, 'pink light fully faded');
  near(openingAt(ARRIVAL_END).openingVoidOpacity, 0, 'original background returns after arrival');
  near(last.posterOpacity, 0, 'receded dashboard completes its fade');
});


test('small scroll steps produce restrained depth and orbit changes at both viewport sizes', () => {
  for (const [width, height, screens, mobile] of [[1440, 900, SCREENS, false], [390, 844, MOBILE_SCREENS, true]]) {
    const oneStep = 100 / (height * screens);
    const pose = openingAt(oneStep);
    const perspective = Math.max(1200, width * 1.6);
    assert.ok(perspective / (perspective - pose.posterZ) > .94, '100px scroll shrinks opening less than 6%');
    assert.ok(pose.openingBackgroundOpacity < 1, 'light fades from first scroll');
    for (const sceneProgress of [.02, .08, .16, .2]) {
      const start = scrollStop(sceneProgress);
      const a = sceneAt(sceneProgress, width, height, mobile).portrait;
      const b = sceneAt(portfolioProgress(start + oneStep), width, height, mobile).portrait;
      assert.ok(Math.abs(a.rotationY - b.rotationY) < 6, '100px scroll rotates card less than six degrees');
    }
  }
});

test('next scene arrives fully before its orbit begins and its arrival has no hard jump', () => {
  let last = openingAt(.13);
  for (let i = 1; i <= 110; i++) {
    const p = .13 + .11 * i / 110;
    const pose = openingAt(p);
    assert.ok(pose.portfolioOpacity >= last.portfolioOpacity);
    assert.ok(pose.portfolioOpacity - last.portfolioOpacity < .02);
    assert.ok(pose.arrivalZ >= last.arrivalZ);
    near(portfolioProgress(p), 0, 'no revolving during arrival');
    last = pose;
  }
  near(last.arrivalZ, 0, 'arrival settled in depth');
  near(last.arrivalY, 0, 'arrival settled vertically');
  near(last.portfolioOpacity, 1, 'arrival fully visible');
  assert.ok(portfolioProgress(ARRIVAL_END + .001) > 0);
});


test('opening dashboard fades close to the screen instead of shrinking far into depth', () => {
  for (let i = 0; i <= 100; i++) {
    const pose = openingAt(OPENING_END * i / 100);
    assert.ok(pose.posterZ >= -260, 'retreat stays within 260px');
    for (const perspective of [1200, 2035, 2304]) {
      assert.ok(perspective / (perspective - pose.posterZ) > .82, 'dashboard keeps over 82% of its original width throughout fade');
    }
  }
});

test('whole avatar card enters from beyond the right edge, then joins the orbit', () => {
  for (const [width, height, mobile] of [[1440, 900, false], [390, 844, true]]) {
    let lastX = Infinity;
    for (let i = 0; i <= 110; i++) {
      const raw = .13 + .11 * i / 110;
      const arrival = openingAt(raw);
      const portrait = sceneAt(portfolioProgress(raw), width, height, mobile).portrait;
      const worldX = width / 2 + portrait.x + width * (mobile ? .85 : .65) * arrival.arrivalX;
      assert.ok(worldX <= lastX + 1e-8, 'entry moves continuously left from right');
      near(portrait.opacity, 1, 'card stays opaque during spatial entrance');
      if (i === 0) assert.ok(worldX - width * (mobile ? .4 : .3) > width, 'entire card starts beyond viewport including protruding avatar');
      lastX = worldX;
    }
    near(openingAt(ARRIVAL_END).arrivalX, 0, 'entry offset gone before orbit');
  }
});

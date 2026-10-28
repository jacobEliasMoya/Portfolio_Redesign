import { test } from "node:test";
import assert from "node:assert/strict";
import { easePulse, getPulseStrength, PULSE_TIMING as timing } from "../components/three/animation/letter-pulse.mjs";

test("the wave reaches inner particles before outer particles", () => {
  const inner = timing.startDelay + timing.sweep * 0.2;
  const outer = timing.startDelay + timing.sweep * 0.8;
  assert.ok(getPulseStrength(inner, 0, 0.2) > getPulseStrength(inner, 0, 0.8));
  assert.ok(getPulseStrength(outer, 0, 0.8) > getPulseStrength(outer, 0, 0.2));
});
test("J, A, K, E peak in order with neighboring waves overlapping", () => {
  for (let letter = 0; letter < 4; letter++) {
    const time = timing.startDelay + letter * timing.letterInterval + timing.sweep * 0.5;
    for (let other = 0; other < 4; other++) assert.equal(getPulseStrength(time, other, 0.5) > 0.5, letter === other);
  }
  let overlapping = false;
  for (let t = 0; t < 20; t += 0.01) {
    const active = [0, 1, 2, 3].filter((i) => getPulseStrength(t, i, 0.5) > 0);
    assert.ok(active.length <= 2);
    if (active.length === 2) { overlapping = true; assert.equal(active[1] - active[0], 1); }
  }
  assert.ok(overlapping, "neighboring letters should flow into each other");
});
test("the sequence rests, then repeats", () => {
  const restTime = timing.startDelay + timing.letterInterval * (timing.letters - 1) + timing.sweep + timing.rest / 2;
  assert.ok([0, 1, 2, 3].every((i) => getPulseStrength(restTime, i, 0.5) === 0));
  const cycle = timing.letterInterval * (timing.letters - 1) + timing.sweep + timing.rest;
  const time = timing.startDelay + timing.sweep * 0.5;
  assert.ok(Math.abs(getPulseStrength(time, 0, 0.5) - getPulseStrength(time + cycle, 0, 0.5)) < 1e-10);
});
test("reduced motion softens brightness; invalid inputs stay inert", () => {
  const time = timing.startDelay + timing.sweep * 0.5;
  assert.ok(getPulseStrength(time, 0, 0.5, true) <= 0.18);
  assert.equal(getPulseStrength(-1, 0, 0.5), 0);
  assert.equal(getPulseStrength(time, 4, 0.5), 0);
  assert.equal(getPulseStrength(NaN, 0, 0.5), 0);
});

test("recovery eases back instead of snapping when the wave passes", () => {
  const first = easePulse(1, 0, 1 / 60);
  assert.ok(first > 0.9 && first < 1);
  let strength = 1;
  for (let frame = 0; frame < 60; frame++) {
    const next = easePulse(strength, 0, 1 / 60);
    assert.ok(next >= 0 && next < strength);
    strength = next;
  }
  assert.ok(strength < 0.05);
  assert.ok(easePulse(0, 1, 1 / 60) > 1 - first);
});

test("settling is consistent across frame rates and does not overshoot", () => {
  const settle = (fps) => { let strength = 1; for (let i = 0; i < fps; i++) strength = easePulse(strength, 0, 1 / fps); return strength; };
  assert.ok(Math.abs(settle(30) - settle(120)) < 1e-10);
  assert.ok(easePulse(0, 1, 0.1) <= 1);
  assert.equal(easePulse(0.5, 0, 0), 0.5);
});


test("longer names pulse through their final character before repeating", () => {
  const letters = 11;
  const time = timing.startDelay + (letters - 1) * timing.letterInterval + timing.sweep * 0.5;
  assert.ok(getPulseStrength(time, letters - 1, 0.5, false, letters) > 0.5);
  assert.equal(getPulseStrength(time, letters, 0.5, false, letters), 0);
  assert.equal(getPulseStrength(time, 0, 0.5, false, letters), 0);
});

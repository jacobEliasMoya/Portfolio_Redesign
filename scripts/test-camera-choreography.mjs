import { test } from "node:test";
import assert from "node:assert/strict";
import { getCameraPose } from "../components/three/animation/camera-choreography.mjs";
import { EARLIEST_TRANSITION, INTRO_TIMING } from "../components/three/animation/loading-intro.mjs";
const distance = (a, b) => Math.hypot(...a.map((n, i) => n - b[i]));
test("camera stays continuous at transition boundaries and settles home", () => {
  const start = EARLIEST_TRANSITION;
  const boundaries = [start, start + INTRO_TIMING.scatter, start + INTRO_TIMING.scatter + INTRO_TIMING.gather];
  for (const t of boundaries) {
    const before = getCameraPose(t - 0.00001, t <= start ? null : start);
    const after = getCameraPose(t + 0.00001, start);
    assert.ok(distance(before.position, after.position) < 0.001);
    assert.ok(distance(before.target, after.target) < 0.001);
  }
  assert.deepEqual(getCameraPose(100, start), { position: [0, 0, 12], target: [0, 0, 0] });
});
test("camera visits every letter close-up before revealing the full word", () => {
  const shots = Array.from({ length: 7 }, (_, i) => ({ position: [i - 3, 0, 2], target: [i - 3, 0, 0] }));
  for (let i = 0; i < shots.length; i++) {
    const t = INTRO_TIMING.start + i * INTRO_TIMING.letterStep + 0.5;
    const pose = getCameraPose(t, null, false, shots);
    assert.ok(distance(pose.position, shots[i].position) < 1e-9);
    assert.ok(distance(pose.target, shots[i].target) < 1e-9);
  }
  assert.deepEqual(getCameraPose(EARLIEST_TRANSITION, null, false, shots), { position: [0, 0, 12], target: [0, 0, 0] });
  for (let t = 0; t < EARLIEST_TRANSITION; t += 0.01) {
    const a = getCameraPose(t, null, false, shots);
    const b = getCameraPose(t + 0.00001, null, false, shots);
    assert.ok(distance(a.position, b.position) < 0.01);
    assert.equal(a.position[0], a.target[0]);
    assert.equal(a.position[1], a.target[1]);
  }
});
test("reduced motion holds the same camera throughout every stage", () => {
  for (const t of [0, 1, 3, 4, 6, 100]) assert.deepEqual(getCameraPose(t, EARLIEST_TRANSITION, true), { position: [0, 0, 12], target: [0, 0, 0] });
});

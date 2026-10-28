import { test } from "node:test";
import assert from "node:assert/strict";
import { getTextOrbitAngle, orbitTextPoint } from "../components/three/animation/text-orbit.mjs";
test("text orbits clockwise about Earth while preserving radius and height", () => {
  const start = [0, -0.4, 0.6];
  const end = orbitTextPoint(start, -Math.PI / 2);
  assert.ok(end[0] < 0);
  assert.equal(end[1], start[1]);
  assert.ok(Math.abs(Math.hypot(end[0], end[2] + 9) - 9.6) < 1e-10);
  const full = orbitTextPoint(start, -2 * Math.PI);
  assert.ok(Math.hypot(...full.map((v, i) => v - start[i])) < 1e-10);
});
test("orbit starts softly and reaches steady clockwise speed", () => {
  assert.equal(getTextOrbitAngle(0), 0);
  assert.ok(Math.abs(getTextOrbitAngle(.01)) < .00001);
  assert.ok(getTextOrbitAngle(10) < getTextOrbitAngle(5));
  assert.ok(Math.abs(getTextOrbitAngle(100) - getTextOrbitAngle(99) + .18) < 1e-10);
  assert.equal(getTextOrbitAngle(NaN), 0);
});

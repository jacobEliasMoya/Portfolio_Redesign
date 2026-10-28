import { test } from "node:test";
import assert from "node:assert/strict";
import { getOceanRipple } from "../components/three/planet/ocean-ripple.mjs";
test("ocean crest travels outward continuously and stays bounded", () => {
  const inner = 0.4, outer = 1.4;
  const first = inner * 3.5 / 1.35, later = outer * 3.5 / 1.35;
  assert.ok(getOceanRipple(first, inner) > getOceanRipple(first, outer));
  assert.ok(getOceanRipple(later, outer) > getOceanRipple(later, inner));
  for (let t = 0; t < 20; t += 0.01) {
    const value = getOceanRipple(t, outer);
    assert.ok(value >= 0 && value <= 1);
    assert.ok(Math.abs(value - getOceanRipple(t + 0.001, outer)) < 0.01);
  }
  assert.equal(getOceanRipple(NaN, outer), 0);
});

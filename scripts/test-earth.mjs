import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const earth = JSON.parse(readFileSync(new URL("../public/models/earth/block-earth.json", import.meta.url)));
const count = earth.sizes.length;
test("Earth asset fits its budget with finite aligned cube transforms", () => {
  assert.ok(count > 10000 && count <= 30000);
  for (const key of ["positions", "normals", "colors"]) assert.equal(earth[key].length, count * 3);
  const sides = new Set();
  for (let i = 0; i < count; i++) {
    const p = earth.positions.slice(i * 3, i * 3 + 3), n = earth.normals.slice(i * 3, i * 3 + 3);
    assert.ok([...p, ...n, earth.sizes[i]].every(Number.isFinite));
    const r = Math.hypot(...p);
    assert.ok(r > 2.7 && r < 3.6);
    assert.ok(Math.abs(Math.hypot(...n) - 1) < 0.00001);
    assert.ok(p.every((value, axis) => Math.abs(value / r - n[axis]) < 0.00001));
    const axis = n.map(Math.abs).indexOf(Math.max(...n.map(Math.abs)));
    sides.add(`${axis}:${Math.sign(n[axis])}`);
  }
  assert.equal(sides.size, 6);
  assert.ok(Math.max(...earth.sizes) / Math.min(...earth.sizes) > 3);
});
test("real-map Himalayan relief rises above the central Pacific", () => {
  const region = (lon, lat) => {
    const l = lon * Math.PI / 180, a = lat * Math.PI / 180;
    const direction = [Math.sin(l) * Math.cos(a), Math.sin(a), Math.cos(l) * Math.cos(a)];
    let max = 0;
    for (let i = 0; i < count; i++) {
      const n = earth.normals.slice(i * 3, i * 3 + 3);
      if (n.reduce((sum, value, axis) => sum + value * direction[axis], 0) > Math.cos(6 * Math.PI / 180)) max = Math.max(max, Math.hypot(...earth.positions.slice(i * 3, i * 3 + 3)));
    }
    return max;
  };
  assert.ok(region(85, 30) > region(-140, 0) + 0.2);
});

test("water mask selects only blue ocean tiles for animation", () => {
  assert.equal(earth.oceanMask.length, count);
  const water = earth.oceanMask.flatMap((value, i) => value ? [i] : []);
  assert.ok(water.length > 1000 && water.length < count);
  for (const i of water) { assert.equal(earth.elevations[i], 0); assert.ok(earth.colors[i * 3 + 2] > earth.colors[i * 3 + 1]); }
});

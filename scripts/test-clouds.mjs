import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCloudLayer, buildCloudShape } from "../components/three/clouds/cloud-shapes.mjs";
test("all four cloud sculptures are repeatable, distinct and finite", () => {
  const shapes = new Set();
  for (const variant of ["billow","wisp","bank","spiral"]) {
    const blocks = buildCloudShape(variant,91);
    assert.deepEqual(blocks,buildCloudShape(variant,91));
    assert.ok(blocks.length > 50 && blocks.length < 1000);
    shapes.add(JSON.stringify(blocks));
    for (const b of blocks) assert.ok([...b.position,b.size,b.shade].every(Number.isFinite) && b.size > 0 && b.size < .5);
  }
  assert.equal(shapes.size,4);
});
test("small low clouds stay above the base globe while allowing mountain intersections", () => {
  const blocks = buildCloudLayer();
  assert.ok(blocks.every(b=>b.variant==="billow"||b.variant==="bank"));
  assert.ok(blocks.length > 500 && blocks.length < 9000);
  assert.ok(blocks.some((b) => Math.hypot(...b.position) < 3.3), "low clouds should enter the mountain height range");
  assert.ok(Math.max(...blocks.map((b) => b.size)) < .08, "cloud blocks should remain small");
  for (const b of blocks) {
    const r = Math.hypot(...b.position);
    assert.ok(r-b.size*Math.sqrt(3)/2 > 3.1, "cloud cube should clear the base globe");
    assert.ok(r+b.size*Math.sqrt(3)/2 < 3.5, "cloud should stay near Earth");
    assert.ok(Math.abs(Math.asin(b.position[1]/r)) > .3, "keep the equatorial text band open");
    assert.ok(Math.abs(Math.hypot(...b.normal)-1)<1e-10);
  }
});

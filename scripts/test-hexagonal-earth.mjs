import { test } from "node:test";
import assert from "node:assert/strict";
import { createHexagonalEarthGeometry } from "../components/three/planet/hexagonal-earth-geometry.mjs";
test("Earth tile has six sides, radial depth and unit bounds", () => {
  const geometry = createHexagonalEarthGeometry();
  const points = geometry.parameters.shapes.getPoints();
  assert.equal(new Set(points.map((p)=>`${p.x.toFixed(6)},${p.y.toFixed(6)}`)).size,6);
  const box = geometry.boundingBox;
  for (const axis of ["x","y","z"]) {
    assert.ok(Math.abs(box.max[axis]-.5)<1e-6);
    assert.ok(Math.abs(box.min[axis]+.5)<1e-6);
  }
  assert.ok([...geometry.attributes.position.array].every(Number.isFinite));
  // Cap outline is a regular hexagon before normalization and beveling.
  const r = points[0].length();
  assert.ok(points.every((p)=>Math.abs(p.length()-r)<1e-10));
  geometry.dispose();
});

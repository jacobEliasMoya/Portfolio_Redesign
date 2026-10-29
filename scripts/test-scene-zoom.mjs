import { test } from "node:test";
import assert from "node:assert/strict";
import { clampZoom, zoomCameraZ } from "../components/three/animation/scene-zoom.mjs";
test("zoom moves in/out around Earth and stays outside terrain", () => {
  assert.equal(zoomCameraZ(12,0),12);
  assert.ok(zoomCameraZ(12,-.2)<12);
  assert.ok(zoomCameraZ(12,.2)>12);
  assert.ok(zoomCameraZ(12,-100)>3);
  assert.ok(zoomCameraZ(12,100)<34);
  assert.equal(clampZoom(-100),clampZoom(-.55));
});

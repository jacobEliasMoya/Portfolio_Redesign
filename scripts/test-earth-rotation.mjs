import { test } from "node:test";
import assert from "node:assert/strict";
import { Quaternion, Vector3 } from "three";
import { applyEarthDrag, EARTH_AXIAL_TILT } from "../components/three/planet/earth-rotation.mjs";
test("Earth drag supports pitch and yaw without quaternion drift", () => {
  const camera = new Quaternion();
  const yaw = applyEarthDrag(new Quaternion(), 100, 0, camera);
  const pitch = applyEarthDrag(new Quaternion(), 0, 100, camera);
  assert.ok(Math.abs(new Vector3(0,1,0).applyQuaternion(pitch).z) > .4);
  assert.ok(Math.abs(new Vector3(0,0,1).applyQuaternion(yaw).x) > .4);
  const orientation = new Quaternion();
  for (let i = 0; i < 10000; i++) applyEarthDrag(orientation, 3, -2, camera);
  assert.ok(Math.abs(orientation.length() - 1) < 1e-12);
});
test("tilted Earth spin preserves its own geographic axis", () => {
  const tilt = new Quaternion().setFromAxisAngle(new Vector3(0,0,1), EARTH_AXIAL_TILT);
  const pole = new Vector3(0,1,0).applyQuaternion(tilt);
  assert.ok(Math.abs(Math.acos(pole.y) - EARTH_AXIAL_TILT) < 1e-12);
  for (const angle of [0,1,2,4]) {
    const spin = new Quaternion().setFromAxisAngle(new Vector3(0,1,0), angle);
    assert.ok(new Vector3(0,1,0).applyQuaternion(tilt.clone().multiply(spin)).distanceTo(pole) < 1e-12);
  }
});

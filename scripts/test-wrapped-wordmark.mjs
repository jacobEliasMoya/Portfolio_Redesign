import { test } from "node:test";
import assert from "node:assert/strict";
import { wrapPoint, wrapDuration, wrapFormation } from "../components/three/animation/wrapped-wordmark.mjs";
test("wrapped text follows a sphere arc with continuous depth", () => {
  const radius = 9.6;
  for (const x of [-20,-10,0,10,20]) {
    const p = wrapPoint(x, 0, 0, .45, radius);
    assert.ok(Math.abs(Math.hypot(p[0], p[2] + 9) - radius) < 1e-9);
  }
  assert.ok(wrapPoint(10,0,0,.45,radius)[2] < wrapPoint(0,0,0,.45,radius)[2]);
});
test("one phrase converges sequentially and stays formed afterward", () => {
  const letters = 17;
  assert.equal(wrapFormation(0,0,0),0);
  assert.ok(wrapFormation(.8,0,0) > wrapFormation(.8,1,0));
  for (let i = 0; i < letters; i++) {
    assert.equal(wrapFormation(wrapDuration(letters),i,1),1);
    assert.equal(wrapFormation(100,i,1),1);
  }
  assert.equal(wrapFormation(0,16,1,true),1);
});

test("text orbit is centered at Earth height across the entire arc", () => {
  for (const x of [-20,-10,0,10,20]) assert.equal(wrapPoint(x,0,0,.45,9.6)[1],0.35);
});

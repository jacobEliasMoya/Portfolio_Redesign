import { test } from "node:test";
import assert from "node:assert/strict";
import { WRAP_TIMING, wrapPoint, wrapDuration, wrapFormation } from "../components/three/animation/wrapped-wordmark.mjs";
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

test("flat title holds after formation, wraps smoothly, and ends exactly", async()=>{
 const {titleWrapProgress,titleDuration}=await import("../components/three/animation/wrapped-wordmark.mjs");
 const end=wrapDuration(10);
 assert.equal(titleWrapProgress(end+WRAP_TIMING.hold*.9,10),0);
 assert.ok(titleWrapProgress(end+WRAP_TIMING.hold+WRAP_TIMING.bend*.5,10)>.49);
 assert.equal(titleWrapProgress(titleDuration(10),10),1);
 assert.equal(titleWrapProgress(0,10,true),1);
 const epsilon=.001;
 assert.ok(titleWrapProgress(end+WRAP_TIMING.hold+epsilon,10)<1e-7);
 assert.ok(1-titleWrapProgress(titleDuration(10)-epsilon,10)<1e-7);
});

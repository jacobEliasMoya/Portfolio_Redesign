import test from "node:test";
import assert from "node:assert/strict";
import {createFlight,stepFlight} from "../components/three/ufo/saucer-flight.mjs";
const idle={turn:0,pitch:0,thrust:0,strafe:0,lift:0,brake:false};
test("pitched thrust climbs and centered input holds heading",()=>{
 const s=createFlight();s.pitch=.5;s.yaw=.4;
 for(let i=0;i<120;i++)stepFlight(s,{...idle,thrust:1},1/60);
 assert.ok(s.position.y>1);assert.ok(s.position.z>1);assert.equal(s.pitch,.5);assert.equal(s.yaw,.4);
 const speed=s.velocity.length();for(let i=0;i<120;i++)stepFlight(s,idle,1/60);
 assert.ok(s.velocity.length()<speed*.12);
});
test("flight boundaries prevent entering Earth and remove inward velocity",()=>{
 const s=createFlight([0,0,5]);s.yaw=Math.PI;
 for(let i=0;i<600;i++)stepFlight(s,{...idle,thrust:1},1/60,{inner:4,outer:12});
 assert.ok(s.position.length()>=4-1e-8);assert.ok(s.position.length()<=12+1e-8);
});
test("turns bank, pitch is bounded and braking settles at different frame rates",()=>{
 const run=dt=>{const s=createFlight();for(let i=0;i<2/dt;i++)stepFlight(s,{...idle,turn:1,pitch:1,thrust:1},dt);assert.ok(Math.abs(s.pitch)<=.85);assert.ok(s.bank>0);for(let i=0;i<2/dt;i++)stepFlight(s,{...idle,brake:true},dt);assert.ok(s.velocity.length()<.0001);return s;};
 const a=run(1/60),b=run(1/120);assert.ok(a.position.distanceTo(b.position)<.1);
});

test("strafe and thrust lean toward local movement and ease level after braking",()=>{
 for(const yaw of [0,Math.PI/2,Math.PI])for(const sign of [-1,1]){
  const s=createFlight();s.yaw=yaw;
  for(let i=0;i<60;i++)stepFlight(s,{...idle,strafe:sign,thrust:sign},1/60);
  assert.ok(s.bank*sign>0);assert.ok(s.lean*sign>0);assert.equal(s.pitch,0);
  for(let i=0;i<180;i++)stepFlight(s,{...idle,brake:true},1/60);
  assert.ok(Math.abs(s.bank)<.001);assert.ok(Math.abs(s.lean)<.001);
 }
});

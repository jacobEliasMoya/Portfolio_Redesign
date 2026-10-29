import test from "node:test";
import assert from "node:assert/strict";
import {createFlight,setFlightAttitude,stepFlight} from "../components/three/ufo/saucer-flight.mjs";
import {Euler,Quaternion,Vector3} from "three";
const idle={turn:0,pitch:0,thrust:0,strafe:0,lift:0,brake:false};

test("ascend and descend follow craft up through upright, inverted and sideways orientations",()=>{
 for(const roll of [0,Math.PI/2,Math.PI,-Math.PI/2])for(const lift of [-1,1])for(const yaw of [0,.7]){
  const s=createFlight();s.roll=roll;s.yaw=yaw;s.pitch=.3;
  const expected=new Vector3(0,lift,0).applyQuaternion(new Quaternion().setFromEuler(new Euler(-s.pitch,s.yaw,s.roll,"YXZ")));
  stepFlight(s,{...idle,lift},1/60);
  assert.ok(s.velocity.clone().normalize().dot(expected)>.999999);
 }
 const upsideDown=createFlight();upsideDown.roll=Math.PI;stepFlight(upsideDown,{...idle,lift:1},1/60);assert.ok(upsideDown.velocity.y<0);
});

test("manual rolls complete full rotations, hold attitude on release and do not strafe",()=>{
 for(const sign of [-1,1]){
  const s=createFlight();let traveled=0,last=0;
  for(let i=0;i<300;i++){stepFlight(s,{...idle,roll:sign},1/60);let delta=s.roll-last;if(delta>Math.PI)delta-=Math.PI*2;if(delta<-Math.PI)delta+=Math.PI*2;traveled+=delta;last=s.roll;}
  assert.ok(traveled*sign>Math.PI*2);assert.ok(s.position.length()<1e-9);assert.ok(Math.abs(s.yaw)<1e-9);assert.ok(Math.abs(s.pitch)<1e-9);
  for(let i=0;i<120;i++)stepFlight(s,idle,1/60);
  assert.ok(Math.abs(s.rollSpeed)<.00001);assert.ok(Math.abs(s.roll)>.1);
 }
});

test("flight scratch buffers never couple independent craft states",()=>{
 const a=createFlight(),b=createFlight(),reference=createFlight();
 for(let i=0;i<120;i++){stepFlight(a,{...idle,thrust:1,turn:1},1/60);stepFlight(b,{...idle,thrust:-1,turn:-1,roll:1},1/60);stepFlight(reference,{...idle,thrust:1,turn:1},1/60);}
 assert.ok(a.position.distanceTo(reference.position)<1e-12);assert.equal(a.yaw,reference.yaw);assert.equal(a.roll,0);
});
test("pitched thrust climbs and centered input holds heading",()=>{
 const s=createFlight();s.pitch=.5;s.yaw=.4;
 for(let i=0;i<120;i++)stepFlight(s,{...idle,thrust:1},1/60);
 assert.ok(s.position.y>1);assert.ok(s.position.z>1);assert.ok(Math.abs(s.pitch-.5)<1e-9);assert.ok(Math.abs(s.yaw-.4)<1e-9);
 const speed=s.velocity.length();for(let i=0;i<120;i++)stepFlight(s,idle,1/60);
 assert.ok(s.velocity.length()<speed*.12);
});
test("flight boundaries prevent entering Earth and remove inward velocity",()=>{
 const s=createFlight([0,0,5]);s.yaw=Math.PI;
 for(let i=0;i<600;i++)stepFlight(s,{...idle,thrust:1},1/60,{inner:4,outer:12});
 assert.ok(s.position.length()>=4-1e-8);assert.ok(s.position.length()<=12+1e-8);
});
test("combined local steering remains normalized and braking settles at different frame rates",()=>{
 const run=dt=>{const s=createFlight();for(let i=0;i<2/dt;i++)stepFlight(s,{...idle,turn:1,pitch:1,thrust:1},dt);assert.ok(Math.abs(s.orientation.length()-1)<1e-9);assert.ok(s.bank>0);for(let i=0;i<2/dt;i++)stepFlight(s,{...idle,brake:true},dt);assert.ok(s.velocity.length()<.0001);return s;};
 const a=run(1/60),b=run(1/120);assert.ok(a.position.distanceTo(b.position)<.1);
});

test("all steering and translation are relative to the ship in any scene orientation",()=>{
 const global=new Quaternion().setFromEuler(new Euler(.8,-.7,Math.PI)),a=createFlight(),b=createFlight();
 setFlightAttitude(a,new Quaternion());setFlightAttitude(b,global);
 for(let i=0;i<180;i++){
  const input={...idle,turn:.4,pitch:.3,roll:.5,thrust:1,lift:.6,strafe:.2};
  stepFlight(a,input,1/60,{outer:1000});stepFlight(b,input,1/60,{outer:1000});
  assert.ok(global.clone().multiply(a.orientation).angleTo(b.orientation)<1e-6);
  assert.ok(a.position.clone().applyQuaternion(global).distanceTo(b.position)<1e-8);
  assert.ok(a.velocity.clone().applyQuaternion(global).distanceTo(b.velocity)<1e-8);
 }
});

test("inverted steering reverses scene-space yaw and pitch while keeping cockpit-relative controls",()=>{
 for(const command of [{turn:1},{pitch:1}]){
  const normal=createFlight(),inverted=createFlight();inverted.roll=Math.PI;
  stepFlight(normal,{...idle,...command},1/30);stepFlight(inverted,{...idle,...command},1/30);
  const a=new Vector3(0,0,1).applyQuaternion(normal.orientation),b=new Vector3(0,0,1).applyQuaternion(inverted.orientation);
  if(command.turn){assert.ok(a.x<0&&b.x>0);}else {assert.ok(a.y>0&&b.y<0);}
 }
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

import assert from "node:assert/strict";
import {test} from "node:test";
import {sampleConsumptionStream,streamSeeds} from "../components/three/black-hole/consumption-stream.mjs";

test("planet fragments start continuously, separate immediately, and all reach the core",()=>{
 const center=[Math.sqrt(6.3**2-.7**2-.3**2),.7,.3],radii=[];
 for(let i=0;i<128;i++){
  const seed=streamSeeds(i);assert.deepEqual(seed,streamSeeds(i));assert.ok(seed.every(x=>x>=0&&x<=1));
  const start=sampleConsumptionStream(center,0,seed),next=sampleConsumptionStream(center,.000001,seed);
  assert.ok(Math.hypot(...start.map((x,j)=>x-center[j]))<1e-10);
  assert.ok(Math.hypot(...next.map((x,j)=>x-start[j]))<.0001);
  radii.push(Math.hypot(...sampleConsumptionStream(center,.2,seed)));
  let previous=6.3;
  for(let time=0;time<=3.4;time+=.025){const p=sampleConsumptionStream(center,time,seed),r=Math.hypot(...p);assert.ok(p.every(Number.isFinite));assert.ok(r<=previous+1e-8);previous=r;}
  assert.ok(Math.abs(Math.hypot(...sampleConsumptionStream(center,3.4,seed))-1.65)<1e-10);
 }
 assert.ok(Math.max(...radii)-Math.min(...radii)>.2,"neighboring fragments immediately stretch into different positions along the stream");
});
test("separate surface latitudes gather into a narrow orbital stream rather than retaining the sphere",()=>{
 const heights=[];
 for(let i=0;i<128;i++){
  const y=-1.5+3*i/127,z=.5,center=[Math.sqrt(6.3**2-y*y-z*z),y,z],p=sampleConsumptionStream(center,1,streamSeeds(i));
  heights.push(p[1]-(-.2*p[0]-.1*p[2]));
 }
 assert.ok(Math.max(...heights)-Math.min(...heights)<.3,"the peeled shell collapses into a thin stream");
});

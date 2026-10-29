import assert from "node:assert/strict";
import {test} from "node:test";
import {createConsumedUFO,disposeConsumedUFO,releaseTime,consumptionProgress,CAPTURE_RADIUS,APPROACH_SPEED} from "../components/three/black-hole/consume-ufo.mjs";
import {createUFOV3,disposeUFOV3} from "../components/three/ufo/create-ufo-v3.mjs";

test("nearest pieces reach the capture sphere first; progress is bounded",()=>{
 assert.ok(releaseTime([7,0,0])<releaseTime([9,0,0]));
 for(const center of [[7,0,0],[9,.8,1],[8,-.3,-1]]){const t=releaseTime(center),p=[center[0]-t*APPROACH_SPEED,center[1],center[2]];assert.ok(Math.abs(Math.hypot(...p)-CAPTURE_RADIUS)<1e-9);}
 assert.equal(consumptionProgress(0,2),0);assert.equal(consumptionProgress(20,2),1);assert.ok(Math.abs(consumptionProgress(3.7,2)-.5)<1e-12);
});
test("UFO retains original geometry, batches and materials with prepared piece data",()=>{
 const original=createUFOV3(),model=createConsumedUFO();
 assert.equal(model.userData.modelStats.triangles,original.userData.modelStats.triangles);
 assert.equal(model.userData.modelStats.draws,original.userData.modelStats.draws);
 assert.ok(model.userData.consumption.pieces>200);assert.ok(model.userData.consumption.endTime<12);
 let first=Infinity,last=0,compiled=0;
 model.traverse(mesh=>{if(!mesh.isMesh)return;const g=mesh.geometry,c=g.attributes.aFragmentCenter,r=g.attributes.aReleaseTime;
  assert.equal(c.count,g.attributes.position.count);assert.equal(r.count,c.count);
  for(let i=0;i<c.count;i++){assert.ok(Number.isFinite(r.getX(i)));first=Math.min(first,r.getX(i));last=Math.max(last,r.getX(i));}
  const shader={uniforms:{},vertexShader:"void main() {\n#include <beginnormal_vertex>\n#include <begin_vertex>\n}"};mesh.material.onBeforeCompile(shader);assert.equal(shader.uniforms.uConsumeTime,model.userData.consumption.clock);assert.ok(shader.vertexShader.includes("spiralCenter"));compiled++;
 });
 assert.ok(last-first>3);assert.ok(first>0);assert.equal(compiled,original.userData.modelStats.draws);
 // Restoring the uniform is enough to reset; no new mesh/geometry allocation.
 const geometries=[];model.traverse(n=>{if(n.isMesh)geometries.push(n.geometry);});model.userData.consumption.clock.value=10;model.userData.consumption.clock.value=0;
 let index=0;model.traverse(n=>{if(n.isMesh)assert.equal(n.geometry,geometries[index++]);});
 original.traverse(n=>{if(n.isMesh)assert.equal(n.geometry.getAttribute("aFragmentCenter"),undefined);});
 disposeConsumedUFO(model);disposeUFOV3(original);
});

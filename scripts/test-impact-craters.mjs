import test from "node:test";
import assert from "node:assert/strict";
import {Group,Vector3} from "three";
import {impactFixture} from "./impact-fixture.mjs";
import {createImpactCraters} from "../components/three/planet/impact-craters.mjs";
for(const kind of ["earth","moon"]){
 test(`${kind}: shots lower a physical bowl, raise a rim, deform the foundation and retain impact effects`,()=>{
  const f=impactFixture(kind),radius=kind==="earth"?3:.82,from=new Vector3(0,0,radius*2),to=new Vector3(0,0,0),before=f.mesh.instanceMatrix.array.slice(),core=f.core.attributes.position.array.slice();
  const hit=f.target.query(from,to,0);assert.ok(hit);hit.destroy(.45);
  let lower=0,higher=0;
  for(let i=0;i<f.mesh.count;i++){const n=i*16,a=Math.hypot(...before.slice(n+12,n+15)),b=Math.hypot(...f.mesh.instanceMatrix.array.slice(n+12,n+15));if(b<a-.001)lower++;if(b>a+.001)higher++;assert.ok(Number.isFinite(b)&&b>0);}
  assert.ok(lower>0);assert.ok(higher>0);assert.ok(f.core.attributes.position.array.some((v,i)=>Math.abs(v-core[i])>1e-5));assert.equal(f.target.impactMarks.length,1);
  const next=f.target.query(from,to,1);assert.ok(next);assert.ok(next.point.length()<hit.point.length()-.005);next.destroy(0);
  const deeper=f.target.query(from,to,2);assert.ok(deeper);assert.ok(deeper.point.length()<next.point.length()-.003);assert.equal(f.target.planetPhase(),"intact");
  assert.ok(f.mesh.geometry.attributes.impactHeat.array.some(v=>v>0),"both bodies need visible fiery impact heat");
  if(kind==="moon")assert.ok(f.skin.attributes.position.array.some((v,i)=>Math.abs(v-f.data.skin.positions[i])>1e-5));
  f.dispose();
 });
}
test("crater contacts follow transformed bodies and return finite world-space surface normals",()=>{
 const f=impactFixture("moon"),group=new Group();group.position.set(4,2,-5);group.scale.setScalar(2);group.rotation.set(.4,.7,.2);group.add(f.mesh);group.updateMatrixWorld(true);
 const from=new Vector3(0,0,2).applyMatrix4(f.mesh.matrixWorld),to=new Vector3().applyMatrix4(f.mesh.matrixWorld);
 const hit=f.target.query(from,to,0);assert.ok(hit);hit.destroy(0);const next=f.target.query(from,to,1);assert.ok(next);assert.ok(Math.abs(next.normal.length()-1)<1e-6);assert.ok(next.point.distanceTo(from)>hit.point.distanceTo(from));f.dispose();
});

for(const kind of ["earth","moon"])test(`${kind}: chunked crater preparation matches immediate preparation across repeated local impacts`,()=>{
 const a=impactFixture(kind),b=impactFixture(kind),radius=kind==="earth"?3:.82;
 const options=f=>({foundation:kind==="earth"?2.94:f.data.foundation,surfaces:{current:[f.core,f.skin]}});
 const chunked=createImpactCraters(a.mesh,options(a)),immediate=createImpactCraters(b.mesh,options(b));
 let tasks=0;while(!chunked.prepare(384))tasks++;assert.ok(tasks>1);
 try {
  for(let i=0;i<12;i++){
   const point=new Vector3(Math.sin(i*.8)*.4,Math.cos(i*.7)*.3,1).normalize().multiplyScalar(radius),blast=kind==="earth"?.4:.2;
   chunked.stamp(point,blast,.2,()=>{});immediate.stamp(point,blast,.2,()=>{});
  }
  assert.deepEqual(a.mesh.instanceMatrix.array,b.mesh.instanceMatrix.array);
  assert.deepEqual(a.core.attributes.position.array,b.core.attributes.position.array);
  if(a.skin)assert.deepEqual(a.skin.attributes.position.array,b.skin.attributes.position.array);
 }finally {a.dispose();b.dispose();}
});

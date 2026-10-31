import test from "node:test";
import assert from "node:assert/strict";
import {BoxGeometry,Color,InstancedBufferAttribute,InstancedMesh,Matrix4,MeshBasicMaterial,Quaternion,Vector3} from "three";
import {createDeathRay,deathRayActive,cancelDeathRay,DEATH_RAY_FADE_SECONDS,DEATH_RAY_RANGE,DEATH_RAY_HIT_POWER,deathRayEnvelope,stepDeathRay} from "../components/three/ufo/death-ray.mjs";
import {createDeathRayModel,updateDeathRayModel} from "../components/three/ufo/death-ray-model.mjs";
import {segmentSphereTime,createDestructible} from "../components/three/ufo/projectile-collision.mjs";
const zero=new Vector3(),identity=new Quaternion();
function target(z){const center=new Vector3(0,0,z);return {hits:0,query(from,to){const t=segmentSphereTime(from,to,center,1);if(t===null)return null;return {t,point:from.clone().lerp(to,t),destroy:power=>{this.hits++;assert.equal(power,DEATH_RAY_HIT_POWER);}};}};}

test("held ray starts instantly at full range without charge, stays on, and stops damage on release",()=>{
 const ray=createDeathRay();stepDeathRay(ray,.001,zero,identity,[],0,true);
 assert.ok(deathRayActive(ray));assert.equal(ray.length,DEATH_RAY_RANGE);assert.equal(deathRayEnvelope(ray),1);
 for(let i=0;i<600;i++)stepDeathRay(ray,1/60,zero,identity,[],i/60,true);
 assert.ok(deathRayActive(ray));assert.ok(ray.age>9);
 const hit=target(10);stepDeathRay(ray,.001,zero,identity,[hit],10,false);assert.equal(hit.hits,0);
 assert.ok(deathRayEnvelope(ray)<1);stepDeathRay(ray,DEATH_RAY_FADE_SECONDS,zero,identity,[hit],10.2,false);stepDeathRay(ray,.05,zero,identity,[hit],10.3,false);
 assert.equal(deathRayActive(ray),false);assert.equal(ray.length,0);assert.equal(hit.hits,0);
});

test("nearest object blocks the continuous ray and damage cadence is frame-rate independent",()=>{
 const counts=[];
 for(const rate of [30,60,120]){
  const ray=createDeathRay(),near=target(10),far=target(20);
  for(let i=0;i<rate;i++)stepDeathRay(ray,1/rate,zero,identity,[far,near],i/rate,true);
  assert.equal(far.hits,0);assert.ok(Math.abs(ray.length-9)<1e-8);counts.push(near.hits);
 }
 assert.deepEqual(counts,[6,6,6]);
});

test("beam follows the cannon orientation and acquires a first target after a long miss without catch-up damage",()=>{
 const ray=createDeathRay(),origin=new Vector3(2,3,4),rotation=new Quaternion().setFromAxisAngle(new Vector3(0,1,0),Math.PI/2);
 for(let i=0;i<120;i++)stepDeathRay(ray,1/60,origin,rotation,[],i/60,true);
 assert.ok(Math.abs(ray.end.x-origin.x-DEATH_RAY_RANGE)<1e-8);assert.ok(Math.abs(ray.end.z-origin.z)<1e-8);
 const hit=target(10);stepDeathRay(ray,1/60,zero,identity,[hit],2,true);assert.equal(hit.hits,1);
 for(let i=0;i<5;i++)stepDeathRay(ray,1/60,zero,identity,[hit],2+i/60,true);assert.equal(hit.hits,1);
 cancelDeathRay(ray);assert.equal(deathRayActive(ray),false);
});

test("held ray drills/scorches through existing impact APIs at a fixed rate and release ends damage",()=>{
 const mesh=new InstancedMesh(new BoxGeometry(.2,.2,.2),new MeshBasicMaterial(),1);mesh.position.z=10;
 mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,-1));mesh.setColorAt(0,new Color(.8,.8,.8));mesh.geometry.setAttribute("impactHeat",new InstancedBufferAttribute(new Float32Array(1),1));
 const surface=createDestructible(mesh,new Set(),{mode:"dent",foundation:.85,threshold:100,blast:.25,padding:0}),ray=createDeathRay();
 for(let i=0;i<60;i++)stepDeathRay(ray,1/60,zero,identity,[surface],i/60,true);
 assert.equal(surface.planetHits(),12);assert.ok(mesh.instanceMatrix.array[14]>-1);assert.ok(mesh.geometry.attributes.impactHeat.getX(0)>0);assert.equal(surface.impactMarks.length,6);
 for(let i=0;i<30;i++)stepDeathRay(ray,1/60,zero,identity,[surface],1+i/60,false);
 assert.equal(surface.planetHits(),12);mesh.geometry.dispose();mesh.material.dispose();
});

test("death ray is a reused red 3D beam with a +Z bore and reduced-motion flow suppression",()=>{
 const model=createDeathRayModel(),ray=createDeathRay();stepDeathRay(ray,.001,zero,identity,[],0,true);
 updateDeathRayModel(model,ray,.38,true);assert.ok(model.root.visible);assert.equal(model.shellMaterial.uniforms.uAge.value,0);
 for(const material of [model.coreMaterial,model.flareMaterial])assert.ok(material.color.r>material.color.g*3&&material.color.r>material.color.b*3);
 model.core.geometry.computeBoundingBox();assert.ok(Math.abs(model.core.geometry.boundingBox.min.z)<1e-6);assert.ok(Math.abs(model.core.geometry.boundingBox.max.z-1)<1e-6);
 const geometry=model.core.geometry;updateDeathRayModel(model,ray,.38,false);assert.equal(model.core.geometry,geometry);assert.ok(model.shellMaterial.uniforms.uAge.value>0);
 cancelDeathRay(ray);updateDeathRayModel(model,ray,.38,false);assert.equal(model.root.visible,false);model.dispose();
});

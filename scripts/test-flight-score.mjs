import test from "node:test";
import assert from "node:assert/strict";
import {BoxGeometry,Color,InstancedMesh,Matrix4,MeshBasicMaterial,Quaternion,Vector3} from "three";
import {createHudState,formatScore} from "../components/three/ufo/hud-state.mjs";
import {createDestructible,firstProjectileHit} from "../components/three/ufo/projectile-collision.mjs";
import {createDeathRay,stepDeathRay} from "../components/three/ufo/death-ray.mjs";
function fixture(){
 const mesh=new InstancedMesh(new BoxGeometry(.2,.2,.2),new MeshBasicMaterial(),1);mesh.position.z=10;
 mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,-1));mesh.setColorAt(0,new Color(.8,.8,.8));
 return {mesh,target:createDestructible(mesh,new Set(),{mode:"dent",foundation:.85,threshold:100,explosionsEnabled:false,blast:.25,padding:0}),dispose(){mesh.geometry.dispose();mesh.material.dispose();}};
}
test("score counts confirmed damage, ignores misses and cannot award a consumed impact twice",()=>{
 const store=createHudState(),other=createHudState(),f=fixture(),from=new Vector3(),to=new Vector3(0,0,20);
 try {
  assert.equal(firstProjectileHit([f.target],new Vector3(5,0,0),new Vector3(5,0,20),0),null);
  assert.equal(store.getSnapshot().score,0);
  for(const [power,points] of [[0,100],[.2,300],[1,2300]]){
   const hit=firstProjectileHit([f.target],from,to,0);assert.ok(hit);
   hit.destroy(power,store.addDamage);assert.equal(store.getSnapshot().score,points);
   hit.destroy(power,store.addDamage);assert.equal(store.getSnapshot().score,points);
  }
  store.publish({mode:"docked"});store.publish({mode:"flying"});assert.equal(store.getSnapshot().score,2300);
  assert.equal(other.getSnapshot().score,0);
  for(const value of [NaN,Infinity,-1,0])store.addDamage(value);
  assert.equal(store.getSnapshot().score,2300);
  assert.equal(formatScore(0),"00000");assert.equal(formatScore(300),"00300");assert.equal(formatScore(123456),"123456");
 } finally {f.dispose();}
});
test("ray awards only real contact ticks, equally across frame rates, with no release points",()=>{
 for(const rate of [30,60,120]){
  const store=createHudState(),f=fixture(),ray=createDeathRay(),origin=new Vector3(),rotation=new Quaternion();
  try {
   for(let i=0;i<rate;i++)stepDeathRay(ray,1/rate,origin,rotation,[f.target],i/rate,true,store.addDamage);
   assert.equal(store.getSnapshot().score,1200);
   for(let i=0;i<rate;i++)stepDeathRay(ray,1/rate,origin,rotation,[f.target],1+i/rate,false,store.addDamage);
   assert.equal(store.getSnapshot().score,1200);
  } finally {f.dispose();}
 }
});

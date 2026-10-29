import test from "node:test";
import assert from "node:assert/strict";
import {BoxGeometry,Group,InstancedMesh,Matrix4,MeshBasicMaterial,Quaternion,Vector3} from "three";
import {collectProjectileGravity,projectileAcceleration,MAX_PROJECTILE_ACCELERATION} from "../components/three/ufo/projectile-gravity.mjs";
import {advanceBolts,createBoltPool,launchBolt,BOLT_LIFETIME} from "../components/three/ufo/projectile-pool.mjs";
import {createDestructible,registerProjectileTarget,segmentSphereTime} from "../components/three/ufo/projectile-collision.mjs";

test("per-model gravity toggle/power follow world scale and motion and ignore destroyed or hidden bodies",()=>{
 const scene=new Group(),parent=new Group(),mesh=new InstancedMesh(new BoxGeometry(),new MeshBasicMaterial(),1);mesh.setMatrixAt(0,new Matrix4());parent.add(mesh);scene.add(parent);parent.position.set(5,2,1);parent.scale.setScalar(2);
 mesh.userData.projectileGravity={enabled:true,power:1,radius:2,kind:"moon"};
 const target=createDestructible(mesh,new Set(),{foundation:1,threshold:1}),remove=registerProjectileTarget(mesh,target),sources=[];
 try{
  collectProjectileGravity(scene,sources);assert.equal(sources.length,1);assert.ok(sources[0].position.equals(new Vector3(5,2,1)));const field=sources[0],mu=field.mu;
  mesh.userData.projectileGravity.power=2;parent.position.x=8;collectProjectileGravity(scene,sources);assert.equal(sources[0],field);assert.equal(field.mu,mu*2);assert.equal(field.position.x,8);
  mesh.userData.projectileGravity.enabled=false;assert.equal(collectProjectileGravity(scene,sources).length,0);
  mesh.userData.projectileGravity.enabled=true;parent.visible=false;assert.equal(collectProjectileGravity(scene,sources).length,0);parent.visible=true;
  target.recordHit?.();target.query(new Vector3(8,2,-4),new Vector3(8,2,6),0)?.destroy(1);
  for(let i=0;i<14;i++)target.stepPlanetExplosion(.1);
  assert.equal(collectProjectileGravity(scene,sources).length,0);
 }finally{remove();mesh.dispose();mesh.geometry.dispose();mesh.material.dispose();}
});

test("softened gravity adds sources, stays finite at the center and bounds extreme pull",()=>{
 const out=new Vector3(),a={position:new Vector3(3,0,0),mu:30,softening:1},b={position:new Vector3(-3,0,0),mu:30,softening:1};
 assert.ok(projectileAcceleration(new Vector3(),[a,b],out).length()<1e-9);
 assert.ok(projectileAcceleration(a.position,[a],out).equals(new Vector3()));
 projectileAcceleration(new Vector3(),[{...a,mu:1e12}],out);assert.ok(out.length()<=MAX_PROJECTILE_ACCELERATION+1e-9);
});

test("bolts curve toward a body, stronger power bends more and 30/60Hz agree",()=>{
 const run=(dt,power)=>{const pool=createBoltPool(1);launchBolt(pool,new Vector3(-7,0,0),new Quaternion(),new Vector3());
  const fields=power?[{position:new Vector3(),mu:200*power,softening:2}]:[];
  for(let i=0;i<1/dt;i++)advanceBolts(pool,dt,fields);return pool[0];
 };
 const straight=run(1/60,0),curved=run(1/60,1),strong=run(1/60,2),lowRate=run(1/30,1);
 assert.equal(straight.position.x,-7);assert.ok(curved.position.x>straight.position.x);assert.ok(strong.position.x>curved.position.x);
 assert.ok(curved.position.distanceTo(lowRate.position)<1e-7);assert.ok(curved.velocity.distanceTo(lowRate.velocity)<1e-7);
 const forward=new Vector3(0,0,1).applyQuaternion(curved.rotation);assert.ok(forward.dot(curved.velocity.clone().normalize())>.999999);
});

test("gravity substeps retain swept collisions and consume a curved bolt only once",()=>{
 const pool=createBoltPool(1);launchBolt(pool,new Vector3(-2,0,-5),new Quaternion(),new Vector3());
 let hits=0,segments=0;
 const collide=bolt=>{segments++;const hit=segmentSphereTime(bolt.previous,bolt.position,new Vector3(),2.2);if(hit===null)return false;
  hits++;bolt.position.copy(bolt.previous).lerp(bolt.position,hit);bolt.impact=true;bolt.velocity.set(0,0,0);bolt.age=BOLT_LIFETIME-.22;return true;
 };
 for(let i=0;i<12;i++)advanceBolts(pool,.1,[{position:new Vector3(),mu:100,softening:1}],collide);
 assert.equal(hits,1);assert.ok(segments>1);assert.ok(pool[0].impact);
});

import test from "node:test";
import assert from "node:assert/strict";
import {Quaternion,Vector3} from "three";
import {advanceBolts,BOLT_LIFETIME,createBoltPool,launchBolt} from "../components/three/ufo/projectile-pool.mjs";
test("bolts retain launch heading and inherit ship velocity without following the ship",()=>{
 const pool=createBoltPool(1),origin=new Vector3(1,2,3),rotation=new Quaternion().setFromAxisAngle(new Vector3(0,1,0),Math.PI/2);
 launchBolt(pool,origin,rotation,new Vector3(1,0,0));origin.set(99,99,99);rotation.identity();
 advanceBolts(pool,.1);assert.ok(Math.abs(pool[0].position.x-2.5)<1e-9);assert.equal(pool[0].position.y,2);assert.ok(Math.abs(pool[0].position.z-3)<1e-9);
});
test("fixed pool refuses overflow, expires and reuses slots",()=>{
 const pool=createBoltPool(1),p=new Vector3(),q=new Quaternion();
 assert.equal(launchBolt(pool,p,q,p),true);assert.equal(launchBolt(pool,p,q,p),false);
 for(let i=0;i<Math.ceil(BOLT_LIFETIME/.1)+1;i++)advanceBolts(pool,.1);
 assert.equal(launchBolt(pool,p,q,p),true);assert.equal(pool.length,1);
});

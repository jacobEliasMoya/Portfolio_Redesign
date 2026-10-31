import test from "node:test";
import assert from "node:assert/strict";
import {Vector3,Matrix4} from "three";
import {createCrashBlast} from "../components/three/ufo/crash-blast.mjs";
const event={kind:"crash",point:new Vector3(2,3,4),normal:new Vector3(0,1,0),velocity:new Vector3()};
test("hard crashes produce a brief expanding hot blast and wave, followed by smoke",()=>{
 const blast=createCrashBlast();blast.trigger(event);blast.step(.03);
 assert.ok(blast.root.visible&&blast.flash.visible&&blast.fire.visible&&blast.wave.visible);
 const initial=blast.wave.scale.x;blast.step(.15);assert.ok(blast.wave.scale.x>initial);assert.ok(blast.smoke.visible);
 blast.step(.9);assert.equal(blast.flash.visible,false);assert.equal(blast.fire.visible,false);assert.equal(blast.wave.visible,false);assert.ok(blast.smoke.visible);
 assert.equal(blast.step(1.7),false);assert.equal(blast.root.visible,false);blast.dispose();
});
test("blast resources are reused for replay, suppressed for bumps/reduced motion, and disposed",()=>{
 const blast=createCrashBlast(),geometry=blast.fire.geometry,matrix=blast.fire.instanceMatrix;
 blast.trigger(event);blast.step(.1);blast.trigger({...event,kind:"bounce"});assert.equal(blast.root.visible,false);
 blast.trigger(event,true);assert.equal(blast.root.visible,false);
 blast.trigger(event);blast.step(.1);assert.equal(blast.fire.geometry,geometry);assert.equal(blast.fire.instanceMatrix,matrix);
 assert.ok(Array.from(blast.fire.instanceMatrix.array).every(Number.isFinite));
 const normal=new Vector3(0,0,1).applyQuaternion(blast.wave.quaternion);assert.ok(normal.distanceTo(event.normal)<1e-8);
 const m=new Matrix4();blast.fire.getMatrixAt(0,m);assert.ok(new Vector3().setFromMatrixPosition(m).length()>.2);
 let released=0;geometry.addEventListener("dispose",()=>released++);blast.dispose();assert.equal(released,1);
});

import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Group,Quaternion,Vector3} from "three";
import {initializeLunarPad,createLunarPadPose,LUNAR_PAD_HEIGHT,LUNAR_PAD_SCALE,LUNAR_PAD_SUPPORT_HEIGHT,LUNAR_PAD_SUPPORT_TOP} from "../components/three/moon/lunar-pad-pose.mjs";
import {canLand} from "../components/three/ufo/lunar-landing.mjs";

test("pad starts level, then keeps its local attachment through lunar orbit and drag",()=>{
 const orbit=new Group(),moon=new Group(),pad=new Group();orbit.add(moon);moon.add(pad);pad.scale.setScalar(LUNAR_PAD_SCALE);
 orbit.rotation.set(.31,.8,-.21);orbit.position.set(1,2,3);orbit.scale.setScalar(1.7);moon.position.set(0,0,12);
 const pose=createLunarPadPose(),center=new Vector3(),position=new Vector3(),rotation=new Quaternion(),scale=new Vector3(),up=new Vector3(0,1,0);
 moon.rotation.y=Math.PI;assert.ok(initializeLunarPad(pad,pose));
 moon.getWorldPosition(center);moon.getWorldScale(scale);pad.getWorldPosition(position);pad.getWorldQuaternion(rotation);
 assert.ok(Math.abs(position.x-center.x)<1e-8&&Math.abs(position.z-center.z)<1e-8);
 assert.ok(Math.abs(position.y-center.y-LUNAR_PAD_HEIGHT*scale.y)<1e-8);
 assert.ok(new Vector3(0,1,0).applyQuaternion(rotation).distanceTo(up)<1e-8,"default deck is level with the scene");
 const localPosition=pad.position.clone(),localRotation=pad.quaternion.clone();
 for(const [x,y,z] of [[0,Math.PI,0],[.7,2,-.4],[-1.1,3,1.3]]){
  moon.rotation.set(x,y,z);assert.ok(initializeLunarPad(pad,pose));
  assert.deepEqual(pad.position.toArray(),localPosition.toArray());assert.deepEqual(pad.quaternion.toArray(),localRotation.toArray());
  moon.getWorldPosition(center);moon.getWorldScale(scale);pad.getWorldPosition(position);pad.getWorldQuaternion(rotation);
  const expectedPosition=moon.localToWorld(localPosition.clone()),expectedRotation=moon.getWorldQuaternion(new Quaternion()).multiply(localRotation);
  assert.ok(position.distanceTo(expectedPosition)<1e-8);assert.ok(rotation.angleTo(expectedRotation)<1e-7);
  const normal=new Vector3(0,1,0).applyQuaternion(rotation);
  assert.ok(canLand(position.clone().addScaledVector(normal,2),position,normal));assert.equal(canLand(position.clone().addScaledVector(normal,-2),position,normal),false);
 }
 assert.ok(new Vector3(0,1,0).applyQuaternion(rotation).distanceTo(up)>.1,"rotation is no longer cancelled to keep the deck world-level");
});

test("default attachment waits for a valid reveal transform",()=>{
 const moon=new Group(),pad=new Group(),pose=createLunarPadPose();moon.add(pad);moon.scale.setScalar(0);
 assert.equal(initializeLunarPad(pad,pose),false);assert.equal(pose.initialized,false);assert.ok(pad.position.toArray().every(Number.isFinite));
 moon.scale.setScalar(.01);assert.equal(initializeLunarPad(pad,pose),true);assert.ok(pad.position.toArray().every(Number.isFinite));
});

test("pad body clears the sculpted lunar peaks while supports reach into the foundation",()=>{
 const data=JSON.parse(readFileSync(new URL("../public/models/moon/block-moon.json",import.meta.url))),corners=data.facetCorners;
 let peak=0;for(let i=0;i<corners.length;i+=3)peak=Math.max(peak,Math.hypot(corners[i],corners[i+1],corners[i+2]));
 const bodyBottom=LUNAR_PAD_HEIGHT-.1*LUNAR_PAD_SCALE,supportBottom=LUNAR_PAD_HEIGHT+(LUNAR_PAD_SUPPORT_TOP-LUNAR_PAD_SUPPORT_HEIGHT)*LUNAR_PAD_SCALE;
 assert.ok(bodyBottom>peak+.015,"lowered body still clears all undamaged terrain");
 assert.ok(Math.hypot(.3*LUNAR_PAD_SCALE,supportBottom)<data.foundation,"posts reach into the solid lunar foundation");
});

import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Group,Quaternion,Vector3} from "three";
import {alignLunarPad,createLunarPadPose,LUNAR_PAD_HEIGHT,LUNAR_PAD_SCALE} from "../components/three/moon/lunar-pad-pose.mjs";
import {canLand} from "../components/three/ufo/lunar-landing.mjs";

test("raised pad follows the Moon center but remains level through orbital tilt and drag",()=>{
 const orbit=new Group(),moon=new Group(),pad=new Group();orbit.add(moon);moon.add(pad);pad.scale.setScalar(LUNAR_PAD_SCALE);
 orbit.rotation.set(.31,.8,-.21);orbit.position.set(1,2,3);orbit.scale.setScalar(1.7);moon.position.set(0,0,12);
 const pose=createLunarPadPose(),center=new Vector3(),position=new Vector3(),rotation=new Quaternion(),scale=new Vector3(),up=new Vector3(0,1,0);
 for(const [x,y,z] of [[0,Math.PI,0],[.7,2,-.4],[-1.1,3,1.3]]){
  moon.rotation.set(x,y,z);assert.ok(alignLunarPad(pad,pose));
  moon.getWorldPosition(center);moon.getWorldScale(scale);pad.getWorldPosition(position);pad.getWorldQuaternion(rotation);
  assert.ok(Math.abs(position.x-center.x)<1e-8&&Math.abs(position.z-center.z)<1e-8);
  assert.ok(Math.abs(position.y-center.y-LUNAR_PAD_HEIGHT*scale.y)<1e-8);
  const normal=new Vector3(0,1,0).applyQuaternion(rotation);assert.ok(normal.distanceTo(up)<1e-8);
  assert.ok(canLand(position.clone().addScaledVector(normal,2),position,normal));assert.equal(canLand(position.clone().addScaledVector(normal,-2),position,normal),false);
 }
 orbit.scale.setScalar(0);assert.equal(alignLunarPad(pad,pose),false);assert.ok(pad.position.toArray().every(Number.isFinite));
});

test("pad body clears the sculpted lunar peaks while supports reach into the foundation",()=>{
 const data=JSON.parse(readFileSync(new URL("../public/models/moon/block-moon.json",import.meta.url))),corners=data.facetCorners;
 let peak=0;for(let i=0;i<corners.length;i+=3)peak=Math.max(peak,Math.hypot(corners[i],corners[i+1],corners[i+2]));
 const bodyBottom=LUNAR_PAD_HEIGHT-.1*LUNAR_PAD_SCALE,supportBottom=LUNAR_PAD_HEIGHT-.7*LUNAR_PAD_SCALE;
 assert.ok(bodyBottom>peak+.12,"deck structure is visibly above all undamaged terrain");
 assert.ok(Math.hypot(.3*LUNAR_PAD_SCALE,supportBottom)<data.foundation,"posts reach into the solid lunar foundation");
});

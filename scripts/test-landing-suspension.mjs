import test from "node:test";
import assert from "node:assert/strict";
import {Box3,Group,Vector3} from "three";
import {createUFOV3,disposeUFOV3} from "../components/three/ufo/create-ufo-v3.mjs";
import {applyLandingGear,touchdownCompression,launchCompression,PARKED_COMPRESSION,GEAR_FOOT_DEPTH} from "../components/three/ufo/landing-suspension.mjs";
import {landingPose,LANDING_DURATION,TOUCHDOWN_TIME} from "../components/three/ufo/lunar-landing.mjs";
import {launchProgress} from "../components/three/ufo/lunar-launch.mjs";

test("touchdown compresses, rebounds and settles without moving feet through the pad",()=>{
 const gear=new Group(),values=[];
 for(let age=0;age<=1;age+=1/120){const compression=touchdownCompression(age);values.push(compression);assert.ok(compression>=0&&compression<.12);applyLandingGear(gear,1,compression);
  const foot=new Vector3(0,-GEAR_FOOT_DEPTH,0);gear.updateMatrixWorld();foot.applyMatrix4(gear.matrixWorld);assert.ok(Math.abs(foot.y-compression+GEAR_FOOT_DEPTH)<1e-9);
 }
 const peak=Math.max(...values),peakIndex=values.indexOf(peak);assert.ok(peak>PARKED_COMPRESSION*1.8);assert.ok(values.slice(peakIndex).some(v=>v<PARKED_COMPRESSION));assert.equal(touchdownCompression(1),PARKED_COMPRESSION);
});
test("launch unloads suspension before lift and retraction",()=>{
 assert.equal(launchCompression(0),PARKED_COMPRESSION);assert.ok(launchCompression(.13)>PARKED_COMPRESSION);assert.equal(launchCompression(.35),0);
 for(let t=0;t<=.35;t+=.01){assert.equal(launchProgress(t).lift,0);assert.equal(launchProgress(t).gear,1);}
 assert.equal(launchCompression(0,true),0);assert.equal(touchdownCompression(0,true),PARKED_COMPRESSION);
});
test("landing contact and parked handoff remain continuous at the actual craft scale",()=>{
 const start=new Vector3(2,4,1),pad=new Vector3(),up=new Vector3(0,1,0),out=new Vector3(),scale=.38,clearance=GEAR_FOOT_DEPTH*scale+.02;
 let previous=null;
 for(let age=TOUCHDOWN_TIME;age<=LANDING_DURATION+.1;age+=1/120){const pose=landingPose(start,pad,up,clearance,age,out,scale);assert.ok(Math.abs(out.y+(pose.compression-GEAR_FOOT_DEPTH)*scale-.02)<1e-9);if(previous!==null)assert.ok(Math.abs(out.y-previous)<.005);previous=out.y;}
 const done=landingPose(start,pad,up,clearance,LANDING_DURATION,out,scale);assert.equal(done.done,true);assert.equal(done.compression,PARKED_COMPRESSION);
});

test("actual V3 gear retracts toward the underside without emerging through the disc",()=>{
 const model=createUFOV3(),gear=model.getObjectByName("v3-gear"),bounds=new Box3();
 let previous=-Infinity;
 try{
  for(let step=100;step>=0;step--){
   const amount=step/100;applyLandingGear(gear,amount);model.updateMatrixWorld(true);bounds.setFromObject(gear);
   assert.ok(bounds.max.y<0,"gear must remain below the hull midplane throughout retraction");
   assert.ok(bounds.min.y>=previous-1e-9,"feet must retract upward continuously");previous=bounds.min.y;
  }
  assert.equal(gear.visible,false);
  applyLandingGear(gear,1);model.updateMatrixWorld(true);bounds.setFromObject(gear);
  assert.ok(Math.abs(bounds.min.y+GEAR_FOOT_DEPTH)<1e-6,"deployed foot clearance must be unchanged");
 }finally{disposeUFOV3(model);}
});

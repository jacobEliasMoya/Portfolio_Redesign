import test from "node:test";
import assert from "node:assert/strict";
import {launchProgress,LAUNCH_DURATION} from "../components/three/ufo/lunar-launch.mjs";
test("lunar launch lifts before gear retracts and finishes at safe clearance",()=>{
 assert.deepEqual(launchProgress(0),{lift:0,gear:1,compression:.035,done:false});const early=launchProgress(.8);assert.ok(early.lift>0);assert.equal(early.gear,1);
 assert.ok(launchProgress(1.4).gear<1);const end=launchProgress(LAUNCH_DURATION);assert.equal(end.gear,0);assert.equal(end.lift,2.5);assert.equal(end.done,true);
 for(let t=0;t<LAUNCH_DURATION;t+=.02){assert.ok(launchProgress(t+.01).lift>=launchProgress(t).lift);assert.ok(launchProgress(t).gear>=0);}
 assert.deepEqual(launchProgress(0,true),end);
});

test("launch handoff preserves departure attitude and levels continuously",async()=>{
 const {Quaternion,Vector3}=await import("three"),{blendLaunchAttitude,HANDOFF_DURATION}=await import("../components/three/ufo/lunar-launch.mjs");
 const start=new Quaternion().setFromAxisAngle(new Vector3(0,0,1),.32),target=new Quaternion(),out=new Quaternion();
 blendLaunchAttitude(start,target,0,out);assert.ok(out.angleTo(start)<1e-7);
 let previous=start.clone();for(let t=0;t<=HANDOFF_DURATION;t+=1/60){blendLaunchAttitude(start,target,t,out);assert.ok(previous.angleTo(out)<.012);assert.ok(out.angleTo(target)<=previous.angleTo(target)+1e-6);previous.copy(out);}
 blendLaunchAttitude(start,target,HANDOFF_DURATION,out);assert.ok(out.angleTo(target)<1e-7);
});

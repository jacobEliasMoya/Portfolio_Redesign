import test from "node:test";
import assert from "node:assert/strict";
import {Vector3} from "three";
import {canLand,landingPose,LANDING_DURATION} from "../components/three/ufo/lunar-landing.mjs";
test("landing requires proximity and an above-pad approach cone",()=>{
 const pad=new Vector3(),up=new Vector3(0,1,0);assert.equal(canLand(new Vector3(0,5,0),pad,up),true);assert.equal(canLand(new Vector3(0,5.1,0),pad,up),false);assert.equal(canLand(new Vector3(0,-2,0),pad,up),false);assert.equal(canLand(new Vector3(5,1,0),pad,up),false);
});
test("landing starts continuously, extends gear, and seats on a moving pad",()=>{
 const start=new Vector3(2,4,1),pad=new Vector3(),normal=new Vector3(0,1,0),out=new Vector3();
 landingPose(start,pad,normal,.45,0,out);assert.ok(out.distanceTo(start)<1e-9);
 const middle=landingPose(start,pad,normal,.45,2,out);assert.equal(middle.done,false);assert.ok(middle.gear>.9);
 pad.set(1,0,0);const end=landingPose(start,pad,normal,.45,LANDING_DURATION,out);assert.equal(end.done,true);assert.equal(end.gear,1);assert.equal(end.power,0);assert.ok(out.distanceTo(new Vector3(1,.45,0))<1e-9);
});

test("landing rejects the former wide margin and shallower approach",()=>{
 const pad=new Vector3(),up=new Vector3(0,1,0);assert.equal(canLand(new Vector3(0,6,0),pad,up),false);assert.equal(canLand(new Vector3(3,2,0),pad,up),false);assert.equal(canLand(new Vector3(2,3,0),pad,up),true);
});

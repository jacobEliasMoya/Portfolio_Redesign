import test from "node:test";
import assert from "node:assert/strict";
import {Group} from "three";
import {hudFlipPose,applyHudFlip} from "../components/three/ufo/hud-flip.mjs";
test("outgoing header turns away before incoming 3D labels rotate into place",()=>{
 const start=1000;
 assert.equal(hudFlipPose(start,start).visible,false);
 const entering=hudFlipPose(start+300,start);assert.ok(entering.angle<0&&entering.angle>-Math.PI/2);assert.ok(entering.visible);
 assert.deepEqual(hudFlipPose(start+500,start),{angle:0,visible:true,active:false});
 const outgoing=hudFlipPose(2100,start,2000);assert.ok(outgoing.angle>0&&outgoing.angle<Math.PI/2);
 assert.equal(hudFlipPose(2200,start,2000).visible,false);
 assert.equal(hudFlipPose(2000,2000).visible,false);
 assert.equal(hudFlipPose(2300,2000).visible,true);
});
test("navigation labels share a single pivot and retain their spacing as one rigid row",()=>{
 const a=new Group(),b=new Group();a.position.set(10,30,0);b.position.set(90,50,0);
 const spacing=a.position.distanceTo(b.position);
 applyHudFlip(a,2100,0,2000,false,40);applyHudFlip(b,2100,0,2000,false,40);
 assert.equal(a.rotation.x,b.rotation.x);
 assert.ok(Math.abs(a.position.distanceTo(b.position)-spacing)<1e-9);
 assert.ok(a.position.z<0&&b.position.z>0,"both labels turn around the same header axis");
});
test("rapid reversal preserves the instantaneous angle and reduced motion skips spatial turns",()=>{
 const before=hudFlipPose(300,0),after=hudFlipPose(300,0,300);
 assert.equal(after.angle,before.angle);
 assert.equal(hudFlipPose(350,300,350).visible,false);
 assert.deepEqual(hudFlipPose(0,0,undefined,true),{angle:0,visible:true,active:false});
 assert.deepEqual(hudFlipPose(10,0,10,true),{angle:0,visible:false,active:false});
});

import test from "node:test";
import assert from "node:assert/strict";
import {Vector3} from "three";
import {createSmokeRing,smokePuff} from "../components/three/planet/impact-smoke.mjs";
test("impact smoke spreads around globe curvature, lifts and fades without covering the center",()=>{
 const ring=createSmokeRing({x:0,y:0,z:3,radius:.22,power:0}),p=new Vector3();ring.age=.2;const first=smokePuff(ring,0,p);const early=p.clone();ring.age=.8;smokePuff(ring,0,p);
 assert.ok(p.x*p.x+p.y*p.y>early.x*early.x+early.y*early.y);assert.ok(p.length()>3.04);assert.ok(first.alpha>0);
 ring.age=ring.life;assert.equal(smokePuff(ring,0,p).alpha,0);assert.ok(p.toArray().every(Number.isFinite));
});
test("charged smoke is thicker and lives longer with finite tangent frames at poles",()=>{
 const a=createSmokeRing({x:0,y:3,z:0,radius:.22,power:0}),b=createSmokeRing({x:0,y:3,z:0,radius:.88,power:1});a.age=b.age=.3;
 assert.ok(smokePuff(b,4,new Vector3()).scale>smokePuff(a,4,new Vector3()).scale);assert.ok(b.life>a.life);assert.ok(Math.abs(b.tangent.dot(b.normal))<1e-6);
});

test("lunar smoke follows Moon radius rather than Earth's radius",()=>{
 const ring=createSmokeRing({x:0,y:0,z:.82,radius:.1,power:1},.82),p=new Vector3();ring.age=.4;smokePuff(ring,3,p);assert.ok(p.length()>.82&&p.length()<1.3);
});

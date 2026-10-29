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
 const ring=createSmokeRing({x:0,y:0,z:.82,radius:.1,power:1},.82,"moon"),p=new Vector3();ring.age=.4;smokePuff(ring,3,p);assert.ok(p.length()>.82&&p.length()<1.3);
});

test("Earth impact separates uneven surface dust from a taller central plume",()=>{
 const ring=createSmokeRing({x:0,y:0,z:3,radius:.4,power:.5}),p=new Vector3(),distances=[];
 ring.age=.6;
 for(let i=0;i<26;i++){smokePuff(ring,i,p);distances.push(Math.hypot(p.x,p.y));}
 assert.ok(Math.max(...distances)-Math.min(...distances)>.08);
 smokePuff(ring,30,p);const centralHeight=p.length()-ring.radius,centralSpread=Math.hypot(p.x,p.y);
 smokePuff(ring,4,p);assert.ok(centralHeight>p.length()-ring.radius);assert.ok(centralSpread<Math.hypot(p.x,p.y));
});

test("lunar ejecta travel outward early, fall back and expire before Earth smoke",()=>{
 const mark={x:0,y:0,z:.82,radius:.2,power:.6},moon=createSmokeRing(mark,.82,"moon"),earth=createSmokeRing(mark,.82),p=new Vector3();
 moon.age=moon.life*.5;smokePuff(moon,5,p);const peak=p.length();
 moon.age=moon.life*.95;smokePuff(moon,5,p);assert.ok(p.length()<peak);assert.ok(moon.life<earth.life);
 moon.age=moon.life;for(let i=0;i<40;i++)assert.equal(smokePuff(moon,i,p).alpha,0);
});

test("charged bursts spread wider with staggered visibility and reusable sample storage",()=>{
 const mark={x:0,y:3,z:0,radius:.22,power:0},tap=createSmokeRing(mark),charged=createSmokeRing({...mark,radius:.88,power:1}),p=new Vector3(),sample={scale:0,alpha:0};
 charged.age=.10;let visible=0;for(let i=0;i<40;i++){assert.equal(smokePuff(charged,i,p,sample),sample);if(sample.alpha>0)visible++;}
 assert.ok(visible>0&&visible<40);
 tap.age=charged.age=.4;smokePuff(tap,4,p);const tapSpread=Math.hypot(p.x,p.z);smokePuff(charged,4,p);assert.ok(Math.hypot(p.x,p.z)>tapSpread);
 for(const kind of ["earth","moon"])for(const y of [-3,3]){
  const ring=createSmokeRing({...mark,y},3,kind);
  for(let age=0;age<=ring.life+.1;age+=.05){ring.age=age;for(let i=0;i<40;i++){const puff=smokePuff(ring,i,p);assert.ok(p.toArray().every(Number.isFinite));assert.ok(p.length()>=ring.radius);assert.ok(puff.alpha>=0&&puff.alpha<=1);assert.ok(puff.scale>=0);}}
 }
});

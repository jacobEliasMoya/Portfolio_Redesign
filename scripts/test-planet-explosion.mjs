import test from "node:test";
import assert from "node:assert/strict";
import {BoxGeometry,InstancedMesh,MeshBasicMaterial,Matrix4,Color} from "three";
import {createDestructible} from "../components/three/ufo/projectile-collision.mjs";
import {createPlanetExplosion,planetChargeGlow} from "../components/three/planet/planet-explosion.mjs";
import {Vector3} from "three";
function fixture(){const mesh=new InstancedMesh(new BoxGeometry(.2,.2,.2),new MeshBasicMaterial(),2);mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,3));mesh.setMatrixAt(1,new Matrix4().makeTranslation(0,3,0));mesh.setColorAt(0,new Color(.2,.4,1));mesh.setColorAt(1,new Color(.4,.8,.2));return mesh;}

test("planet breakup can be disabled independently of impacts and enabled on the same target",()=>{
 const mesh=fixture(),target=createDestructible(mesh,new Set(),{mode:"dent",foundation:2.8,threshold:2,explosionsEnabled:false});
 const hit=()=>target.query(new Vector3(0,0,5),new Vector3(0,0,2),1);
 for(let i=0;i<10;i++)hit().destroy();
 assert.equal(target.planetPhase(),"intact");assert.equal(target.planetHits(),0);assert.ok(mesh.instanceMatrix.array[14]<3);assert.equal(target.impactMarks.length,10);
 const dent=mesh.instanceMatrix.array[14],marks=target.impactMarks;
 target.setExplosionsEnabled(true);assert.equal(target.impactMarks,marks);hit().destroy();assert.equal(target.planetPhase(),"intact");assert.equal(mesh.instanceMatrix.array[14],dent);
 hit().destroy();assert.equal(target.planetPhase(),"charging");
 mesh.geometry.dispose();mesh.material.dispose();
});
test("threshold starts one bounded explosion, moves original tiles outward and hides at completion",()=>{
 const mesh=fixture(),effect=createPlanetExplosion(mesh,2);effect.recordHit();assert.equal(effect.phase(),"intact");effect.recordHit();assert.equal(effect.phase(),"charging");
 for(let i=0;i<16;i++)effect.step(.1);assert.equal(effect.phase(),"exploding");assert.ok(mesh.instanceMatrix.array[14]>3);assert.ok(mesh.instanceMatrix.array[29]>3);
 for(let i=0;i<30;i++)effect.step(.1);assert.equal(effect.phase(),"gone");assert.equal(mesh.visible,false);assert.equal(effect.hits(),2);effect.recordHit();assert.equal(effect.hits(),2);
});
test("each projectile impact counts once, including repeated scorched tiles; exploding target stops colliding",()=>{
 const mesh=fixture(),target=createDestructible(mesh,new Set(),{mode:"dent",foundation:2.8,threshold:2});
 const hit=()=>target.query(new Vector3(0,0,5),new Vector3(0,0,2),1);
 hit().destroy();assert.equal(target.planetHits(),1);hit().destroy();assert.equal(target.planetPhase(),"charging");assert.equal(hit(),null);
 target.stepPlanetExplosion(.1,true);assert.equal(target.planetPhase(),"gone");
});

test("tile glow pulses before breakup and stops as the burst begins",()=>{
 const effect=createPlanetExplosion(fixture(),1);effect.recordHit();assert.equal(effect.glow(),0);
 effect.step(.1);const early=effect.glow();for(let i=0;i<8;i++)effect.step(.1);
 assert.equal(effect.phase(),"charging");assert.ok(effect.glow()>early);assert.ok(effect.glow()>0&&effect.glow()<=1);
 for(let i=0;i<4;i++)effect.step(.1);assert.equal(effect.phase(),"exploding");assert.equal(effect.glow(),0);
});

test("tile separation continues smoothly from charge into the outward burst",()=>{
 const mesh=fixture(),effect=createPlanetExplosion(mesh,1);effect.recordHit();for(let i=0;i<11;i++)effect.step(.1);effect.step(.0999);
 const before=mesh.instanceMatrix.array.slice();effect.step(.0002);const after=mesh.instanceMatrix.array;
 for(let i=0;i<after.length;i++)assert.ok(Math.abs(after[i]-before[i])<.01);
 assert.ok(after[0]<.6);assert.ok(after[5]>.99);
});

test("red glow has smooth peaks and troughs and meets the burst at full intensity",()=>{
 assert.equal(planetChargeGlow(0),0);assert.ok(planetChargeGlow(.6)>planetChargeGlow(.9));assert.ok(planetChargeGlow(1.2)>planetChargeGlow(.6));assert.equal(planetChargeGlow(1.2),1);
 for(let t=0;t<1.2;t+=.01){assert.ok(planetChargeGlow(t)>=0&&planetChargeGlow(t)<=1);assert.ok(Math.abs(planetChargeGlow(t+.0001)-planetChargeGlow(t))<.001);}
});

test("planet debris separates off-axis, tumbles independently, and differs between seeds",()=>{
 function burst(seed){const mesh=fixture(),effect=createPlanetExplosion(mesh,1,{seed});effect.recordHit();for(let i=0;i<21;i++)effect.step(.1);return mesh.instanceMatrix.array.slice();}
 const a=burst(17),same=burst(17),other=burst(91);assert.deepEqual(a,same);assert.notDeepEqual(a,other);
 assert.ok(Math.hypot(a[12],a[13])>.1);assert.ok(Math.hypot(a[28],a[30])>.1);
 assert.ok(Math.abs(a[1])+Math.abs(a[2])+Math.abs(a[4])>.05);
 assert.ok(Array.from(a).every(Number.isFinite));
});

test("neutral lunar burst retains rock color ratios after the red warning phase",()=>{
 const mesh=fixture(),effect=createPlanetExplosion(mesh,1,{seed:17,neutralBurst:true});effect.recordHit();for(let i=0;i<16;i++)effect.step(.1);
 const c=new Color();mesh.getColorAt(0,c);assert.ok(Math.abs(c.r/c.b-.2)<1e-5);assert.ok(Math.abs(c.g/c.b-.4)<1e-5);
});

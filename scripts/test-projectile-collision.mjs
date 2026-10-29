import test from "node:test";
import assert from "node:assert/strict";
import {BoxGeometry,InstancedBufferAttribute,Color,Group,InstancedMesh,Matrix4,MeshBasicMaterial,Vector3} from "three";
import {createDestructible,firstProjectileHit,segmentSphereTime} from "../components/three/ufo/projectile-collision.mjs";
const v=(x,y=0,z=0)=>new Vector3(x,y,z);
function fixture(){const mesh=new InstancedMesh(new BoxGeometry(.2,.2,.2),new MeshBasicMaterial(),3);for(let i=0;i<3;i++)mesh.setMatrixAt(i,new Matrix4().makeTranslation(i,0,0));const dead=new Set();return {mesh,dead,target:createDestructible(mesh,dead,{blast:.25,padding:0})};}
test("swept collision catches fast crossings, tangency, starts inside and misses",()=>{
 assert.ok(Math.abs(segmentSphereTime(v(-5),v(5),v(0),1)-.4)<1e-10);
 assert.equal(segmentSphereTime(v(0),v(0),v(0),1),0);
 assert.equal(segmentSphereTime(v(-5,2),v(5,2),v(0),1),null);
 assert.equal(segmentSphereTime(v(-5,1),v(5,1),v(0),1),.5);
});
test("instance destruction respects nested scale/rotation and skips destroyed tiles",()=>{
 const {mesh,dead,target}=fixture(),parent=new Group();parent.position.set(4,3,2);parent.scale.setScalar(2);parent.rotation.y=.7;parent.add(mesh);parent.updateMatrixWorld(true);
 const from=v(0,0,-2).applyMatrix4(mesh.matrixWorld),to=v(0,0,2).applyMatrix4(mesh.matrixWorld);
 const hit=target.query(from,to,1);assert.ok(hit);assert.equal(hit.destroy(),1);assert.ok(dead.has(0));assert.equal(mesh.instanceMatrix.array[0],0);assert.equal(target.query(from,to,2),null);
 parent.visible=false;assert.equal(target.query(v(-10),v(10),3),null);
});
test("nearest target consumes shot before farther target and foundation absorbs",()=>{
 const a=fixture(),b=fixture();b.mesh.position.z=3;
 const hit=firstProjectileHit([b.target,a.target],v(0,0,-3),v(0,0,6),1);assert.ok(hit);hit.destroy();assert.equal(a.dead.size,1);assert.equal(b.dead.size,0);
 const solid=createDestructible(a.mesh,a.dead,{foundation:.5});assert.ok(solid.query(v(0,0,-2),v(0,0,2),2));
});

test("Earth impacts dent tiles, retain solid geometry and set heat without repeated sinking",()=>{
 const {mesh,dead}=fixture();mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,3));mesh.setMatrixAt(1,new Matrix4().makeTranslation(8,0,0));mesh.setMatrixAt(2,new Matrix4().makeTranslation(9,0,0));
 mesh.geometry.setAttribute("impactHeat",new InstancedBufferAttribute(new Float32Array(3),1));
 const target=createDestructible(mesh,dead,{blast:.25,padding:0,foundation:2.8,mode:"dent"});
 const hit=target.query(v(0,0,5),v(0,0,2),1);assert.ok(hit);assert.equal(hit.destroy(),1);
 const z=mesh.instanceMatrix.array[14];assert.ok(z<3&&z>2.8);assert.equal(mesh.instanceMatrix.array[0],1);assert.ok(mesh.geometry.getAttribute("impactHeat").getX(0)>.5);
 const color=new Color();mesh.getColorAt(0,color);assert.ok(color.r>color.g&&color.g>color.b);
 const again=target.query(v(0,0,5),v(0,0,2),2);assert.ok(again);again.destroy();assert.equal(mesh.instanceMatrix.array[14],z);
 const darker=new Color();mesh.getColorAt(0,darker);assert.ok(darker.r<color.r);assert.ok(mesh.geometry.getAttribute("impactHeat").getX(0)<.5);
});

test("letter fragments fly away and expire without being restored",()=>{
 const {mesh,dead}=fixture();for(let i=0;i<3;i++)mesh.setColorAt(i,new Color(.8,.8,.8));
 const target=createDestructible(mesh,dead,{mode:"explode",blast:.25,padding:0});
 const hit=target.query(v(0,0,-2),v(0,0,2),1);assert.ok(hit);hit.destroy();assert.ok(dead.has(0));assert.equal(mesh.instanceMatrix.array[0],1);
 target.stepDebris(.1);assert.ok(Math.hypot(mesh.instanceMatrix.array[12],mesh.instanceMatrix.array[13],mesh.instanceMatrix.array[14])>.1);
 for(let i=0;i<20;i++)target.stepDebris(.1);assert.equal(mesh.instanceMatrix.array[0],0);assert.equal(target.stepDebris(.1),0);
});

test("whole wordmark bursts away from Earth once and cannot reform or collide afterward",()=>{
 const {mesh,dead}=fixture();for(let i=0;i<3;i++)mesh.setColorAt(i,new Color(.8,.8,.8));
 const target=createDestructible(mesh,dead,{mode:"explode"});const center=new Vector3(0,0,-9);
 assert.equal(target.explodeAll(center),3);assert.equal(target.explodeAll(center),0);assert.equal(dead.size,3);
 target.stepDebris(.1);assert.ok(mesh.instanceMatrix.array[14]>0);
 assert.equal(target.query(v(0,0,-2),v(0,0,2),1),null);
 for(let i=0;i<30;i++)target.stepDebris(.1);assert.equal(target.stepDebris(.1),0);assert.equal(mesh.instanceMatrix.array[0],0);
});

test("full charge widens local damage and counts twenty planet damage without affecting distant tiles",()=>{
 function surface(mode){
  const mesh=new InstancedMesh(new BoxGeometry(.2,.2,.2),new MeshBasicMaterial(),5),dead=new Set();
  [0,.34,.66,.99,2].forEach((x,i)=>{mesh.setMatrixAt(i,new Matrix4().makeTranslation(x,0,3));mesh.setColorAt(i,new Color(.8,.8,.8));});
  return {mesh,dead,target:createDestructible(mesh,dead,{blast:.25,padding:0,foundation:2.8,mode,threshold:20})};
 }
 for(const mode of ["dent","explode"]){
  const tap=surface(mode),charged=surface(mode);
  assert.equal(tap.target.query(v(0,0,5),v(0,0,2),1).destroy(0),1);
  assert.equal(charged.target.query(v(0,0,5),v(0,0,2),1).destroy(1),4);
  assert.equal(tap.target.planetHits(),1);assert.equal(charged.target.planetHits(),20);
  assert.equal(charged.dead.has(4),false);
  if(mode==="dent")assert.equal(charged.target.impactMarks[0].radius,1);
 }
});
test("charge damage is bounded and can trigger the existing destruction threshold",()=>{
 const {mesh,dead}=fixture(),target=createDestructible(mesh,dead,{blast:.25,threshold:8});
 target.query(v(0,0,-2),v(0,0,2),1).destroy(99);
 assert.equal(target.planetHits(),8);assert.equal(target.planetPhase(),"charging");
});

test("splash tiles grade from red core to golden edge, and repeated hits char the gradient",()=>{
 const mesh=new InstancedMesh(new BoxGeometry(.1,.1,.1),new MeshBasicMaterial(),3),dead=new Set();
 [0,.5,.95].forEach((x,i)=>mesh.setMatrixAt(i,new Matrix4().makeTranslation(x,0,3)));
 mesh.geometry.setAttribute("impactHeat",new InstancedBufferAttribute(new Float32Array(3),1));
 const target=createDestructible(mesh,dead,{blast:.25,padding:0,foundation:2.8,mode:"dent"});
 target.query(v(0,0,5),v(0,0,2),1).destroy(1);
 const colors=[0,1,2].map(i=>{const c=new Color();mesh.getColorAt(i,c);return c;});
 assert.ok(colors[0].g<.05);assert.ok(colors[1].g>colors[0].g);assert.ok(colors[2].g>.8);
 assert.ok(colors.every(c=>c.r>c.g&&c.g>c.b));
 const heat=mesh.geometry.getAttribute("impactHeat");assert.ok(heat.getX(0)>heat.getX(2));
 target.query(v(0,0,5),v(0,0,2),2).destroy(1);
 const charred=new Color();mesh.getColorAt(0,charred);assert.ok(charred.r<colors[0].r);assert.ok(heat.getX(0)<.5);
});

test("one full plasma impact triggers Earth or Moon breakup; a partial charge cannot",()=>{
 for(const threshold of [20,12]){
  for(const power of [.99,1]){
   const {mesh,dead}=fixture(),target=createDestructible(mesh,dead,{blast:.25,foundation:.5,mode:"dent",threshold});
   target.query(v(0,0,-2),v(0,0,2),0).destroy(power);
   assert.equal(target.planetPhase(),power===1?"charging":"intact");
   assert.equal(target.planetHits(),power===1?threshold:7);
  }
 }
});

test("incremental collision preparation matches lazy contact and keeps the index usable after dents",()=>{
 const {mesh,dead}=fixture();mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,3));
 const target=createDestructible(mesh,dead,{mode:"dent",foundation:2.8});
 assert.equal(target.prepareIndex(1),false);assert.equal(target.prepareIndex(1),false);assert.equal(target.prepareIndex(1),true);
 const from=v(0,0,5),to=v(0,0,2),first=target.query(from,to,0);assert.ok(first);first.destroy(0);
 assert.equal(target.prepareIndex(1),true);const second=target.query(from,to,1);assert.ok(second);assert.ok(second.point.z<first.point.z);second.destroy(0);
});

test("max-power lunar impact ejects gray tiles during planet charge and never restores expired debris",()=>{
 const mesh=new InstancedMesh(new BoxGeometry(.1,.1,.1),new MeshBasicMaterial(),2),dead=new Set();
 mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,.82));mesh.setMatrixAt(1,new Matrix4().makeTranslation(.6,0,.6));
 for(let i=0;i<2;i++)mesh.setColorAt(i,new Color(.7,.7,.7));
 mesh.geometry.setAttribute("impactHeat",new InstancedBufferAttribute(new Float32Array(2),1));
 const target=createDestructible(mesh,dead,{mode:"explode",foundation:.7,blast:.1,threshold:12});
 assert.equal(target.query(v(0,0,2),v(0,0,.5),0).destroy(1),1);
 assert.equal(target.planetPhase(),"charging");assert.equal(target.impactMarks.length,1);assert.equal(mesh.geometry.getAttribute("impactHeat").getX(0),0);const rock=new Color();mesh.getColorAt(0,rock);assert.ok(Math.abs(rock.r-rock.g)<1e-6&&Math.abs(rock.g-rock.b)<1e-6);
 const start=mesh.instanceMatrix.array.slice(12,15);
 target.stepPlanetExplosion(.1);assert.equal(mesh.instanceMatrix.array[0],0);
 assert.ok(target.stepDebris(.1)>0);assert.ok(Math.hypot(...mesh.instanceMatrix.array.slice(12,15).map((n,i)=>n-start[i]))>.01);assert.ok(mesh.instanceMatrix.array[0]!==0);
 for(let i=0;i<18;i++){target.stepPlanetExplosion(.1);target.stepDebris(.1);}
 assert.equal(target.planetPhase(),"exploding");assert.equal(mesh.instanceMatrix.array[0],0);
 target.stepPlanetExplosion(.1);target.stepDebris(.1);assert.equal(mesh.instanceMatrix.array[0],0);
});

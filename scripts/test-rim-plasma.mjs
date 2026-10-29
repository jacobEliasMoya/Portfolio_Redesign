import test from "node:test";
import assert from "node:assert/strict";
import {InstancedMesh,Quaternion,Raycaster,Vector3} from "three";
import {createRimBurstGeometry,createRimBurstMaterial,createRimBurstResources,easeRimDirection,IDLE_RIM_DRIVE,sampleRimDrive,shouldUpdateRimPlasma} from "../components/three/ufo/rim-plasma.mjs";
import {createUFOV3,disposeUFOV3} from "../components/three/ufo/create-ufo-v3.mjs";
const velocity=new Vector3(),drive=(input)=>({...IDLE_RIM_DRIVE,...input});

test("rim resource owner releases both instance buffers and each shared resource once",()=>{
 for(let cycle=0;cycle<25;cycle++){
  const r=createRimBurstResources(),outer=new InstancedMesh(r.geometry,r.shell,18),inner=new InstancedMesh(r.geometry,r.core,18),disposed=new Map();
  for(const object of [outer,inner,r.geometry,r.shell,r.core])object.addEventListener("dispose",()=>disposed.set(object,(disposed.get(object)??0)+1));
  r.dispose([outer,inner,outer,null]);
  assert.equal(disposed.size,5);for(const count of disposed.values())assert.equal(count,1);
 }
});

test("idle rim effects sleep, fading jets finish, and roll input wakes the effect",()=>{
 const levels=new Float32Array(6);assert.equal(shouldUpdateRimPlasma(IDLE_RIM_DRIVE,levels),false);
 levels[2]=.2;assert.equal(shouldUpdateRimPlasma(IDLE_RIM_DRIVE,levels),true);levels.fill(0);
 assert.equal(shouldUpdateRimPlasma(drive({roll:1}),levels),true);
 const jet=sampleRimDrive(0,drive({roll:1}),velocity);assert.ok(jet.strength>0&&jet.dy<0);
});

test("adding or reversing steering eases jet angle without snapping and agrees at 30/60Hz",()=>{
 const forward=new Vector3(0,0,1),orientation=input=>{const s=sampleRimDrive(0,drive(input),velocity);return new Quaternion().setFromUnitVectors(forward,new Vector3(s.dx,s.dy,s.dz));};
 for(const [from,to] of [[{}, {turn:1,lift:1}],[{turn:1},{turn:-1,pitch:1}]]){
  const start=orientation(from),target=orientation(to),current=start.clone(),initial=start.angleTo(target);
  easeRimDirection(current,target,1/60);assert.ok(current.angleTo(target)<initial);assert.ok(current.angleTo(target)>initial*.8);
  let remaining=current.angleTo(target);
  for(let i=0;i<60;i++){easeRimDirection(current,target,1/60);const next=current.angleTo(target);assert.ok(next<=remaining+1e-8);remaining=next;assert.ok(Math.abs(current.length()-1)<1e-9);}
  assert.ok(remaining<.002);
  const a=start.clone(),b=start.clone();for(let i=0;i<15;i++)easeRimDirection(a,target,1/30);for(let i=0;i<30;i++)easeRimDirection(b,target,1/60);assert.ok(a.angleTo(b)<1e-6);
  easeRimDirection(current,start,1/60,true);assert.ok(current.angleTo(start)<1e-7);
 }
});

test("forward/reverse/strafe select the opposing rim emitters, with no coast or idle trail",()=>{
 const samples=input=>Array.from({length:6},(_,i)=>sampleRimDrive(i,drive(input),velocity));
 for(const input of [{thrust:1},{thrust:-1},{strafe:1},{strafe:-1}])for(const sample of samples(input)){
  const alignment=sample.dx*(input.strafe??0)-sample.dz*(input.thrust??0);
  if(alignment<-.01)assert.equal(sample.strength,0);
 }
 assert.ok(samples({thrust:1})[4].strength>.99);assert.ok(samples({thrust:-1})[1].strength>.99);
 for(let i=0;i<6;i++){assert.equal(sampleRimDrive(i,IDLE_RIM_DRIVE,new Vector3(5,0,3)).strength,0);}
});

test("turn jets give opposite-side torque, vertical jets oppose lift and braking opposes velocity",()=>{
 const a=sampleRimDrive(0,drive({turn:1}),velocity),b=sampleRimDrive(3,drive({turn:1}),velocity);
 assert.ok(a.strength>0&&b.strength>0);
 for(const sample of [a,b])assert.ok(sample.x*sample.dz-sample.z*sample.dx<0);
 for(let i=0;i<6;i++){
  assert.ok(sampleRimDrive(i,drive({lift:1}),velocity).dy<0);
  assert.ok(sampleRimDrive(i,drive({lift:-1}),velocity).dy>0);
  assert.ok(sampleRimDrive(i,drive({brake:true}),new Vector3(0,4,0)).dy>0);
 }
 assert.ok(sampleRimDrive(1,drive({brake:true}),new Vector3(0,0,5)).strength>.99);
});

test("burst origins sit just outside the actual six blue rim lights with bounded unit exhaust directions",()=>{
 const model=createUFOV3(),lights=model.getObjectByName("v3-disc").children.find(mesh=>mesh.material.name==="v3-navigation");model.updateMatrixWorld(true);
 try{
  for(let i=0;i<6;i++){
   const sample=sampleRimDrive(i,drive({thrust:1,strafe:1,lift:1,turn:1,pitch:1,brake:true}),new Vector3(2,1,3));
   assert.ok(sample.strength>=0&&sample.strength<=1);assert.ok(Math.abs(Math.hypot(sample.dx,sample.dy,sample.dz)-1)<1e-9);
   const hit=new Raycaster(new Vector3(sample.x,sample.y,sample.z),new Vector3(-sample.x,0,-sample.z).normalize()).intersectObject(lights)[0];
   assert.ok(hit&&hit.distance<.03,"plume must be seated on its actual rim emitter");
   assert.ok(Math.hypot(sample.x,sample.z)>2.235*Math.sqrt(3)/2+.035);
  }
 }finally{disposeUFOV3(model);}
});

test("plasma lobes have broad three-dimensional volume, a sealed nose and additive cyan shaders",()=>{
 const geometry=createRimBurstGeometry();geometry.computeBoundingBox();const box=geometry.boundingBox;
 assert.ok(box.max.x-box.min.x>.65);assert.ok(box.max.y-box.min.y>.65);assert.ok(box.max.z>2.19&&box.min.z>=-1e-7);
 assert.ok(Array.from(geometry.attributes.normal.array).every(Number.isFinite));geometry.dispose();
 for(const core of [false,true]){const material=createRimBurstMaterial(core);assert.equal(material.depthTest,true);assert.equal(material.depthWrite,false);assert.equal(material.transparent,true);assert.equal(material.uniforms.uCore.value,core?1:0);material.dispose();}
});

import test from "node:test";
import assert from "node:assert/strict";
import {Box3,Group,Raycaster,Vector3,Mesh,MeshBasicMaterial,DoubleSide} from "three";
import {createUFOV3,disposeUFOV3} from "../components/three/ufo/create-ufo-v3.mjs";
import {V3_WEAPON_MUZZLE,createAlienCannonModel,disposeAlienCannonModel,stepCannonRotation,CANNON_ROTATION_SPEED} from "../components/three/ufo/alien-cannon.mjs";
import {createV3PanelLayout,polygonRadius,createV3PanelGeometry,createHexLoft} from "../components/three/ufo/ufo-v3-geometry.mjs";

test("V3 armor is deterministic, clipped to a six-sided rim and clear of its hexagonal openings",()=>{
 for(const side of [1,-1]){
  const panels=createV3PanelLayout(side);assert.deepEqual(panels,createV3PanelLayout(side));assert.ok(panels.length>30&&panels.length<160);
  const holes=side>0?[[.86,[0,0]]]:[[.67,[0,0]],...Array.from({length:3},(_,i)=>[.305,[Math.sin(i*Math.PI*2/3)*1.22,Math.cos(i*Math.PI*2/3)*1.22]])];
  for(const panel of panels)for(const [x,z] of panel.points){assert.ok(polygonRadius(x,z)<=1);for(const [radius,[cx,cz]] of holes){const d=Math.max(...Array.from({length:6},(_,i)=>{const a=Math.PI/6+i*Math.PI/3;return (x-cx)*Math.cos(a)+(z-cz)*Math.sin(a);}));assert.ok(d>=radius*Math.sqrt(3)/2-1e-7);}}
 }
});
test("closed hexagonal foundation presents outward top and bottom surfaces",()=>{
 const geometry=createHexLoft([[0,.4],[2.23,.1],[2.23,-.1],[0,-.4]]),mesh=new Mesh(geometry,new MeshBasicMaterial());mesh.updateMatrixWorld(true);
 for(const side of [1,-1]){const hit=new Raycaster(new Vector3(.2,side*3,.1),new Vector3(0,-side,0)).intersectObject(mesh);assert.ok(hit.length);assert.ok(hit[0].face.normal.y*side>0);}
 mesh.material.dispose();geometry.dispose();
});

test("circular cockpit bearing and armor opening clear the dome's complete rotational sweep",()=>{
 const model=createUFOV3(),fixed=model.getObjectByName("v3-cockpit"),dome=model.getObjectByName("v3-dome");
 model.updateMatrixWorld(true);
 try{
  let sweepRadius=0;
  dome.traverse(mesh=>{if(mesh.isMesh){const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++)sweepRadius=Math.max(sweepRadius,Math.hypot(p.getX(i),p.getZ(i)));}});
  for(let i=0;i<96;i++){
   const a=i*Math.PI*2/96,hit=new Raycaster(new Vector3(0,.50,0),new Vector3(Math.cos(a),0,Math.sin(a))).intersectObject(fixed,true)[0];
   assert.ok(hit);assert.ok(hit.distance>.795&&hit.distance<.805,"gasket must form a circular opening");
   assert.ok(hit.distance-sweepRadius>.01,"rotating frame must have positive radial clearance");
  }
  for(const panel of createV3PanelLayout(1))for(const [x,z] of panel.points)assert.ok(Math.hypot(x,z)>=.94*Math.cos(Math.PI/48)-1e-7);
 }finally{disposeUFOV3(model);}
});
test("V3 is finite, bounded, batched and keeps its rotating dome independent of hull and cannon",()=>{
 const model=createUFOV3();model.updateMatrixWorld(true);const stats=model.userData.modelStats;
 assert.ok(stats.draws<=20);assert.ok(stats.triangles<18000);assert.ok(stats.bounds[0]<=4.6);
 const disc=model.getObjectByName("v3-disc"),dome=model.getObjectByName("v3-dome"),cockpit=model.getObjectByName("v3-cockpit"),gear=model.getObjectByName("v3-gear");assert.equal(gear.visible,false);
 dome.rotation.y=.8;assert.equal(cockpit.rotation.y,0);assert.equal(disc.rotation.y,0);assert.equal(gear.rotation.y,0);
 assert.equal(dome.children.length,2);assert.ok(dome.children.some(mesh=>mesh.material.name==="v3-teal-glass"));
 model.traverse(n=>{if(n.isMesh)for(const a of Object.values(n.geometry.attributes))for(const v of a.array)assert.ok(Number.isFinite(v));});
 const panel=createV3PanelLayout(1).find(p=>p.points.length===6),geo=createV3PanelGeometry(panel),mesh=new Mesh(geo,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld(true);
 const [x,z]=panel.points.reduce((sum,p)=>[sum[0]+p[0]/6,sum[1]+p[1]/6],[0,0]);assert.ok(new Raycaster(new Vector3(x,3,z),new Vector3(0,-1,0)).intersectObject(mesh).length);
 geo.dispose();mesh.material.dispose();disposeUFOV3(model);
});

test("alien cannon has an unobstructed recessed aperture and a forward muzzle fixed to cockpit",()=>{
 const model=createUFOV3();model.updateMatrixWorld(true);
 try{
  const fixed=model.getObjectByName("v3-cockpit"),disc=model.getObjectByName("v3-disc");
  const origin=new Vector3(...V3_WEAPON_MUZZLE),ray=new Raycaster(origin,new Vector3(0,0,-1));
  const hit=ray.intersectObject(fixed,true)[0];assert.ok(hit);
  assert.equal(hit.object.material.name,"v3-navigation");
  assert.ok(hit.point.z>2.49&&hit.point.z<2.52,"light must sit behind the open collar/jaws");
  assert.ok(origin.z-hit.point.z>.35,"shots start ahead of the jaws");
  disc.rotation.y=1.2;model.updateMatrixWorld(true);
  const rotated=ray.intersectObject(fixed,true)[0];assert.ok(rotated.point.distanceTo(hit.point)<1e-9);
  assert.ok(model.userData.modelStats.draws<=20);assert.ok(model.userData.modelStats.triangles<18000);
 }finally{disposeUFOV3(model);}
});

test("shared cannon stays embedded at its base, exposes its jaws and preserves a clear common muzzle",()=>{
 const model=createAlienCannonModel();model.updateMatrixWorld(true);
 try{
  const bounds=new Box3().setFromObject(model);
  assert.ok(bounds.min.z<1.80&&bounds.min.z>1.7);
  assert.ok(bounds.max.z>2.79&&bounds.max.z<V3_WEAPON_MUZZLE[2]);
  assert.equal(model.children.length,5);assert.equal(model.getObjectByName("alien-cannon-rotor").children.length,2);
  const hit=new Raycaster(new Vector3(...V3_WEAPON_MUZZLE),new Vector3(0,0,-1)).intersectObject(model,true)[0];
  assert.ok(hit&&hit.point.z>2.49&&hit.point.z<2.52);
  assert.ok(hit.object.material.emissiveIntensity>1);
 }finally{disposeAlienCannonModel(model);}
});

test("weapon jaws rotate around the bore without moving the mount, muzzle or flight axis",()=>{
 for(const create of [createUFOV3,createAlienCannonModel]){
  const model=create(),rotor=model.getObjectByName("alien-cannon-rotor");assert.ok(rotor);
  const source=new Vector3(...V3_WEAPON_MUZZLE),point=new Vector3(.3,-.10,2.80);
  try{
   for(let i=0;i<300;i++){
    stepCannonRotation(rotor,1/60);model.updateMatrixWorld(true);
    assert.ok(source.clone().applyMatrix4(rotor.matrixWorld).distanceTo(source)<1e-9);
    const transformed=point.clone().applyMatrix4(rotor.matrixWorld);
    assert.ok(Math.abs(transformed.z-point.z)<1e-9);assert.ok(Math.abs(Math.hypot(transformed.x,transformed.y+.10)-.3)<1e-9);
   }
   assert.ok(Math.abs(rotor.rotation.z-5*CANNON_ROTATION_SPEED)<1e-9);
   const angle=rotor.rotation.z;assert.equal(stepCannonRotation(rotor,.1,true),false);assert.equal(rotor.rotation.z,angle);
   const a=new Group(),b=new Group();for(let i=0;i<30;i++)stepCannonRotation(a,1/30);for(let i=0;i<60;i++)stepCannonRotation(b,1/60);assert.ok(Math.abs(a.rotation.z-b.rotation.z)<1e-9);
  }finally{if(create===createUFOV3)disposeUFOV3(model);else disposeAlienCannonModel(model);}
 }
});

test("underside vent louvers stay with the hull while only the dome spins",()=>{
 const model=createUFOV3(),disc=model.getObjectByName("v3-disc"),dome=model.getObjectByName("v3-dome"),gear=model.getObjectByName("v3-gear");
 try{
  for(const angle of [0,.4,1.7,3.1]){
   model.rotation.y=angle;dome.rotation.y=angle*1.3;model.updateMatrixWorld(true);
   for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3,origin=new Vector3(Math.sin(a)*1.22,-2,Math.cos(a)*1.22);
    disc.localToWorld(origin);
    const hit=new Raycaster(origin,new Vector3(0,1,0)).intersectObject(disc,true)[0];
    assert.ok(hit);assert.ok(hit.object.parent===disc);assert.equal(hit.object.material.name,"v3-trim");
    assert.ok(Math.abs(hit.point.y+.484)<.002);
   }
   assert.equal(gear.rotation.y,0);assert.equal(disc.rotation.y,0);
  }
 }finally{disposeUFOV3(model);}
});

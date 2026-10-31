import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Object3D,Vector3,InstancedMesh,Matrix4} from "three";
import {createTrafficNetwork,createTrafficScratch,sampleNetworkFlight,GROUND_PAUSE,FLEET_SIZE,routeRadius,TRAIL_PUFFS} from "../components/three/air-traffic/traffic-network.mjs";
import {createContrails} from "../components/three/air-traffic/contrails.mjs";
import {createAirplaneModel} from "../components/three/air-traffic/airplane-model.mjs";
import {createDestructible,firstProjectileHit} from "../components/three/ufo/projectile-collision.mjs";
import {createHudState} from "../components/three/ufo/hud-state.mjs";
import {createDeathRay,stepDeathRay} from "../components/three/ufo/death-ray.mjs";
import {createTrafficVisualState,stepTrafficVisuals} from "../components/three/air-traffic/traffic-visuals.mjs";
import {Quaternion} from "three";
const data=JSON.parse(readFileSync(new URL("../components/three/air-traffic/major-airports.json",import.meta.url))),network=createTrafficNetwork(data);
test("world itinerary includes every selected major airport exactly once and reaches all six regions",()=>{
 assert.equal(network.routes.length,data.airports.length);assert.ok(data.airports.length>1000);
 assert.equal(new Set(data.airports.map(a=>a.id)).size,data.airports.length);
 assert.equal(new Set(data.airports.map(a=>a.continent)).size,6);
 assert.equal(new Set(network.routes.map(route=>route.from)).size,data.airports.length); assert.ok(network.routes.every((route,i)=>route.to===network.routes[(i+1)%network.routes.length].from)); assert.ok(network.routes.every(route=>route.angle>.2));
 assert.ok(Math.max(...network.routes.map(r=>r.duration))<20);
});
test("restored arcs keep moving, clear terrain, and hide turns instead of swiveling at airports",()=>{
 const pose=new Object3D(),scratch=createTrafficScratch();
 for(let i=0;i<network.routes.length;i++){
  const route=network.routes[i],start=network.starts[i];
  sampleNetworkFlight(network,start,pose,scratch);assert.ok(pose.position.clone().normalize().distanceTo(route.start)<1e-7);assert.ok(pose.scale.x<1e-12);
  sampleNetworkFlight(network,start+route.duration*.5,pose,scratch);const middle=pose.position.clone();assert.ok(pose.scale.x>0);
  sampleNetworkFlight(network,start+route.duration*.5+1,pose,scratch);assert.ok(pose.position.distanceTo(middle)>.04,"visible flight must advance substantially");
  for(let j=1;j<32;j++){
   const t=j/32;assert.ok(routeRadius(route,t)>=route.clearance&&routeRadius(route,t)<3.71);sampleNetworkFlight(network,start+route.duration*t,pose,scratch);
   assert.ok(pose.matrix.elements.every(Number.isFinite));assert.ok(Math.abs(pose.quaternion.length()-1)<1e-6);
   assert.ok(new Vector3(0,1,0).applyQuaternion(pose.quaternion).dot(pose.position.clone().normalize())>.97);
  }
  sampleNetworkFlight(network,start+route.duration+.1,pose,scratch);assert.ok(pose.scale.x<1e-12);const rotation=pose.quaternion.clone();
  sampleNetworkFlight(network,start+route.duration+GROUND_PAUSE-.01,pose,scratch);assert.ok(pose.scale.x<1e-12);assert.ok(pose.quaternion.angleTo(rotation)<1e-7);
 }
});
test("planes award 1000 points once on destruction, including full-charge shots and held rays",()=>{
 for(const weapon of ["tap","full","ray"]){
  const model=createAirplaneModel(),mesh=new InstancedMesh(model.geometry,model.material,1),dead=new Set(),store=createHudState();mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,3).scale(new Vector3(.13,.13,.13)));
  const target=createDestructible(mesh,dead,{dynamic:true,blast:.02,padding:.025,scorePerInstance:10}),from=new Vector3(),to=new Vector3(0,0,8);
  try {
   if(weapon==="ray"){const ray=createDeathRay();for(let i=0;i<120;i++)stepDeathRay(ray,1/60,from,new Quaternion(),[target],i/60,true,store.addDamage);}
   else {const hit=firstProjectileHit([target],from,to,0);assert.ok(hit);hit.destroy(weapon==="full"?1:0,store.addDamage);hit.destroy(1,store.addDamage);}
   assert.ok(dead.has(0));assert.equal(store.getSnapshot().score,1000);assert.equal(target.query(from,to,3),null);
  }finally {mesh.dispose();model.dispose();}
 }
});
test("cloud-like contrails have bounded pooled geometry, opacity attributes and cleanup",()=>{
 const trails=createContrails(FLEET_SIZE*TRAIL_PUFFS*2);assert.equal(trails.mesh.count,192);assert.equal(trails.alpha.count,192);assert.equal(trails.mesh.material.depthWrite,false);assert.equal(trails.mesh.material.depthTest,true);
 let disposed=0;trails.mesh.geometry.addEventListener("dispose",()=>disposed++);trails.dispose();assert.equal(disposed,1);
});
test("animation cannot resurrect a destroyed plane and its smoke expires instead of leaving a permanent trail",()=>{
 const model=createAirplaneModel(),mesh=new InstancedMesh(model.geometry,model.material,FLEET_SIZE),trails=createContrails(FLEET_SIZE*TRAIL_PUFFS*2),v=createTrafficVisualState(),dead=new Set();
 try {
  const time=GROUND_PAUSE+network.routes[0].duration*.5;stepTrafficVisuals(mesh,trails,network,time,1/60,dead,false,v);
  const target=createDestructible(mesh,dead,{dynamic:true,blast:.02,padding:.025,scorePerInstance:10}),store=createHudState(),point=v.lastPositions[0];
  const hit=target.query(point.clone().multiplyScalar(1.05),point.clone().multiplyScalar(.95),0);assert.ok(hit);hit.destroy(0,store.addDamage);assert.ok(dead.has(0));assert.ok(store.getSnapshot().score>=1000);
  for(let i=0;i<120;i++)stepTrafficVisuals(mesh,trails,network,time+i/60,1/60,dead,false,v);
  const m=new Matrix4();mesh.getMatrixAt(0,m);assert.ok(m.elements.slice(0,12).every(value=>value===0));
  assert.ok(Array.from(trails.alpha.array.slice(0,TRAIL_PUFFS*2)).every(value=>value===0));
 }finally {mesh.dispose();model.dispose();trails.dispose();}
});

test("lower twelve-plane fleet clears the real terrain, peak waves and full aircraft bounds",async()=>{
 const {createHexagonalEarthGeometry}=await import('../components/three/planet/hexagonal-earth-geometry.mjs');
 const earth=JSON.parse(readFileSync(new URL('../public/models/earth/block-earth.json',import.meta.url))),tile=createHexagonalEarthGeometry(),model=createAirplaneModel(),grid=new Map(),cell=.3;
 tile.computeBoundingSphere();assert.equal(FLEET_SIZE,12);
 const planeRadius=model.geometry.boundingSphere.radius*.13*1.12;
 for(let i=0;i<earth.sizes.length;i++){
  const p=new Vector3().fromArray(earth.positions,i*3),radius=tile.boundingSphere.radius*earth.sizes[i]*1.4+(earth.oceanMask[i]?.055:0),key=[p.x,p.y,p.z].map(n=>Math.floor(n/cell)).join(',');
  if(!grid.has(key))grid.set(key,[]);grid.get(key).push({p,radius});
 }
 const pose=new Object3D(),scratch=createTrafficScratch();
 try{for(let i=0;i<network.routes.length;i++)for(let j=0;j<=64;j++){
  const route=network.routes[i];sampleNetworkFlight(network,network.starts[i]+route.duration*j/64,pose,scratch,1.12);
  assert.ok(pose.position.length()<3.71);const [x,y,z]=pose.position.toArray().map(n=>Math.floor(n/cell));
  for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)for(let dz=-2;dz<=2;dz++)for(const tile of grid.get(`${x+dx},${y+dy},${z+dz}`)??[])
   assert.ok(pose.position.distanceTo(tile.p)>tile.radius+planeRadius,`terrain clearance on route ${i}, sample ${j}`);
 }}finally{tile.dispose();model.dispose();}
});

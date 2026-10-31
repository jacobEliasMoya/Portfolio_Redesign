import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {InstancedMesh,Matrix4,Object3D,Quaternion,Vector3} from 'three';
import {createRocketEvent,stepRocketEvent,destroyRocketEvent,rollRocketRarity,ROCKET_RARITIES,nextRocketDelay,ROCKET_FLIGHT_SECONDS} from '../components/three/rockets/rocket-event.mjs';
import {createRocketModel} from '../components/three/rockets/rocket-model.mjs';
import {sampleRocketPath,createRocketPathScratch,CAPE_CANAVERAL,LAUNCH_GROUND_RADIUS} from '../components/three/rockets/rocket-path.mjs';
import {createRocketTarget} from '../components/three/rockets/rocket-target.mjs';
import {createRocketVisuals,showRocketVisuals,rocketDestroyed,disposeRocketVisuals} from '../components/three/rockets/rocket-visuals.mjs';
import {airportDirection} from '../components/three/air-traffic/flight-routes.mjs';
import {createHudState} from '../components/three/ufo/hud-state.mjs';
import {firstProjectileHit} from '../components/three/ufo/projectile-collision.mjs';
import {createDeathRay,stepDeathRay} from '../components/three/ufo/death-ray.mjs';
test('rocket rarity boundaries give exactly 80/17/3 and configured rewards',()=>{
 const counts=[0,0,0];for(let i=0;i<10000;i++)counts[ROCKET_RARITIES.indexOf(rollRocketRarity(()=>i/10000))]++;
 assert.deepEqual(counts,[8000,1700,300]);assert.equal(rollRocketRarity(()=>.8).id,'rare');assert.equal(rollRocketRarity(()=>.97).id,'legendary');assert.equal(rollRocketRarity(()=>1).id,'legendary');
 assert.deepEqual(ROCKET_RARITIES.map(t=>t.reward),[5000,10000,25000]);assert.equal(nextRocketDelay(()=>0),60);assert.ok(nextRocketDelay(()=>1)<=120);
});
test('launch cadence has one rocket, no overlap, no early launch after a kill and no catch-up burst',()=>{
 const state=createRocketEvent(()=>0);assert.equal(stepRocketEvent(state,59.99),null);assert.equal(state.phase,'waiting');assert.equal(stepRocketEvent(state,.02),'launch');assert.equal(state.serial,1);
 const deadline=state.nextLaunch;stepRocketEvent(state,1);assert.equal(destroyRocketEvent(state),5000);assert.equal(destroyRocketEvent(state),0);assert.equal(state.nextLaunch,deadline);
 stepRocketEvent(state,2);assert.equal(state.phase,'waiting');assert.equal(state.serial,1);assert.equal(stepRocketEvent(state,deadline-state.time),'launch');assert.equal(state.serial,2);
 stepRocketEvent(state,ROCKET_FLIGHT_SECONDS+.01);assert.equal(state.phase,'waiting');const before=state.serial;assert.equal(stepRocketEvent(state,1000),'launch');assert.equal(state.serial,before+1);assert.ok(state.nextLaunch>state.time);
});
test('LC-39A lift begins over Florida, clears bundled local terrain and curves east into orbit',()=>{
 const pose=new Object3D(),scratch=createRocketPathScratch(),normal=airportDirection(CAPE_CANAVERAL),earth=JSON.parse(readFileSync(new URL('../public/models/earth/block-earth.json',import.meta.url))),position=new Vector3();let peak=2.98;
 for(let i=0;i<earth.sizes.length;i++){position.fromArray(earth.positions,i*3);const length=position.length();if(position.divideScalar(length).dot(normal)>.995)peak=Math.max(peak,length+earth.sizes[i]*1.5+(earth.oceanMask[i]?.055:0));}
 assert.ok(LAUNCH_GROUND_RADIUS>=peak);sampleRocketPath(0,pose,scratch);assert.ok(pose.position.clone().normalize().distanceTo(normal)<1e-9);assert.ok(new Vector3(0,1,0).applyQuaternion(pose.quaternion).dot(normal)>.999);
 let previous=pose.position.clone();for(let i=1;i<=220;i++){sampleRocketPath(i/10,pose,scratch);assert.ok(pose.position.length()>=previous.length()-1e-8);assert.ok(pose.position.distanceTo(previous)<.12);assert.ok(pose.quaternion.toArray().every(Number.isFinite));previous.copy(pose.position);}
 assert.ok(pose.position.length()>9);assert.ok(pose.scale.x<1e-10);assert.ok(pose.position.clone().normalize().distanceTo(normal)>.7);
});
test('all rarity models are bounded original merged assets with distinct silhouettes and disposal',()=>{
 const widths=[],heights=[];for(const tier of ROCKET_RARITIES){const model=createRocketModel(tier);let disposed=0;model.geometry.addEventListener('dispose',()=>disposed++);const box=model.geometry.boundingBox; widths.push(box.max.x-box.min.x);heights.push(box.max.y-box.min.y);
 assert.ok(model.geometry.attributes.position.count<6000);assert.ok(model.material.vertexColors);assert.ok(model.geometry.attributes.position.array.every(Number.isFinite));model.dispose();assert.equal(disposed,1);}
 assert.ok(widths[1]>widths[0]*2);assert.ok(heights[2]>heights[0]*1.1);
});
test('bolts and held ray award the flat rarity reward once; stale hits cannot kill the next launch',()=>{
 for(const tier of ROCKET_RARITIES)for(const weapon of ['tap','full','ray']){
  const event=createRocketEvent(()=>0);event.phase='flight';event.tier=tier;event.serial=1;const model=createRocketModel(tier),mesh=new InstancedMesh(model.geometry,model.material,1),dead=new Set(),store=createHudState();
  mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,3).scale(new Vector3(.25,.25,.25)));const target=createRocketTarget(mesh,tier,event,dead,()=>destroyRocketEvent(event));const from=new Vector3(),to=new Vector3(0,0,8),stale=target.query(from,to,0);assert.ok(stale);
  try{
   if(weapon==='ray'){const ray=createDeathRay();for(let i=0;i<120;i++)stepDeathRay(ray,1/60,from,new Quaternion(),[target],i/60,true,store.addDamage);}
   else {const hit=firstProjectileHit([target],from,to,0);assert.ok(hit);hit.destroy(weapon==='full'?1:0,store.addDamage);hit.destroy(1,store.addDamage);}
   assert.equal(store.getSnapshot().score,tier.reward);assert.equal(event.phase,'exploding');assert.equal(target.query(from,to,2),null);
   event.serial++;event.phase='flight';dead.clear();mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,3));assert.equal(stale.destroy(1,store.addDamage),0);assert.equal(store.getSnapshot().score,tier.reward);
  }finally{mesh.dispose();model.dispose();}
 }
});
test('universe consumption disables rocket hits; notices expire by generation without clearing newer rewards',()=>{
 const event=createRocketEvent(()=>0),tier=ROCKET_RARITIES[0],model=createRocketModel(tier),mesh=new InstancedMesh(model.geometry,model.material,1);event.phase='flight';event.tier=tier;mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,3));
 const target=createRocketTarget(mesh,tier,event,new Set(),()=>{},()=>true);assert.equal(target.query(new Vector3(),new Vector3(0,0,8),0),null);mesh.dispose();model.dispose();
 const store=createHudState();store.announceRocket('STANDARD ROCKET LAUNCH');const old=store.getSnapshot().rocketNotice.id;store.announceRocket('STANDARD ROCKET +5000');store.clearRocketNotice(old);assert.equal(store.getSnapshot().rocketNotice.text,'STANDARD ROCKET +5000');store.clearRocketNotice(store.getSnapshot().rocketNotice.id);assert.equal(store.getSnapshot().rocketNotice,null);
});
test('rocket visuals pool the plume and smoke, show a real compact explosion and never resurrect a killed rocket',()=>{
 const v=createRocketVisuals(),event=createRocketEvent(()=>0),store=createHudState();stepRocketEvent(event,60);event.age=3;showRocketVisuals(v,event,false);assert.equal(v.bodies.filter(b=>b.visible).length,1);assert.equal(v.flame.count,3);assert.equal(v.trails.mesh.count,16);
 rocketDestroyed(v,event,store,false);assert.equal(v.bodies.filter(b=>b.visible).length,0);assert.equal(v.blast.root.visible,true);assert.equal(v.flame.visible,false);assert.match(store.getSnapshot().rocketNotice.text,/\+5000/);
 stepRocketEvent(event,2);showRocketVisuals(v,event,false);assert.equal(v.blast.root.visible,false);assert.equal(v.bodies.some(b=>b.visible),false);disposeRocketVisuals(v);
});

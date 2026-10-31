import test from 'node:test';
import assert from 'node:assert/strict';
import {BoxGeometry,Group,InstancedMesh,Matrix4,Mesh,MeshStandardMaterial,Vector3} from 'three';
import {createAtomLaunch,createAtomProjectile,launchAtom,stepAtom,ATOM_LIFETIME,ATOM_SPEED} from '../components/three/black-hole/atom-projectile.mjs';
import {createAtomBomb} from '../components/three/black-hole/atom-bomb.mjs';
import {createSingularityEffect,launchSingularity,stepSingularity,disposeSingularityEffect} from '../components/three/black-hole/singularity-effect.mjs';
import {createDestructible,registerProjectileTarget} from '../components/three/ufo/projectile-collision.mjs';
const shot=()=>({origin:new Vector3(),heading:new Vector3(0,0,1),velocity:new Vector3()});
function targetAt(z){const geometry=new BoxGeometry(),material=new MeshStandardMaterial(),mesh=new InstancedMesh(geometry,material,1);mesh.setMatrixAt(0,new Matrix4().makeTranslation(0,0,z));const target=createDestructible(mesh,new Set(),{dynamic:true,padding:0,blast:.02});return {mesh,target,dispose(){mesh.dispose();geometry.dispose();material.dispose();}};}
test('atom launches from the real transformed cannon and inherits ship velocity',()=>{
 const ship=new Group();ship.position.set(2,3,4);ship.rotation.y=Math.PI/2;const velocity=new Vector3(1,2,3),launch=createAtomLaunch(ship,velocity,.38),p=createAtomProjectile();
 assert.ok(launch.origin.distanceTo(new Vector3(2+2.88*.38,3-.1*.38,4))<1e-8);assert.ok(launch.heading.distanceTo(new Vector3(1,0,0))<1e-8);
 assert.equal(launchAtom(p,launch),true);assert.ok(p.velocity.distanceTo(new Vector3(ATOM_SPEED+1,2,3))<1e-8);assert.equal(launchAtom(p,launch),false);
 assert.deepEqual(velocity.toArray(),[1,2,3]);assert.equal(createAtomLaunch(null,velocity,.38),null);
});
test('swept bomb contact picks the earliest target without tunneling or applying ordinary shot damage',()=>{
 const near=targetAt(2),far=targetAt(3),p=createAtomProjectile();launchAtom(p,shot());p.velocity.z=100;
 try{assert.equal(stepAtom(p,.1,[far.target,near.target],0),'impact');assert.ok(p.position.z<2);assert.equal(near.target.planetHits(),0);const impact=p.position.clone();stepAtom(p,.1,[far.target],1);assert.ok(p.position.equals(impact));}finally{near.dispose();far.dispose();}
});
test('a missed atom expires and never fabricates an impact',()=>{
 const p=createAtomProjectile();assert.equal(launchAtom(p,{...shot(),heading:new Vector3()}),false);launchAtom(p,shot());
 for(let i=0;i<70;i++)stepAtom(p,.1,[],i*.1);
 assert.equal(p.phase,'missed');assert.equal(p.age,ATOM_LIFETIME);assert.equal(p.impact,null);assert.ok(Math.abs(p.position.z-ATOM_SPEED*ATOM_LIFETIME)<1e-8);
});
test('only impact reveals the black hole at the contact point, with immediate suction and one capture',()=>{
 const effect=createSingularityEffect(),scene=new Group(),excluded=new Group(),body=targetAt(4),ship=new Mesh(new BoxGeometry(),new MeshStandardMaterial());ship.userData.singularityShip=true;
 excluded.userData.singularityExcluded=true;excluded.add(effect.model,effect.bomb.root);scene.add(excluded,body.mesh,ship);const unregister=registerProjectileTarget(body.mesh,body.target),original=body.mesh.material;
 try{
  assert.equal(effect.model.userData.modelStats.discTiles,7121);assert.equal(effect.model.visible,false);launchSingularity(effect,shot());assert.equal(effect.bomb.root.visible,true);
  stepSingularity(effect,scene,.1,10,new Vector3());assert.equal(effect.capture,null);assert.equal(effect.model.visible,false);assert.equal(body.mesh.material,original);
  for(let i=1;i<=4&&effect.projectile.phase==='flight';i++)stepSingularity(effect,scene,.1,10+i*.1,new Vector3());
  assert.equal(effect.projectile.phase,'impact');assert.ok(effect.model.position.equals(effect.projectile.position));assert.equal(effect.model.visible,true);assert.equal(effect.bomb.root.visible,false);
  const capture=effect.capture;assert.ok(capture.entries.find(e=>e.mesh===body.mesh).progress.value>0,'pull begins on the impact frame');assert.equal(capture.entries.find(e=>e.ship).progress.value,0);assert.ok(capture.reach.value>0);
  stepSingularity(effect,scene,.1,effect.started+4.1,effect.model.position.clone());assert.equal(effect.capture,capture);assert.equal(body.mesh.visible,false);
  stepSingularity(effect,scene,.1,effect.started+8.1,effect.model.position.clone());assert.equal(effect.phase,'consumed');assert.equal(effect.shipConsumed,true);
 }finally{disposeSingularityEffect(effect);assert.equal(body.mesh.material,original);unregister();body.dispose();ship.geometry.dispose();ship.material.dispose();}
});
test('atom art has a black nucleus and three bounded low-poly merged orbits with cleanup',()=>{
 const model=createAtomBomb();let meshes=0,vertices=0,disposed=0;
 model.root.traverse(node=>{if(node.isMesh){meshes++;vertices+=node.geometry.attributes.position.count;node.geometry.addEventListener('dispose',()=>disposed++);}});
 assert.equal(meshes,3);assert.ok(vertices<3000);assert.equal(model.orbits.children.length,2);model.dispose();assert.equal(disposed,3);
});

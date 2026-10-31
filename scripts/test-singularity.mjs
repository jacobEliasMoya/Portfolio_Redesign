import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Mesh,BoxGeometry,MeshStandardMaterial,Vector3} from 'three';
import {createHudState} from '../components/three/ufo/hud-state.mjs';
import {createWeaponSelection} from '../components/three/ufo/weapon-selection.mjs';
import {createWeaponCharge} from '../components/three/ufo/weapon-charge.mjs';
import {captureUniverse,stepUniverse,releaseUniverse} from '../components/three/black-hole/live-consumption.mjs';
test('strict score boundary and one use per universe, with flying/selection guards',()=>{
 const store=createHudState(),weapons=createWeaponSelection(),charge=createWeaponCharge();let fired=0;const shot={origin:new Vector3(),heading:new Vector3(0,0,1),velocity:new Vector3()};
 store.subscribeSingularity(()=>fired++);store.addDamage(67.67);
 assert.equal(store.getSnapshot().score,6767);assert.equal(store.requestWeapon('Digit3'),false);
 assert.equal(weapons.select('Digit3',charge,[],6767),false);assert.equal(store.fireSingularity(shot),false);
 store.addDamage(.01);assert.equal(weapons.select('Digit3',charge,[],6768),true);
 store.publish({weapon:'singularity'});assert.equal(store.fireSingularity(shot),false);
 store.publish({mode:'flying'});assert.equal(store.fireSingularity(),false);assert.equal(store.getSnapshot().singularityUsed,false);assert.equal(store.fireSingularity(shot),true);assert.equal(store.getSnapshot().singularityPhase,'flight');assert.equal(fired,1);
 assert.equal(store.fireSingularity(shot),true);assert.equal(store.getSnapshot().singularityPhase,'detonating');assert.equal(store.fireSingularity(shot),false);assert.equal(store.requestWeapon('Digit3'),false);
 weapons.begin('key',0,charge);assert.equal(charge.active,false);assert.equal(weapons.release('key',1000,charge),null);
 assert.equal(createHudState().getSnapshot().singularityUsed,false);
});
test('live capture keeps buffers, protects black hole, grants escape window and disposes clones',()=>{
 const scene=new Group(),material=new MeshStandardMaterial(),geometry=new BoxGeometry(),earth=new Mesh(geometry,material),ship=new Mesh(geometry,material),excluded=new Group();
 ship.userData.singularityShip=true;excluded.userData.singularityExcluded=true;excluded.add(new Mesh(geometry,material));scene.add(earth,ship,excluded);scene.updateMatrixWorld(true);
 const capture=captureUniverse(scene,new Vector3());assert.equal(capture.entries.length,2);assert.equal(earth.geometry,geometry);assert.notEqual(earth.material,material);
 const shader={uniforms:{},vertexShader:'#include <project_vertex>'};earth.material.onBeforeCompile(shader,{});assert.match(shader.vertexShader,/instanceMatrix/);assert.match(shader.vertexShader,/projectionMatrix/);
 stepUniverse(capture,3,new Vector3());assert.equal(capture.entries.find(e=>e.ship).progress.value,0);
 capture.shipCaptureAge=4;stepUniverse(capture,11,new Vector3());assert.equal(earth.visible,false);assert.equal(ship.visible,false);assert.equal(excluded.children[0].visible,true);
 releaseUniverse(capture);assert.equal(earth.material,material);assert.equal(earth.visible,true);geometry.dispose();material.dispose();
});

test('singularity reach stops expanding and an escaped ship remains visible',()=>{
 const scene=new Group(),ship=new Mesh(new BoxGeometry(),new MeshStandardMaterial());ship.userData.singularityShip=true;ship.position.set(100,0,0);scene.add(ship);scene.updateMatrixWorld(true);
 const capture=captureUniverse(scene,new Vector3());stepUniverse(capture,100,ship.position);
 assert.equal(capture.reach.value,capture.extent);assert.equal(ship.visible,true);releaseUniverse(capture);ship.geometry.dispose();ship.material.dispose();
});

test('reverse thrust carries the UFO outside finite suction before the capture deadline',async()=>{
 const {createFlight,stepFlight}=await import('../components/three/ufo/saucer-flight.mjs');
 const state=createFlight([0,0,-3]),scene=new Group(),ship=new Mesh(new BoxGeometry(),new MeshStandardMaterial());ship.userData.singularityShip=true;scene.add(ship);
 const capture=captureUniverse(scene,new Vector3()),input={turn:0,pitch:0,thrust:-1,strafe:0,roll:0,lift:0,brake:false};
 for(let frame=0;frame<9*120;frame++){
  const age=frame/120,distance=state.position.length();stepUniverse(capture,age,state.position);
  if(age>=4&&distance<capture.reach.value)state.velocity.addScaledVector(state.position.clone().normalize(),-Math.min(18,90/Math.max(1,distance))/120);
  stepFlight(state,input,1/120,{outer:156});
 }
 stepUniverse(capture,9,state.position);assert.ok(state.position.length()>capture.reach.value+3);assert.equal(ship.visible,true);
 releaseUniverse(capture);ship.geometry.dispose();ship.material.dispose();
});

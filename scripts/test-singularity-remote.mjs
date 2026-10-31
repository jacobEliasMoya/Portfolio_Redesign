import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Vector3} from 'three';
import {createHudState,canRemoteDetonate} from '../components/three/ufo/hud-state.mjs';
import {createWeaponSelection} from '../components/three/ufo/weapon-selection.mjs';
import {createWeaponCharge} from '../components/three/ufo/weapon-charge.mjs';
import {createSingularityEffect,launchSingularity,requestSingularityDetonation,stepSingularity,disposeSingularityEffect} from '../components/three/black-hole/singularity-effect.mjs';
import {createAtomProjectile,launchAtom,stepAtom,detonateAtom} from '../components/three/black-hole/atom-projectile.mjs';
import {createBlackHole,disposeBlackHole} from '../components/three/black-hole/create-black-hole.mjs';
import {createMaterialization,stepMaterialization} from '../components/three/black-hole/materialization.mjs';
const shot=()=>({origin:new Vector3(),heading:new Vector3(0,0,1),velocity:new Vector3()});
test('one launch and one remote trigger, with slot reselection and capture guards',()=>{
 const store=createHudState(),events=[],selection=createWeaponSelection(),charge=createWeaponCharge();store.subscribeSingularity(s=>events.push(s));store.addDamage(70);store.publish({mode:'flying',weapon:'singularity'});
 assert.equal(store.detonateSingularity(),false);assert.equal(store.fireSingularity(shot()),true);assert.equal(canRemoteDetonate(store.getSnapshot()),true);
 store.publish({weapon:'bolts',singularityPhase:'armed'});const detach=store.subscribeWeaponRequest(code=>selection.select(code,charge,[],store.getSnapshot().score,store.getSnapshot().singularityUsed&&!canRemoteDetonate(store.getSnapshot())));
 assert.equal(store.requestWeapon('Digit3'),true);assert.equal(selection.selected,'singularity');store.publish({weapon:'singularity'});
 assert.equal(store.fireSingularity(),true);assert.equal(store.fireSingularity(shot()),false);assert.equal(store.detonateSingularity(),false);assert.equal(events.length,2);assert.equal(events[1],null);assert.equal(store.getSnapshot().score,7000);
 detach();store.publish({singularityPhase:'armed',singularityShipCaptured:true});assert.equal(store.detonateSingularity(),false);
});
test('missed bombs loiter armed and can be remotely triggered long after their travel limit',()=>{
 const p=createAtomProjectile();launchAtom(p,shot());for(let i=0;i<70;i++)stepAtom(p,.1,[],i*.1);const point=p.position.clone();assert.equal(p.phase,'armed');assert.equal(p.velocity.length(),0);
 for(let i=0;i<600;i++)stepAtom(p,.1,[],20+i*.1);assert.ok(p.position.equals(point));assert.equal(detonateAtom(p),true);assert.equal(p.impact,null);assert.equal(detonateAtom(p),false);
});
test('midair remote trigger forms one hole at the current projectile position with immediate suction',()=>{
 const effect=createSingularityEffect(),scene=new Group(),excluded=new Group();excluded.userData.singularityExcluded=true;excluded.add(effect.model,effect.bomb.root);scene.add(excluded);
 try{launchSingularity(effect,shot());stepSingularity(effect,scene,.1,1,new Vector3(0,0,-50));assert.equal(effect.capture,null);const point=effect.projectile.position.clone();
 assert.equal(requestSingularityDetonation(effect),true);stepSingularity(effect,scene,.1,2,new Vector3(0,0,-50));assert.ok(effect.model.position.equals(point));assert.equal(effect.projectile.impact,null);assert.equal(effect.bomb.root.visible,false);assert.equal(effect.model.visible,true);assert.ok(effect.capture.reach.value>0);
 const capture=effect.capture;assert.equal(requestSingularityDetonation(effect),false);stepSingularity(effect,scene,.1,2.1,new Vector3(0,0,-50));assert.equal(effect.capture,capture);
 }finally{disposeSingularityEffect(effect);}
});
test('materialization uses shared shaders and only uniforms/parent transforms, then restores the original matte silhouette',()=>{
 const model=createBlackHole({wideDisc:true}),birth=createMaterialization(model),buffers=birth.bands.map(b=>b.mesh.instanceMatrix.array),versions=birth.bands.map(b=>b.mesh.instanceMatrix.version);
 try{const keys=birth.bands.map(b=>b.mesh.material.customProgramCacheKey());assert.equal(new Set(keys).size,1);
 const shader={uniforms:{},vertexShader:'#include <project_vertex>'};birth.bands[0].mesh.material.onBeforeCompile(shader,{});assert.match(shader.vertexShader,/uBirthDelay/);assert.match(shader.vertexShader,/birthPosition/);
 stepMaterialization(birth,0,.016);assert.ok(birth.shell.scale.x<.1);stepMaterialization(birth,.3,.016);assert.equal(birth.ring.visible,true);assert.ok(birth.shell.scale.x>.1&&birth.shell.scale.x<1.2);
 stepMaterialization(birth,10,.016);assert.deepEqual(birth.shell.scale.toArray(),[1,1,1]);assert.equal(birth.ring.visible,false);assert.ok(Math.abs(birth.disc.rotation.x-birth.baseX)<1e-10);
 for(let i=0;i<buffers.length;i++){assert.equal(birth.bands[i].mesh.instanceMatrix.array,buffers[i]);assert.equal(birth.bands[i].mesh.instanceMatrix.version,versions[i]);}
 assert.equal(model.userData.modelStats.discTiles,7121);
 }finally{disposeBlackHole(model);}
});
test('reduced motion shows the settled hole without shock or spin, and birth resources dispose once',()=>{
 const model=createBlackHole({wideDisc:true}),birth=createMaterialization(model),rotation=birth.bands[0].mesh.rotation.y;let disposed=0;birth.ring.geometry.addEventListener('dispose',()=>disposed++);
 stepMaterialization(birth,0,.1,true);assert.deepEqual(birth.shell.scale.toArray(),[1,1,1]);assert.equal(birth.ring.visible,false);assert.equal(birth.bands[0].mesh.rotation.y,rotation);assert.equal(model.userData.materializationProgress,1);disposeBlackHole(model);assert.equal(disposed,1);
});

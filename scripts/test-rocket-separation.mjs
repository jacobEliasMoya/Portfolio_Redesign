import test from 'node:test';
import assert from 'node:assert/strict';
import {Matrix4,Object3D,Vector3} from 'three';
import {createRocketModel} from '../components/three/rockets/rocket-model.mjs';
import {ROCKET_RARITIES,createRocketEvent,destroyRocketEvent} from '../components/three/rockets/rocket-event.mjs';
import {createRocketVisuals,showRocketVisuals,rocketDestroyed,disposeRocketVisuals} from '../components/three/rockets/rocket-visuals.mjs';
import {createSeparationScratch,sampleDetachedStage,rocketStage,rocketEngineCount} from '../components/three/rockets/rocket-separation.mjs';
import {sampleRocketPath,createRocketPathScratch} from '../components/three/rockets/rocket-path.mjs';
import {createRocketTarget} from '../components/three/rockets/rocket-target.mjs';
import {createHudState} from '../components/three/ufo/hud-state.mjs';
const heavy=ROCKET_RARITIES[1];
test('Falcon-style staging happens outside the cloud layer and retains one upper target',()=>{
 const model=createRocketModel(heavy),pose=new Object3D(),scratch=createRocketPathScratch();
 try{assert.equal(model.detachable.length,3);assert.equal(rocketStage(heavy,6.99),'full');assert.equal(rocketStage(heavy,7),'core');assert.equal(rocketStage(heavy,10),'upper');assert.equal(rocketStage(ROCKET_RARITIES[0],9),'upper');
 for(const part of model.detachable){sampleRocketPath(part.release,pose,scratch);assert.ok(pose.position.length()>4);}
 const full=model.geometry.boundingBox,upper=model.upperGeometry.boundingBox;assert.ok(full.max.y-full.min.y>2.6);assert.ok(upper.max.x-upper.min.x>.18);assert.ok(model.detachable[0].geometry.boundingBox.max.y+model.detachable[0].pivot.y<1);
 }finally{model.dispose();}
});
test('discarded stages start at the exact attachment pose, diverge, fall and fade above Earth',()=>{
 const model=createRocketModel(heavy),pose=new Object3D(),release=new Object3D(),scratch=createSeparationScratch(),path=createRocketPathScratch(),offset=new Vector3();
 try{for(const part of model.detachable){
  assert.equal(sampleDetachedStage(part,part.release-.001,pose,scratch),false);sampleRocketPath(part.release,release,path);
  assert.equal(sampleDetachedStage(part,part.release,pose,scratch),true);const expected=release.position.clone().add(offset.copy(part.pivot).multiplyScalar(release.scale.x).applyQuaternion(release.quaternion));assert.ok(pose.position.distanceTo(expected)<1e-9);assert.ok(pose.quaternion.angleTo(release.quaternion)<1e-7);
  const before=pose.position.clone();sampleDetachedStage(part,part.release+.001,pose,scratch);assert.ok(pose.position.distanceTo(before)<.002);
  let maxRadius=0,lastRadius=0;for(let i=1;i<80;i++){if(sampleDetachedStage(part,part.release+i*.1,pose,scratch)){const radius=pose.position.length();assert.ok(radius-part.geometry.boundingSphere.radius*pose.scale.x>=3.65-1e-8);maxRadius=Math.max(maxRadius,radius);lastRadius=radius;assert.ok(pose.matrix.elements.every(Number.isFinite));}}
  assert.ok(lastRadius<maxRadius-.01,'stage should arc Earthward before fading');assert.equal(sampleDetachedStage(part,part.release+8,pose,scratch),false);
 }
 sampleDetachedStage(model.detachable[0],8,pose,scratch);const left=pose.position.clone();sampleDetachedStage(model.detachable[1],8,pose,scratch);assert.ok(pose.position.distanceTo(left)>.4);
 }finally{model.dispose();}
});
test('upper-stage canonical position is continuous across geometry and collider changes',()=>{
 const v=createRocketVisuals(),event=createRocketEvent(()=>0);event.phase='flight';event.tier=heavy;event.age=10;
 try{showRocketVisuals(v,event,false);const body=v.bodies[1],matrix=new Matrix4();body.getMatrixAt(0,matrix);
 const canonical=new Vector3(0,1.74,0),fromUpper=canonical.clone().sub(v.models[1].upperPivot).applyMatrix4(matrix),expected=canonical.clone().multiplyScalar(v.pose.scale.x).applyQuaternion(v.pose.quaternion).add(v.pose.position);
 assert.ok(fromUpper.distanceTo(expected)<1e-6);assert.equal(body.geometry,v.models[1].upperGeometry);assert.ok(v.detached.every(mesh=>mesh.visible));
 }finally{disposeRocketVisuals(v);}
});
test('side engines shut off on separation, with a short coast then upper engine ignition',()=>{
 assert.equal(rocketEngineCount(heavy,6.99),3);assert.equal(rocketEngineCount(heavy,7),1);assert.equal(rocketEngineCount(heavy,10),0);assert.equal(rocketEngineCount(heavy,10.21),1);
 const v=createRocketVisuals(),event=createRocketEvent(()=>0);event.phase='flight';event.tier=heavy;event.age=7;
 try{showRocketVisuals(v,event,false);const matrix=new Matrix4();for(const i of [1,2]){v.flame.getMatrixAt(i,matrix);assert.equal(new Vector3().setFromMatrixScale(matrix).length(),0);}assert.equal(v.detached.filter(m=>m.visible).length,2);
 }finally{disposeRocketVisuals(v);}
});
test('a stale attached-stack hit cannot score after separation; the upper stage awards once',()=>{
 const v=createRocketVisuals(),event=createRocketEvent(()=>0),store=createHudState();event.phase='flight';event.tier=ROCKET_RARITIES[0];event.serial=1;event.age=8.999;showRocketVisuals(v,event,false);
 const mesh=v.bodies[0],target=createRocketTarget(mesh,event.tier,event,v.dead[0],()=>destroyRocketEvent(event)),point=v.bodyPose.position.clone(),span=new Vector3(0,0,.01),from=point.clone().add(span),to=point.clone().sub(span),stale=target.query(from,to,0);assert.ok(stale);
 try{event.age=9.001;showRocketVisuals(v,event,false);assert.equal(stale.destroy(1,store.addDamage),0);assert.equal(target.query(from,to,1),null,'discarded-space collider must disappear');
  const center=v.bodyPose.position.clone(),hit=target.query(center.clone().add(span),center.clone().sub(span),1.1);assert.ok(hit);hit.destroy(1,store.addDamage);hit.destroy(1,store.addDamage);assert.equal(store.getSnapshot().score,5000);
 }finally{disposeRocketVisuals(v);}
});
test('destruction removes all separated stages, centers the blast on the live upper stage and disposes shared geometry once',()=>{
 const v=createRocketVisuals(),event=createRocketEvent(()=>0),store=createHudState();event.phase='flight';event.tier=heavy;event.age=11;showRocketVisuals(v,event,false);const center=v.bodyPose.position.clone();assert.ok(v.detached.some(m=>m.visible));
 rocketDestroyed(v,event,store,false);assert.equal(v.detached.some(m=>m.visible),false);assert.ok(v.blast.root.position.equals(center));showRocketVisuals(v,event,false);assert.equal(v.detached.some(m=>m.visible),false);
 const model=v.models[1],geometries=new Set([model.geometry,model.coreGeometry,model.upperGeometry,...model.detachable.map(p=>p.geometry)]),counts=new Map();for(const g of geometries)g.addEventListener('dispose',()=>counts.set(g,(counts.get(g)??0)+1));disposeRocketVisuals(v);assert.equal(counts.size,geometries.size);assert.ok([...counts.values()].every(n=>n===1));
});

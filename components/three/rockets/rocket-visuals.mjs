import {Color,ConeGeometry,DynamicDrawUsage,Group,InstancedMesh,MeshBasicMaterial,Object3D,Vector3} from "three";
import {createContrails} from "../air-traffic/contrails.mjs";
import {createCrashBlast} from "../ufo/crash-blast.mjs";
import {rocketBodyPart,rocketEngineY,rocketEngineCount,rocketStage,createSeparationScratch,sampleDetachedStage} from "./rocket-separation.mjs";
import {createRocketModel,HEAVY_SIDE_OFFSET} from "./rocket-model.mjs";
import {ROCKET_RARITIES,destroyRocketEvent} from "./rocket-event.mjs";
import {createRocketPathScratch,sampleRocketPath} from "./rocket-path.mjs";
export function createRocketVisuals(){
 const root=new Group(),models=ROCKET_RARITIES.map(createRocketModel),dead=ROCKET_RARITIES.map(()=>new Set());
 const bodies=models.map((model,i)=>{const mesh=new InstancedMesh(model.geometry,model.material,1);mesh.name=`${ROCKET_RARITIES[i].label} rocket target`;mesh.instanceMatrix.setUsage(DynamicDrawUsage);mesh.frustumCulled=false;mesh.visible=false;root.add(mesh);return mesh;});
 const detached=Array.from({length:3},()=>{const mesh=new InstancedMesh(models[0].detachable[0].geometry,models[0].material,1);mesh.instanceMatrix.setUsage(DynamicDrawUsage);mesh.frustumCulled=false;mesh.visible=false;root.add(mesh);return mesh;});
 const geometry=new ConeGeometry(1,1,6);geometry.rotateZ(Math.PI);const material=new MeshBasicMaterial({color:"#ffffff",toneMapped:false}),flame=new InstancedMesh(geometry,material,3),trails=createContrails(16),blast=createCrashBlast();
 flame.frustumCulled=false;flame.visible=false;flame.instanceMatrix.setUsage(DynamicDrawUsage);blast.root.scale.setScalar(.16);blast.hide();root.add(flame,trails.mesh,blast.root);root.name="Cape Canaveral launch events";
 return {root,models,bodies,detached,dead,flame,bodyPose:new Object3D(),stagePose:new Object3D(),separation:createSeparationScratch(),trails,blast,pose:new Object3D(),past:new Object3D(),puff:new Object3D(),scratch:createRocketPathScratch(),history:createRocketPathScratch(),offset:new Vector3(),normal:new Vector3(),color:new Color()};
}
export function stopRocketEffects(v){v.flame.visible=false;v.trails.mesh.visible=false;v.blast.hide();}
export function showRocketVisuals(v,event,reducedMotion){
 const flying=event.phase==="flight",index=ROCKET_RARITIES.indexOf(event.tier);
 for(const mesh of v.detached)mesh.visible=false;
 for(let i=0;i<v.bodies.length;i++)v.bodies[i].visible=flying&&index===i;
 v.flame.visible=flying&&!reducedMotion;v.trails.mesh.visible=flying&&!reducedMotion;
 if(event.phase==="exploding"){if(reducedMotion)v.blast.hide();else v.blast.step(event.time-event.deathTime);}
 else v.blast.hide();
 if(!flying)return;
 sampleRocketPath(event.age,v.pose,v.scratch);
 const model=v.models[index],part=rocketBodyPart(model,event.tier,event.age),stage=rocketStage(event.tier,event.age),engineCount=rocketEngineCount(event.tier,event.age);
 v.bodyPose.position.copy(v.pose.position).add(v.offset.copy(part.pivot).multiplyScalar(v.pose.scale.x).applyQuaternion(v.pose.quaternion));v.bodyPose.quaternion.copy(v.pose.quaternion);v.bodyPose.scale.copy(v.pose.scale);v.bodyPose.updateMatrix();
 v.bodies[index].geometry=part.geometry;v.bodies[index].setMatrixAt(0,v.bodyPose.matrix);v.bodies[index].instanceMatrix.needsUpdate=true;
 for(let i=0;i<model.detachable.length;i++){const dropped=model.detachable[i],mesh=v.detached[i];if(sampleDetachedStage(dropped,event.age,v.stagePose,v.separation)){mesh.geometry=dropped.geometry;mesh.material=model.material;mesh.setMatrixAt(0,v.stagePose.matrix);mesh.instanceMatrix.needsUpdate=true;mesh.visible=true;}}

 for(let i=0;i<3;i++){
  const active=i<engineCount,length=((stage==="upper"?.14:.22)+(reducedMotion?0:.025*Math.sin(event.age*22+i)))*(v.pose.scale.x/.25),x=i===1?-HEAVY_SIDE_OFFSET:i===2?HEAVY_SIDE_OFFSET:0;
  v.puff.position.copy(v.pose.position).add(v.offset.set(x*v.pose.scale.x,rocketEngineY(event.tier,event.age)*v.pose.scale.x-length/2,0).applyQuaternion(v.pose.quaternion));v.puff.quaternion.copy(v.pose.quaternion);
  v.puff.scale.set(active?.035*(v.pose.scale.x/.25):0,active?length:0,active?.035*(v.pose.scale.x/.25):0);v.puff.updateMatrix();v.flame.setMatrixAt(i,v.puff.matrix);v.color.set(event.tier.id==="legendary"?"#ffd45f":i%2?"#ffdcb4":"#ffae71");v.flame.setColorAt(i,v.color);
 }
 v.flame.instanceMatrix.needsUpdate=true;if(v.flame.instanceColor)v.flame.instanceColor.needsUpdate=true;
 for(let i=0;i<16;i++){
  const delay=(i+1)*.1,valid=event.age>delay;sampleRocketPath(Math.max(0,event.age-delay),v.past,v.history);
  v.puff.position.copy(v.past.position).add(v.offset.set(0,rocketEngineY(event.tier,Math.max(0,event.age-delay))*v.past.scale.x-.04-i*.003,0).applyQuaternion(v.past.quaternion));v.puff.quaternion.identity();v.puff.scale.setScalar(valid?(.018+i*.0035):0);v.puff.updateMatrix();v.trails.mesh.setMatrixAt(i,v.puff.matrix);v.trails.alpha.setX(i,valid?(1-i/16)*.3:0);
 }
 v.trails.mesh.instanceMatrix.needsUpdate=true;v.trails.alpha.needsUpdate=true;
}
export function rocketDestroyed(v,event,store,reducedMotion){
 const reward=destroyRocketEvent(event);if(!reward)return;
 v.normal.copy(v.bodyPose.position).normalize();v.blast.trigger({kind:"crash",point:v.bodyPose.position,normal:v.normal},reducedMotion);
 store.announceRocket(`${event.tier.label} ROCKET +${reward}`,event.tier.color);
 showRocketVisuals(v,event,reducedMotion);
}
export function disposeRocketVisuals(v){v.bodies.forEach(mesh=>mesh.dispose());v.detached.forEach(mesh=>mesh.dispose());v.models.forEach(model=>model.dispose());v.flame.dispose();v.flame.geometry.dispose();v.flame.material.dispose();v.trails.dispose();v.blast.dispose();}

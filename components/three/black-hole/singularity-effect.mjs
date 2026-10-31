import {Vector3} from "three";
import {createShipCapture,updateShipCapture,SINGULARITY_CORE_RADIUS} from "./ship-capture.mjs";
import {createBlackHole,animateBlackHole,disposeBlackHole} from "./create-black-hole.mjs";
import {captureUniverse,stepUniverse,releaseUniverse} from "./live-consumption.mjs";
import {createAtomBomb,stepAtomBomb} from "./atom-bomb.mjs";
import {createAtomProjectile,launchAtom,stepAtom} from "./atom-projectile.mjs";
import {getProjectileTarget} from "../ufo/projectile-collision.mjs";
/** Prepare one reusable projectile and the approved black hole before firing. */
export function createSingularityEffect(){
 const bomb=createAtomBomb(),model=createBlackHole({wideDisc:true});bomb.root.visible=false;model.visible=false;
 return {bomb,model,projectile:createAtomProjectile(),capture:null,age:0,started:0,targets:[],phase:"idle",shipConsumed:false,shipCapture:createShipCapture(),center:new Vector3()};
}
export function launchSingularity(effect,shot){
 if(!launchAtom(effect.projectile,shot))return false;
 effect.bomb.root.position.copy(effect.projectile.position);effect.bomb.root.visible=true;effect.phase="flight";return true;
}
export function stepSingularity(effect,scene,delta,now,shipPosition,reducedMotion=false){
 if(effect.phase==="idle"||effect.phase==="missed")return false;
 const dt=Math.max(0,Math.min(.1,delta));
 if(effect.projectile.phase==="flight"){
  effect.targets.length=0;scene.traverse(object=>{const target=getProjectileTarget(object);if(target)effect.targets.push(target);});
  const phase=stepAtom(effect.projectile,dt,effect.targets,now);
  stepAtomBomb(effect.bomb,effect.projectile.position,dt,reducedMotion);
  if(phase==="flight")return true;
  effect.bomb.root.visible=false;effect.targets.length=0;
  if(phase==="missed"){effect.phase="missed";return false;}
  // A real swept collision is the only path that can create the black hole.
  effect.capture=captureUniverse(scene,effect.projectile.position);
  effect.model.position.copy(effect.projectile.position);effect.model.scale.setScalar(.22);effect.model.visible=true;
  effect.started=now;effect.age=0;
 }
 effect.age=Math.max(0,now-effect.started);
 effect.model.scale.setScalar(.22+Math.min(1,effect.age/4)*1.0);
 animateBlackHole(effect.model,dt,reducedMotion);
 effect.model.updateWorldMatrix(true,false);effect.model.getWorldPosition(effect.center);
 const radius=SINGULARITY_CORE_RADIUS*effect.model.matrixWorld.getMaxScaleOnAxis();
 if(updateShipCapture(effect.shipCapture,shipPosition,effect.center,radius,effect.age)&&effect.capture.shipCaptureAge===null)effect.capture.shipCaptureAge=effect.age;
 effect.model.userData.singularityShipCaptured=effect.shipCapture.captured;effect.model.userData.singularityCaptureRadius=radius;
 stepUniverse(effect.capture,effect.age,shipPosition,reducedMotion);
 effect.model.userData.singularityAge=effect.age;effect.model.userData.singularityReach=effect.capture.reach.value;
 effect.phase=effect.age<4?"escape":effect.age<8?"consuming":"consumed";
 effect.shipConsumed=effect.shipCapture.captured&&effect.age>=effect.capture.shipCaptureAge+(reducedMotion?.3:2);
 return effect.age<12;
}
export function disposeSingularityEffect(effect){
 if(effect.capture){releaseUniverse(effect.capture);effect.capture=null;}
 effect.bomb.dispose();disposeBlackHole(effect.model);
}

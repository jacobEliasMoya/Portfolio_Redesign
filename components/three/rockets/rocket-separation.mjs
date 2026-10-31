import {Object3D,Quaternion,Vector3} from "three";
import {sampleRocketPath,createRocketPathScratch} from "./rocket-path.mjs";
import {ROCKET_STAGING} from "./rocket-event.mjs";
export const DETACHED_STAGE_LIFE=ROCKET_STAGING.returnLife;
const localZ=new Vector3(0,0,1);
export function rocketStage(tier,age){return tier.id==="legendary"?"single":age>=(tier.id==="rare"?ROCKET_STAGING.heavyCore:ROCKET_STAGING.standardCore)?"upper":tier.id==="rare"&&age>=ROCKET_STAGING.sideBoosters?"core":"full";}
export function rocketBodyPart(model,tier,age){return model.stages[rocketStage(tier,age)];}
export function rocketEngineY(tier,age){return rocketStage(tier,age)==="upper"?.86:tier.id==="legendary"?-.9:-.93;}
export function rocketEngineCount(tier,age){const stage=rocketStage(tier,age),release=tier.id==="rare"?ROCKET_STAGING.heavyCore:ROCKET_STAGING.standardCore;return stage==="upper"&&age<release+ROCKET_STAGING.coast?0:stage==="full"&&tier.id==="rare"?3:1;}
export function createSeparationScratch(){return {release:new Object3D(),next:new Object3D(),path:createRocketPathScratch(),velocity:new Vector3(),radial:new Vector3(),right:new Vector3(),rotation:new Quaternion(),offset:new Vector3()};}
/** Absolute-time release: exact attachment point at t=0, inherited ascent velocity, outward kick then Earthward fall. */
export function sampleDetachedStage(part,age,out,s){
 const t=age-part.release;if(t<0||t>=DETACHED_STAGE_LIFE){out.scale.setScalar(0);out.updateMatrix();return false;}
 sampleRocketPath(part.release,s.release,s.path);sampleRocketPath(part.release+.01,s.next,s.path);
 s.velocity.copy(s.next.position).sub(s.release.position).multiplyScalar(100);s.radial.copy(s.release.position).normalize();s.right.set(1,0,0).applyQuaternion(s.release.quaternion);
 out.position.copy(s.release.position).add(s.offset.copy(part.pivot).multiplyScalar(s.release.scale.x).applyQuaternion(s.release.quaternion)).addScaledVector(s.velocity,t).addScaledVector(s.right,part.side*.22*t).addScaledVector(s.radial,-.025*t*t);
 out.quaternion.copy(s.release.quaternion).multiply(s.rotation.setFromAxisAngle(localZ,(part.side||.6)*t*.24));
 const fade=Math.min(1,(DETACHED_STAGE_LIFE-t)/1.5),clearance=Math.max(0,(out.position.length()-3.65)/part.geometry.boundingSphere.radius);out.scale.setScalar(Math.min(s.release.scale.x*fade,clearance));out.updateMatrix();return out.scale.x>0;
}

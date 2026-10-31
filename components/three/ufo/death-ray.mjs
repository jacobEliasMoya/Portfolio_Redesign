import {Quaternion,Vector3} from "three";
import {firstProjectileHit} from "./projectile-collision.mjs";
export const DEATH_RAY_RANGE=80,DEATH_RAY_FADE_SECONDS=.12;
// A fixed damage cadence drills/scorches the target without multiplying damage by frame rate.
export const DEATH_RAY_HIT_INTERVAL=.2,DEATH_RAY_HIT_POWER=.2;
export function createDeathRay(){return {active:false,held:false,age:0,releaseAge:DEATH_RAY_FADE_SECONDS,nextDamage:0,origin:new Vector3(),end:new Vector3(),direction:new Vector3(0,0,1),rotation:new Quaternion(),length:0,hit:false};}
export const deathRayActive=ray=>ray.active;
export function cancelDeathRay(ray){ray.active=false;ray.held=false;ray.releaseAge=DEATH_RAY_FADE_SECONDS;ray.length=0;ray.hit=false;}
/** No charging: input starts a full-length beam immediately and release stops damage immediately. */
export function stepDeathRay(ray,delta,origin,rotation,targets,now,held){
 const dt=Math.max(0,Math.min(.1,delta));
 if(!held){
  ray.held=false;if(!ray.active)return false;
  ray.releaseAge+=dt;if(ray.releaseAge>=DEATH_RAY_FADE_SECONDS){cancelDeathRay(ray);return false;}return true;
 }
 if(!ray.active||!ray.held){ray.active=true;ray.age=0;ray.nextDamage=0;}
 ray.held=true;ray.releaseAge=0;ray.age+=dt;
 ray.origin.copy(origin);ray.rotation.copy(rotation);ray.direction.set(0,0,1).applyQuaternion(rotation).normalize();ray.end.copy(origin).addScaledVector(ray.direction,DEATH_RAY_RANGE);
 const hit=firstProjectileHit(targets,ray.origin,ray.end,now);ray.hit=!!hit;
 if(hit){
  ray.end.copy(hit.point);
  if(ray.age+1e-9>=ray.nextDamage){hit.destroy(DEATH_RAY_HIT_POWER);ray.nextDamage+=DEATH_RAY_HIT_INTERVAL;if(ray.nextDamage<=ray.age)ray.nextDamage=ray.age+DEATH_RAY_HIT_INTERVAL;}
 }
 ray.length=ray.origin.distanceTo(ray.end);return true;
}
export function deathRayEnvelope(ray){return !ray.active?0:ray.held?1:Math.max(0,1-ray.releaseAge/DEATH_RAY_FADE_SECONDS);}

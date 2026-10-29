import {Quaternion,Vector3} from "three";
import {projectileAcceleration} from "./projectile-gravity.mjs";
const scratchByPool=new WeakMap(),FORWARD=new Vector3(0,0,1);
export const BOLT_LIFETIME=1.8;
export function createBoltPool(count=24){return Array.from({length:count},()=>({age:BOLT_LIFETIME,position:new Vector3(),previous:new Vector3(),impact:false,power:0,velocity:new Vector3(),rotation:new Quaternion()}));}
export function launchBolt(pool,position,rotation,shipVelocity,power=0){
 const bolt=pool.find(b=>b.age>=BOLT_LIFETIME);if(!bolt)return false;
 bolt.power=Math.max(0,Math.min(1,Number.isFinite(power)?power:0));bolt.age=0;bolt.impact=false;bolt.position.copy(position);bolt.previous.copy(position);bolt.rotation.copy(rotation);
 bolt.velocity.set(0,0,14+bolt.power*10).applyQuaternion(rotation).add(shipVelocity);return true;
}
export function advanceBolts(pool,delta,sources=[],onSegment){
 const dt=Math.max(0,Math.min(delta,.1));let alive=0;
 let scratch=scratchByPool.get(pool);if(!scratch){scratch={a:new Vector3(),b:new Vector3(),direction:new Vector3()};scratchByPool.set(pool,scratch);}
 const steps=sources.length?Math.max(1,Math.ceil(dt/(1/120))):1,h=dt/steps;
 for(const bolt of pool){
  if(bolt.age>=BOLT_LIFETIME)continue;
  if(bolt.impact){bolt.age+=dt;if(bolt.age<BOLT_LIFETIME)alive++;continue;}
  for(let step=0;step<steps;step++){
   bolt.previous.copy(bolt.position);bolt.age+=h;if(bolt.age>=BOLT_LIFETIME)break;
   if(sources.length){
    projectileAcceleration(bolt.position,sources,scratch.a);
    bolt.position.addScaledVector(bolt.velocity,h).addScaledVector(scratch.a,.5*h*h);
    projectileAcceleration(bolt.position,sources,scratch.b);
    bolt.velocity.addScaledVector(scratch.a,.5*h).addScaledVector(scratch.b,.5*h);
    if(bolt.velocity.lengthSq()>1e-12)bolt.rotation.setFromUnitVectors(FORWARD,scratch.direction.copy(bolt.velocity).normalize());
   }else bolt.position.addScaledVector(bolt.velocity,h);
   if(onSegment?.(bolt))break;
  }
  if(bolt.age<BOLT_LIFETIME)alive++;
 }
 return alive;
}

import {Quaternion,Vector3} from "three";
export const BOLT_LIFETIME=1.8;
export function createBoltPool(count=24){return Array.from({length:count},()=>({age:BOLT_LIFETIME,position:new Vector3(),previous:new Vector3(),impact:false,power:0,velocity:new Vector3(),rotation:new Quaternion()}));}
export function launchBolt(pool,position,rotation,shipVelocity,power=0){
 const bolt=pool.find(b=>b.age>=BOLT_LIFETIME);if(!bolt)return false;
 bolt.power=Math.max(0,Math.min(1,Number.isFinite(power)?power:0));bolt.age=0;bolt.impact=false;bolt.position.copy(position);bolt.previous.copy(position);bolt.rotation.copy(rotation);
 bolt.velocity.set(0,0,14+bolt.power*10).applyQuaternion(rotation).add(shipVelocity);return true;
}
export function advanceBolts(pool,delta){
 const dt=Math.max(0,Math.min(delta,.1));let alive=0;
 for(const bolt of pool){if(bolt.age>=BOLT_LIFETIME)continue;bolt.previous.copy(bolt.position);bolt.age+=dt;if(bolt.age<BOLT_LIFETIME){bolt.position.addScaledVector(bolt.velocity,dt);alive++;}}
 return alive;
}

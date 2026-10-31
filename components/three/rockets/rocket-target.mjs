import {createDestructible} from "../ufo/projectile-collision.mjs";
/** Same swept bolt/ray pipeline as aircraft; generation guards prevent stale hits rewarding a later launch. */
export function createRocketTarget(mesh,tier,event,dead,onDestroyed,universeEnding=()=>false){
 const target=createDestructible(mesh,dead,{dynamic:true,padding:.015,blast:.02,scorePerInstance:tier.reward/100,explosionsEnabled:false});
 return {mesh,query(from,to,now){
  if(event.phase!=="flight"||event.tier.id!==tier.id||universeEnding())return null;
  const hit=target.query(from,to,now);if(!hit)return null;const serial=event.serial;
  return {...hit,destroy(power=0,onDamage){
   if(event.phase!=="flight"||event.serial!==serial||event.tier.id!==tier.id||universeEnding())return 0;
   const count=hit.destroy(power,onDamage);if(count>0)onDestroyed(tier);return count;
  }};
 }};
}

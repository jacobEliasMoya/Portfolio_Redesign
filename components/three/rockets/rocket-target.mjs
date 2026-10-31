import {createDestructible} from "../ufo/projectile-collision.mjs";
/** Same swept bolt/ray pipeline as aircraft; generation guards prevent stale hits rewarding a later launch. */
export function createRocketTarget(mesh,tier,event,dead,onDestroyed,universeEnding=()=>false){
 let geometry=mesh.geometry;
 const makeTarget=()=>createDestructible(mesh,dead,{dynamic:true,padding:.015,blast:.02,scorePerInstance:tier.reward/100,explosionsEnabled:false});
 let target=makeTarget();
 return {mesh,query(from,to,now){
  if(event.phase!=="flight"||event.tier.id!==tier.id||universeEnding())return null;
  if(geometry!==mesh.geometry){geometry=mesh.geometry;target=makeTarget();}
  const hit=target.query(from,to,now);if(!hit)return null;const serial=event.serial,hitGeometry=mesh.geometry;
  return {...hit,destroy(power=0,onDamage){
   if(event.phase!=="flight"||event.serial!==serial||mesh.geometry!==hitGeometry||event.tier.id!==tier.id||universeEnding())return 0;
   const count=hit.destroy(power,onDamage);if(count>0)onDestroyed(tier);return count;
  }};
 }};
}

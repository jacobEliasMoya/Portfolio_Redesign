import {Vector3} from "three";
import {getProjectileTarget} from "./projectile-collision.mjs";
/** Resolve a hull/surface contact using incoming normal speed, not glancing speed. */
export function resolveSaucerContact(state,point,normal,hullRadius,surfaceVelocity=new Vector3()){
 const penetration=hullRadius-state.position.clone().sub(point).dot(normal);
 if(penetration<=0)return null;
 state.position.addScaledVector(normal,penetration+.01);
 const incoming=Math.max(0,-state.velocity.clone().sub(surfaceVelocity).dot(normal));
 if(incoming>0)state.velocity.addScaledVector(normal,incoming*1.45);
 return {kind:incoming>=3?"crash":"bounce",speed:incoming};
}
export function sampleEarthContact(scene,position,center,earthRadius){
 const normal=position.clone().sub(center).normalize();if(normal.lengthSq()===0)normal.set(0,1,0);
 const from=center.clone().addScaledVector(normal,earthRadius*1.4+1),to=center.clone().addScaledVector(normal,earthRadius*.85);
 let hit=null,destroyed=false;
 scene.traverse(object=>{const target=getProjectileTarget(object);if(target?.foundation>2){if(target.planetPhase()!=="intact"){destroyed=true;return;}const candidate=target.query(from,to,0);if(candidate&&(!hit||candidate.t<hit.t))hit=candidate;}});
 return {exists:!destroyed,normal,point:hit?hit.point:center.clone().addScaledVector(normal,earthRadius*.98)};
}

const bodyMotion=new WeakMap();
/** Sample current transformed terrain for both planets, including a released/tumbling Moon. */
export function samplePlanetContacts(scene,position,hullRadius,now){
 const contacts=[];
 scene.traverse(object=>{
  const target=getProjectileTarget(object);if(!target?.foundation||target.planetPhase()!=="intact")return;
  for(let node=object;node;node=node.parent)if(!node.visible)return;
  object.updateWorldMatrix(true,false);const scale=object.matrixWorld.getMaxScaleOnAxis();if(scale<.001)return;
  const center=object.getWorldPosition(new Vector3()),last=bodyMotion.get(object),velocity=new Vector3();
  if(last&&now>last.time&&now-last.time<.2)velocity.copy(center).sub(last.position).divideScalar(now-last.time);
  bodyMotion.set(object,{position:center.clone(),time:now});
  const radius=(target.foundation>2?3:.82)*scale;if(position.distanceTo(center)>radius*1.4+hullRadius)return;
  const normal=position.clone().sub(center).normalize();if(normal.lengthSq()===0)normal.set(0,1,0);
  const from=center.clone().addScaledVector(normal,radius*1.4+hullRadius),to=center.clone().addScaledVector(normal,radius*(target.craterMode?.45:.8));
  const hit=target.query(from,to,now);
  contacts.push({point:hit?hit.point:center.clone().addScaledVector(normal,target.foundation*scale),normal:hit?.normal??normal,velocity});
 });return contacts;
}

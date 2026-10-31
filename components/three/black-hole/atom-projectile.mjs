import {Quaternion,Vector3} from "three";
import {UFO_WEAPON_MUZZLE} from "../ufo/alien-cannon.mjs";
import {firstProjectileHit} from "../ufo/projectile-collision.mjs";
export const ATOM_SPEED=14,ATOM_LIFETIME=6;
/** Snapshot the same world-space cannon bore used by bolts and the death ray. */
export function createAtomLaunch(ship,velocity,scale){
 if(!ship)return null;
 ship.updateWorldMatrix(true,false);
 const origin=new Vector3(...UFO_WEAPON_MUZZLE).multiplyScalar(scale);ship.localToWorld(origin);
 const heading=new Vector3(0,0,1).applyQuaternion(ship.getWorldQuaternion(new Quaternion()));
 return {origin,heading,velocity:velocity.clone()};
}
export function createAtomProjectile(){return {phase:"idle",position:new Vector3(),previous:new Vector3(),velocity:new Vector3(),age:0,impact:null};}
export function launchAtom(projectile,shot){
 if(projectile.phase!=="idle"||!shot||![shot.origin,shot.heading,shot.velocity].every(v=>v&&[v.x,v.y,v.z].every(Number.isFinite))||shot.heading.lengthSq()<1e-12)return false;
 projectile.position.copy(shot.origin);projectile.previous.copy(shot.origin);
 projectile.velocity.copy(shot.heading).normalize().multiplyScalar(ATOM_SPEED).add(shot.velocity);
 projectile.age=0;projectile.phase="flight";return true;
}
/** Sweep the complete step so even fast shots cannot jump through Earth or the Moon. */
export function stepAtom(projectile,delta,targets,now){
 if(projectile.phase!=="flight")return projectile.phase;
 const dt=Math.max(0,Math.min(delta,.1,ATOM_LIFETIME-projectile.age));
 projectile.previous.copy(projectile.position);projectile.position.addScaledVector(projectile.velocity,dt);projectile.age+=dt;
 const hit=firstProjectileHit(targets,projectile.previous,projectile.position,now);
 if(hit){projectile.position.copy(hit.point);projectile.impact=hit;projectile.phase="impact";}
 else if(projectile.age>=ATOM_LIFETIME){projectile.phase="armed";projectile.velocity.set(0,0,0);}
 return projectile.phase;
}

/** A manual trigger is distinct from collision: no fabricated hit or ordinary damage. */
export function detonateAtom(projectile){if(!["flight","armed"].includes(projectile.phase))return false;projectile.phase="detonated";projectile.velocity.set(0,0,0);return true;}

import {Vector3} from "three";
import {getProjectileTarget} from "./projectile-collision.mjs";
const fieldsByObject=new WeakMap(),SURFACE_PULL=Object.freeze({earth:6,moon:3,blackHole:24});
export const MAX_PROJECTILE_ACCELERATION=80;
/** Gravity metadata lives on the model; the active scene owns the short-lived source list. */
export function collectProjectileGravity(scene,out=[]){
 out.length=0;
 scene.traverse(object=>{
  const settings=object.userData.projectileGravity;
  if(!settings||!settings.enabled||!Number.isFinite(settings.power)||settings.power<=0)return;
  for(let ancestor=object;ancestor;ancestor=ancestor.parent)if(!ancestor.visible)return;
  const phase=getProjectileTarget(object)?.planetPhase();if(phase==="exploding"||phase==="gone")return;
  object.updateWorldMatrix(true,false);const radius=settings.radius*object.matrixWorld.getMaxScaleOnAxis();if(!Number.isFinite(radius)||radius<.001)return;
  let field=fieldsByObject.get(object);if(!field){field={position:new Vector3(),mu:0,softening:0};fieldsByObject.set(object,field);}
  object.getWorldPosition(field.position);field.mu=(SURFACE_PULL[settings.kind]??6)*radius*radius*settings.power;field.softening=radius*.6;out.push(field);
 });
 return out;
}
/** Softened inverse-square pull, with a bounded total acceleration near model centers. */
export function projectileAcceleration(position,sources,out){
 out.set(0,0,0);
 for(const source of sources){
  const x=source.position.x-position.x,y=source.position.y-position.y,z=source.position.z-position.z,r2=x*x+y*y+z*z;
  if(r2<1e-12||!Number.isFinite(source.mu)||source.mu<=0)continue;
  const factor=source.mu/((r2+source.softening*source.softening)*Math.sqrt(r2));
  out.x+=x*factor;out.y+=y*factor;out.z+=z*factor;
 }
 return out.clampLength(0,MAX_PROJECTILE_ACCELERATION);
}

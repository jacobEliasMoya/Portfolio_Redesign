import {chargedDamage} from "./weapon-charge.mjs";
import {impactPalette} from "../planet/impact-material.mjs";
import {createPlanetExplosion} from "../planet/planet-explosion.mjs";
import {Color,Matrix4,Object3D,Sphere,Vector3} from "three";
const registry=new WeakMap();
export function registerProjectileTarget(mesh,target){registry.set(mesh,target);return ()=>{registry.delete(mesh);};}
export function getProjectileTarget(mesh){return registry.get(mesh);}
/** Earliest swept point/sphere contact, including starts inside and zero-length steps. */
export function segmentSphereTime(a,b,center,radius){
 const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,ox=a.x-center.x,oy=a.y-center.y,oz=a.z-center.z;
 const c=ox*ox+oy*oy+oz*oz-radius*radius;if(c<=0)return 0;
 const length=dx*dx+dy*dy+dz*dz;if(length<1e-16)return null;
 const dot=ox*dx+oy*dy+oz*dz,disc=dot*dot-length*c;if(disc<0)return null;
 const t=(-dot-Math.sqrt(disc))/length;return t>=0&&t<=1?t:null;
}
/** Spatially indexed instance bounds; exact mesh triangles are intentionally avoided. */
export function createDestructible(mesh,dead,{blast=.22,padding=.04,dynamic=false,foundation=0,mode="destroy",threshold=0}={}){
 const planet=createPlanetExplosion(mesh,threshold,{excluded:mode==="explode"?dead:null,neutralBurst:mode==="explode"&&foundation>0&&foundation<2});
 const impactMarks=[],scars=new Map(),debris=new Map(),debrisTransform=new Object3D(),debrisColor=new Color();
 const cells=new Map(),points=[],cell=.4,inverse=new Matrix4(),a=new Vector3(),b=new Vector3(),p=new Vector3();
 let updated=-Infinity,maxRadius=0,allExploded=false,indexCursor=0,indexReady=false,indexOuterRadius=0;
 const byIndex=[];
 mesh.geometry.computeBoundingBox();const dimensions=mesh.geometry.boundingBox.getSize(new Vector3());
 const key=(x,y,z)=>`${x},${y},${z}`;
 function beginIndex(){cells.clear();points.length=0;byIndex.length=0;maxRadius=0;indexCursor=0;indexOuterRadius=0;indexReady=false;}
 function appendIndex(limit){
  const m=mesh.instanceMatrix.array,end=Math.min(mesh.count,indexCursor+limit);
  for(;indexCursor<end;indexCursor++){
   const i=indexCursor;if(dead.has(i)&&mode!=="dent")continue;const n=i*16;
   const sx=Math.hypot(m[n],m[n+1],m[n+2]),sy=Math.hypot(m[n+4],m[n+5],m[n+6]),sz=Math.hypot(m[n+8],m[n+9],m[n+10]);
   if(sx+sy+sz<1e-9)continue;
   const radius=Math.hypot(sx*dimensions.x,sy*dimensions.y,sz*dimensions.z)*.5+padding;
   const entry={i,x:m[n+12],y:m[n+13],z:m[n+14],radius};points.push(entry);byIndex[i]=entry;maxRadius=Math.max(maxRadius,radius);
   indexOuterRadius=Math.max(indexOuterRadius,Math.hypot(entry.x,entry.y,entry.z)+radius);
   const id=key(Math.floor(entry.x/cell),Math.floor(entry.y/cell),Math.floor(entry.z/cell));
   if(!cells.has(id))cells.set(id,[]);cells.get(id).push(entry);
  }
  indexReady=indexCursor===mesh.count;
  if(indexReady&&!dynamic){mesh.boundingSphere=new Sphere(new Vector3(),indexOuterRadius);updated=0;}
  return indexReady;
 }
 function rebuild(now){
  if(indexReady&&(!dynamic||now-updated<.08))return;
  if(dynamic){beginIndex();updated=now;}
  appendIndex(mesh.count);
 }
 function relocate(item,x,y,z){
  const oldKey=key(Math.floor(item.x/cell),Math.floor(item.y/cell),Math.floor(item.z/cell)),newKey=key(Math.floor(x/cell),Math.floor(y/cell),Math.floor(z/cell));
  if(oldKey!==newKey){const old=cells.get(oldKey);if(old){const i=old.indexOf(item);if(i>=0)old.splice(i,1);if(!old.length)cells.delete(oldKey);}if(!cells.has(newKey))cells.set(newKey,[]);cells.get(newKey).push(item);}
  item.x=x;item.y=y;item.z=z;
 }
 function nearby(from,to,radius){
  const out=new Set(),steps=Math.max(1,Math.ceil(from.distanceTo(to)/(cell*.5))),reach=Math.ceil(radius/cell)+1;
  for(let step=0;step<=steps;step++){
   const t=step/steps,x=Math.floor((from.x+(to.x-from.x)*t)/cell),y=Math.floor((from.y+(to.y-from.y)*t)/cell),z=Math.floor((from.z+(to.z-from.z)*t)/cell);
   for(let dx=-reach;dx<=reach;dx++)for(let dy=-reach;dy<=reach;dy++)for(let dz=-reach;dz<=reach;dz++)for(const item of cells.get(key(x+dx,y+dy,z+dz))??[])out.add(item);
  }return out;
 }
 return {mesh,foundation,impactMarks,prepareIndex(limit=512){if(dynamic)return true;return indexReady||appendIndex(limit);},explodeAll(center=new Vector3(0,.35,-9)){
  if(allExploded)return 0;allExploded=true;let count=0;
  for(let i=0;i<mesh.count;i++){
   if(dead.has(i))continue;
   const transform=new Object3D(),matrix=new Matrix4().fromArray(mesh.instanceMatrix.array,i*16);matrix.decompose(transform.position,transform.quaternion,transform.scale);
   if(transform.scale.lengthSq()<1e-10){dead.add(i);continue;}
   const radial=transform.position.clone().sub(center).normalize();if(radial.lengthSq()===0)radial.set(0,1,0);
   const jitter=new Vector3(Math.sin(i*17.3),Math.cos(i*23.7),Math.sin(i*41.1));
   const color=new Color();mesh.getColorAt(i,color);
   debris.set(i,{position:transform.position.clone(),scale:transform.scale.clone(),velocity:radial.multiplyScalar(7+Math.abs(Math.sin(i*13.1))*3).addScaledVector(jitter,1.5),spin:jitter.clone().multiplyScalar(4),color,age:0,life:2+Math.abs(Math.sin(i*7.3))*.6});
   dead.add(i);count++;
  }
  mesh.instanceMatrix.needsUpdate=true;return count;
 },planetPhase:planet.phase,planetGlow:planet.glow,planetHits:planet.hits,stepPlanetExplosion:planet.step,stepDebris(delta,reducedMotion=false){
  if(!debris.size)return 0;
  const dt=Math.min(.1,Math.max(0,delta));
  for(const [id,fragment] of debris){
   fragment.age+=dt;const t=Math.min(1,fragment.age/fragment.life);
   if(reducedMotion||t===1){const n=id*16;for(let k=0;k<12;k++)mesh.instanceMatrix.array[n+k]=0;debris.delete(id);continue;}
   fragment.position.addScaledVector(fragment.velocity,dt);fragment.velocity.multiplyScalar(Math.exp(-1.2*dt));fragment.velocity.y-=.25*dt;
   debrisTransform.position.copy(fragment.position);debrisTransform.rotation.set(fragment.spin.x*fragment.age,fragment.spin.y*fragment.age,fragment.spin.z*fragment.age);
   debrisTransform.scale.copy(fragment.scale).multiplyScalar(1-t*t);debrisTransform.updateMatrix();mesh.setMatrixAt(id,debrisTransform.matrix);
   debrisColor.copy(fragment.color).multiplyScalar(1-t);mesh.setColorAt(id,debrisColor);
  }
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  return debris.size;
 },query(from,to,now){
  if(allExploded||planet.phase()!=="intact")return null;
  mesh.updateWorldMatrix(true,false);
  // Parent visibility and reveal scale matter even though these meshes bypass frustum culling.
  for(let node=mesh;node;node=node.parent)if(!node.visible)return null;
  if(Math.abs(mesh.matrixWorld.determinant())<1e-10)return null;
  inverse.copy(mesh.matrixWorld).invert();a.copy(from).applyMatrix4(inverse);b.copy(to).applyMatrix4(inverse);
  // A local bounding sphere rejects distant shots before building/querying the grid.
  if(!dynamic&&!mesh.boundingSphere)mesh.computeBoundingSphere();
  if(!dynamic&&mesh.boundingSphere&&segmentSphereTime(a,b,mesh.boundingSphere.center,mesh.boundingSphere.radius+padding)===null)return null;
  if(dynamic&&segmentSphereTime(a,b,p.set(0,0,0),32)===null)return null;
  rebuild(now);let best=null,index=null;
  for(const item of nearby(a,b,maxRadius)){
   if(dead.has(item.i)&&mode!=="dent")continue;p.set(item.x,item.y,item.z);
   const t=segmentSphereTime(a,b,p,item.radius);
   if(t!==null&&(best===null||t<best)){best=t;index=item.i;}
  }
  if(foundation){const t=segmentSphereTime(a,b,p.set(0,0,0),foundation);if(t!==null&&(best===null||t<best)){best=t;index=null;}}
  if(best===null)return null;
  const local=a.clone().lerp(b,best);
  return {t:best,point:from.clone().lerp(to,best),destroy(power=0){
   const charge=Math.max(0,Math.min(1,Number.isFinite(power)?power:0));
   const impactRadius=blast*(1+3*charge*charge),damage=chargedDamage(charge);
   const recordDamage=()=>{for(let i=0;i<damage;i++)planet.recordHit();};
   if(index===null){recordDamage();return 0;}
   const hit=byIndex[index];if(!hit)return 0;
   const hx=hit.x,hy=hit.y,hz=hit.z;
   if(foundation>0)impactMarks.push({x:hx,y:hy,z:hz,radius:impactRadius,power:charge});
   p.set(hx,hy,hz);let count=0;
   for(const item of nearby(p,p,impactRadius))if((mode==="dent"||!dead.has(item.i))&&Math.hypot(item.x-hx,item.y-hy,item.z-hz)<=impactRadius+item.radius*.3){
    const wasHit=dead.has(item.i);dead.add(item.i);const n=item.i*16;
    if(mode==="dent"){
     const distance=Math.hypot(item.x-hx,item.y-hy,item.z-hz),heat=.55+.45*Math.max(0,1-distance/Math.max(impactRadius,.001));
     const radius=Math.hypot(item.x,item.y,item.z),dented=Math.max(foundation+.005,radius-(.035+.025*heat));
     if(!wasHit&&radius>0){mesh.instanceMatrix.array[n+12]=item.x/radius*dented;mesh.instanceMatrix.array[n+13]=item.y/radius*dented;mesh.instanceMatrix.array[n+14]=item.z/radius*dented;relocate(item,mesh.instanceMatrix.array[n+12],mesh.instanceMatrix.array[n+13],mesh.instanceMatrix.array[n+14]);}
     const scar=scars.get(item.i)??{count:0};scar.count=Math.min(8,scar.count+1);scars.set(item.i,scar);
     const palette=impactPalette(distance,impactRadius,scar.count);
     mesh.setColorAt(item.i,new Color().setRGB(palette.r,palette.g,palette.b));
     const attribute=mesh.geometry.getAttribute("impactHeat");if(attribute){attribute.setX(item.i,palette.heat);attribute.needsUpdate=true;}
    }else if(mode==="explode"){
     const matrix=new Matrix4().fromArray(mesh.instanceMatrix.array,n),transform=new Object3D();matrix.decompose(transform.position,transform.quaternion,transform.scale);
     const velocity=new Vector3(item.x-hx,item.y-hy,item.z-hz);
     const noise=(seed)=>Math.sin((item.i+seed)*127.1);
     velocity.add(new Vector3(noise(1),noise(2),noise(3)).multiplyScalar(.2)).normalize().multiplyScalar(2.5+Math.abs(noise(4))*2);
     velocity.add((foundation>0?new Vector3(item.x,item.y,item.z):new Vector3(item.x,item.y-.35,item.z+9)).normalize().multiplyScalar(1.2));
     if(foundation>0)velocity.multiplyScalar(.35);
     // Lunar ejecta keep the surveyed rock colors; Earth owns the fiery impact palette.
     const color=new Color();mesh.getColorAt(item.i,color);
     debris.set(item.i,{position:transform.position.clone(),scale:transform.scale.clone(),velocity,spin:new Vector3(noise(5)*5,noise(6)*5,noise(7)*5),color,age:0,life:1.1+Math.abs(noise(8))*.4});
    }else for(let k=0;k<12;k++)mesh.instanceMatrix.array[n+k]=0;
    count++;
   }
   mesh.instanceMatrix.needsUpdate=true;
   if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
   recordDamage();return count;
  },local};
 }};
}
export function firstProjectileHit(targets,from,to,now){let best=null;for(const target of targets){const hit=target.query(from,to,now);if(hit&&(!best||hit.t<best.t))best=hit;}return best;}

import {Matrix4,Object3D,Quaternion,Vector3} from "three";

/** Persistent local-space bowls. Original buffers are captured lazily after model setup. */
export function createImpactCraters(mesh,{foundation,surfaces}){
 let base=null,baseCorners=null;const marks=[],surfaceBases=new WeakMap();
 const matrix=new Matrix4(),transform=new Object3D(),original=new Object3D(),point=new Vector3(),center=new Vector3(),normal=new Vector3(),radial=new Vector3(),up=new Vector3(0,1,0),inverseRotation=new Quaternion();
 function offset(direction){let sum=0;
  for(const mark of marks){
   const dot=Math.max(-1,Math.min(1,direction.dot(mark.direction))),distance=mark.bodyRadius*Math.sqrt(2*(1-dot)),q=distance/mark.radius;
   if(q>1.4)continue;
   if(q<1)sum-=mark.depth*Math.pow(1-q*q,2);
   if(q>.8){const t=(q-.8)/.6,ridge=Math.sin(Math.PI*t);sum+=mark.depth*.22*ridge*ridge*(.88+.12*Math.sin(direction.x*41+direction.y*29+direction.z*17));}
  }return sum;
 }
 function deform(input,out){const radius=input.length();if(radius<1e-9)return out.copy(input);radial.copy(input).divideScalar(radius);return out.copy(radial).multiplyScalar(Math.max(foundation*.72,radius+offset(radial)));}
 function slope(input,baseNormal,out){
  const n=input.clone().normalize(),t=new Vector3().crossVectors(n,Math.abs(n.y)<.9?up:new Vector3(1,0,0)).normalize(),b=new Vector3().crossVectors(n,t),eps=.004,r=input.length();
  const derivative=axis=>(offset(n.clone().addScaledVector(axis,eps).normalize())-offset(n.clone().addScaledVector(axis,-eps).normalize()))/(2*eps*r);
  return out.copy(baseNormal).addScaledVector(t,-derivative(t)).addScaledVector(b,-derivative(b)).normalize();
 }
 function stamp(hit,radius,power,relocate){
  if(!base){base=mesh.instanceMatrix.array.slice();if(mesh.geometry.getAttribute("lunarPoint0"))baseCorners=Array.from({length:6},(_,i)=>mesh.geometry.getAttribute(`lunarPoint${i}`).array.slice());}
  const mark={direction:hit.clone().normalize(),bodyRadius:hit.length(),radius,depth:radius*(.20+.08*power)};marks.push(mark);
  let changed=0,outer=0;
  for(let i=0;i<mesh.count;i++){
   matrix.fromArray(base,i*16).decompose(original.position,original.quaternion,original.scale);
   deform(original.position,center);
   const moved=center.distanceToSquared(original.position)>1e-12;
   if(!moved&&!baseCorners){outer=Math.max(outer,original.position.length()+original.scale.length());continue;}
   transform.position.copy(center);transform.scale.copy(original.scale);
   if(moved){normal.copy(up).applyQuaternion(original.quaternion);slope(original.position,normal,normal);transform.quaternion.setFromUnitVectors(up,normal);}else transform.quaternion.copy(original.quaternion);transform.updateMatrix();
   mesh.setMatrixAt(i,transform.matrix);relocate(i,center,moved);if(moved)changed++;
   outer=Math.max(outer,center.length()+original.scale.length());
   if(baseCorners){
    inverseRotation.copy(transform.quaternion).invert();
    for(let corner=0;corner<6;corner++){
     point.fromArray(baseCorners[corner],i*3).multiply(original.scale).applyQuaternion(original.quaternion).add(original.position);
     deform(point,point).sub(center).applyQuaternion(inverseRotation).divide(original.scale);
     mesh.geometry.getAttribute(`lunarPoint${corner}`).setXYZ(i,point.x,point.y,point.z);
    }
   }
  }
  if(baseCorners)for(let c=0;c<6;c++)mesh.geometry.getAttribute(`lunarPoint${c}`).needsUpdate=true;
  for(const geometry of surfaces?.current??[]){
   if(!geometry)continue;const positions=geometry.getAttribute("position");
   let source=surfaceBases.get(geometry);if(!source){source=positions.array.slice();surfaceBases.set(geometry,source);}
   for(let i=0;i<positions.count;i++){point.fromArray(source,i*3);deform(point,point);positions.setXYZ(i,point.x,point.y,point.z);}
   positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
  }
  mesh.instanceMatrix.needsUpdate=true;if(mesh.boundingSphere)mesh.boundingSphere.radius=outer;
  return changed;
 }
 return {stamp,normalAt(point){return slope(point,point.clone().normalize(),new Vector3());},marks};
}

import {Matrix4,Object3D,Quaternion,Vector3} from "three";

/** Persistent local-space bowls. Original buffers are captured lazily after model setup. */
export function createImpactCraters(mesh,{foundation,surfaces}){
 let base=null,baseCorners=null,directions=null,extents=null,prepared=0;const marks=[],surfaceBases=new WeakMap();
 const matrix=new Matrix4(),transform=new Object3D(),original=new Object3D(),point=new Vector3(),center=new Vector3(),normal=new Vector3(),radial=new Vector3(),up=new Vector3(0,1,0),inverseRotation=new Quaternion();
 const slopeN=new Vector3(),slopeT=new Vector3(),slopeB=new Vector3(),slopePlus=new Vector3(),slopeMinus=new Vector3(),axisX=new Vector3(1,0,0);
 function offset(direction){let sum=0;
  for(const mark of marks){
   const dot=Math.max(-1,Math.min(1,direction.dot(mark.direction))),chordSq=2*(1-dot);
   if(chordSq>mark.limitSq)continue;
   const distance=mark.bodyRadius*Math.sqrt(chordSq),q=distance/mark.radius;
   if(q<1)sum-=mark.depth*Math.pow(1-q*q,2);
   if(q>.8){const t=(q-.8)/.6,ridge=Math.sin(Math.PI*t);sum+=mark.depth*.22*ridge*ridge*(.88+.12*Math.sin(direction.x*41+direction.y*29+direction.z*17));}
  }return sum;
 }
 function deform(input,out){const radius=input.length();if(radius<1e-9)return out.copy(input);radial.copy(input).divideScalar(radius);return out.copy(radial).multiplyScalar(Math.max(foundation*.72,radius+offset(radial)));}
 function slope(input,baseNormal,out){
  const n=slopeN.copy(input).normalize(),t=slopeT.crossVectors(n,Math.abs(n.y)<.9?up:axisX).normalize(),b=slopeB.crossVectors(n,t),eps=.004,r=input.length();
  const derivative=axis=>(offset(slopePlus.copy(n).addScaledVector(axis,eps).normalize())-offset(slopeMinus.copy(n).addScaledVector(axis,-eps).normalize()))/(2*eps*r);
  return out.copy(baseNormal).addScaledVector(t,-derivative(t)).addScaledVector(b,-derivative(b)).normalize();
 }
 function prepare(limit=512){
  if(!base){base=mesh.instanceMatrix.array.slice();if(mesh.geometry.getAttribute("lunarPoint0"))baseCorners=Array.from({length:6},(_,i)=>mesh.geometry.getAttribute(`lunarPoint${i}`).array.slice());
   directions=new Float64Array(mesh.count*3);extents=new Float64Array(mesh.count);
  }
  const end=Math.min(mesh.count,prepared+limit);
  for(;prepared<end;prepared++){const i=prepared;matrix.fromArray(base,i*16).decompose(original.position,original.quaternion,original.scale);const r=original.position.length();radial.copy(original.position).divideScalar(r||1).toArray(directions,i*3);extents[i]=original.scale.length()*3;}
  return prepared===mesh.count;
 }
 function stamp(hit,radius,power,relocate){
  prepare(Infinity);
  const bodyRadius=hit.length(),mark={direction:hit.clone().normalize(),bodyRadius,radius,depth:radius*(.20+.08*power),limitSq:(radius*1.4/bodyRadius)**2};marks.push(mark);
  let changed=0,outer=mesh.boundingSphere?.radius??0;
  for(let i=0;i<mesh.count;i++){
   const n=i*3,dot=directions[n]*mark.direction.x+directions[n+1]*mark.direction.y+directions[n+2]*mark.direction.z;
   // Include fitted corner reach and slope samples, not just the tile's center.
   const reach=radius*1.4+(baseCorners?extents[i]:0)+bodyRadius*.008;
   if(2*(1-Math.min(1,dot))>(reach/bodyRadius)**2)continue;
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
   for(let i=0;i<positions.count;i++){point.fromArray(source,i*3);radial.copy(point).normalize();if(2*(1-Math.min(1,radial.dot(mark.direction)))>mark.limitSq)continue;deform(point,point);positions.setXYZ(i,point.x,point.y,point.z);}
   positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
  }
  mesh.instanceMatrix.needsUpdate=true;if(mesh.boundingSphere)mesh.boundingSphere.radius=outer;
  return changed;
 }
 return {prepare,stamp,normalAt(point){return slope(point,point.clone().normalize(),new Vector3());},marks};
}

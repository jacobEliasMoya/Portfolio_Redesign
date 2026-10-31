import {Vector3} from "three";
/** Cache the settled disc envelope once; never scan its thousands of tiles per frame. */
export function discEnvelope(model){
 let radius=0;
 model.getObjectByName("tilted-accretion-disc").traverse(mesh=>{
  if(!mesh.isInstancedMesh)return;
  mesh.geometry.computeBoundingSphere();
  const a=mesh.instanceMatrix.array,r=mesh.geometry.boundingSphere.radius;
  for(let i=0;i<mesh.count;i++){
   const o=i*16,s=Math.max(Math.hypot(a[o],a[o+1],a[o+2]),Math.hypot(a[o+4],a[o+5],a[o+6]),Math.hypot(a[o+8],a[o+9],a[o+10]));
   radius=Math.max(radius,Math.hypot(a[o+12],a[o+13],a[o+14])+r*s);
  }
 });
 return radius;
}
export function createShipTides(){return {center:{value:new Vector3()},axis:{value:new Vector3(0,0,1)},stretch:{value:1}};}
export function stepShipTides(tides,ship,center,discRadius,coreRadius,reducedMotion=false){
 tides.center.value.copy(ship);
 const distance=ship.distanceTo(center);
 if(distance>1e-8)tides.axis.value.copy(center).sub(ship).multiplyScalar(1/distance);
 const t=Math.max(0,Math.min(1,(discRadius-distance)/Math.max(1e-8,discRadius-coreRadius)));
 tides.stretch.value=1+(reducedMotion?1.5:6)*t*t*(3-2*t);
}
export const tidalPosition=/* glsl */`
 vec3 tidalOffset=collapsePosition.xyz-uShipCenter;
 vec3 tidalAlong=uTidalAxis*dot(tidalOffset,uTidalAxis);
 collapsePosition.xyz=uShipCenter+tidalAlong*uTidalStretch+(tidalOffset-tidalAlong)*inversesqrt(uTidalStretch);
`;
export const tidalNormal=/* glsl */`
 vec3 tidalViewAxis=normalize(mat3(viewMatrix)*uTidalAxis);
 vec3 tidalNormalAlong=tidalViewAxis*dot(transformedNormal,tidalViewAxis);
 transformedNormal=tidalNormalAlong/uTidalStretch+(transformedNormal-tidalNormalAlong)*sqrt(uTidalStretch);
`;

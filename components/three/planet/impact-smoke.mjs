import {Vector3} from "three";
export const SMOKE_RING_SLOTS=8,SMOKE_PUFFS=40;
export function createSmokeRing(mark,surfaceRadius=3){
 const normal=new Vector3(mark.x,mark.y,mark.z).normalize();
 const tangent=new Vector3().crossVectors(normal,Math.abs(normal.y)<.9?new Vector3(0,1,0):new Vector3(1,0,0)).normalize();
 return {normal,tangent,bitangent:new Vector3().crossVectors(normal,tangent).normalize(),radius:Math.max(surfaceRadius+.04,Math.hypot(mark.x,mark.y,mark.z)+.04),blast:mark.radius,power:mark.power??0,age:0,life:1.6+(mark.power??0)*.5};
}
/** Geodesic ring: distance increases along the sphere, not a flat disc through it. */
export function smokePuff(ring,index,out){
 const t=Math.min(1,ring.age/ring.life),angle=index/SMOKE_PUFFS*Math.PI*2;
 const irregular=Math.sin(index*17.3)*.045;
 const spread=(.05+ring.blast*.18)+(ring.blast*.8+.30)*Math.pow(t,.75);
 const theta=spread/ring.radius;
 const lift=.045+Math.sin(Math.PI*t)*(.14+ring.power*.14)+t*.14+irregular*t;
 out.copy(ring.normal).multiplyScalar(Math.cos(theta));
 out.addScaledVector(ring.tangent,Math.cos(angle)*Math.sin(theta));out.addScaledVector(ring.bitangent,Math.sin(angle)*Math.sin(theta));out.multiplyScalar(ring.radius+lift);
 const scale=(.035+ring.power*.022+t*.085)*(1+.22*Math.sin(index*13.7+t*3));
 const alpha=Math.min(1,t/.12)*Math.pow(1-t,1.7)*(.55+ring.power*.15);
 return {scale,alpha};
}

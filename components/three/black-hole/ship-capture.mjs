import {Vector3} from "three";
import {segmentSphereTime} from "../ufo/projectile-collision.mjs";
// Outer matte panels extend slightly beyond the nominal two-unit core.
export const SINGULARITY_CORE_RADIUS=2.04;
export function createShipCapture(){return {captured:false,previous:new Vector3(),initialized:false};}
/** Latch at the visible event horizon, including a fast crossing between frames. */
export function updateShipCapture(state,position,center,radius,age){
 if(!state.initialized){state.previous.copy(position);state.initialized=true;}
 if(!state.captured&&age>=4&&segmentSphereTime(state.previous,position,center,radius)!==null)state.captured=true;
 state.previous.copy(position);return state.captured;
}
/** No steering, thrust, brakes or reset input participates after capture. */
export function driftCapturedShip(flight,center,delta){const dt=Math.max(0,Math.min(.1,delta));flight.velocity.subVectors(center,flight.position).multiplyScalar(2.2);flight.position.lerp(center,1-Math.exp(-2.2*dt));}
export function createSingularityCamera(){return {locked:false,direction:new Vector3(),position:new Vector3(),target:new Vector3(),up:new Vector3(0,1,0)};}
/** Retain the approach side, then watch the hole from outside its complete disc. */
export function singularityCameraPose(cameraPosition,center,radius,out,aspect=1){
 if(!out.locked){out.direction.copy(cameraPosition).sub(center);if(out.direction.lengthSq()<1e-10)out.direction.set(0,.25,1);out.direction.normalize();out.locked=true;}
 out.target.copy(center);out.position.copy(center).addScaledVector(out.direction,Math.max(18,radius*10/Math.min(1,Math.max(.25,aspect))));return out;
}

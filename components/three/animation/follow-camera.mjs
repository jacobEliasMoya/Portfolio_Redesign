import {Matrix4,Quaternion,Vector3} from "three";
import {segmentSphereTime} from "../ufo/projectile-collision.mjs";
const EARTH_CENTER=new Vector3(0,.35,-9),DEFAULT_HEADING=new Vector3(0,0,-1),WORLD_UP=new Vector3(0,1,0),safetyScratch=new WeakMap();
function scratchFor(position){let scratch=safetyScratch.get(position);if(!scratch){scratch={offset:new Vector3(),radial:new Vector3()};safetyScratch.set(position,scratch);}return scratch;}
export function createFollowCameraScratch(){return {position:new Vector3(),target:new Vector3(),up:new Vector3(),forward:new Vector3(),boom:new Vector3(),orientation:new Matrix4(),rotation:new Quaternion()};}
/** Quaternion interpolation also handles an upside-down exit without a zero up vector. */
export function orientFollowCamera(camera,aim,up,amount,scratch){
 scratch.orientation.lookAt(camera.position,aim,up);scratch.rotation.setFromRotationMatrix(scratch.orientation);
 camera.quaternion.slerp(scratch.rotation,Math.max(0,Math.min(1,amount))).normalize();
 camera.up.set(0,1,0).applyQuaternion(camera.quaternion);
}
/** Third-person boom follows both heading and craft up, including complete manual rolls. */
export function followCameraPose(position,zoom=0,earthRadius=0,heading=DEFAULT_HEADING,up=WORLD_UP,out=createFollowCameraScratch()){
 const forward=out.forward.copy(heading).normalize(),distance=10*Math.exp(zoom),center=EARTH_CENTER;
 out.up.copy(up).normalize();
 out.target.copy(position).addScaledVector(forward,2.5);
 const camera=out.position.copy(position).addScaledVector(forward,-distance).addScaledVector(out.up,distance*.3);
 const safe=earthRadius*1.15;
 const contact=safe?segmentSphereTime(position,camera,center,safe):null;
 if(contact!==null){
  const boom=out.boom.copy(camera).sub(position),length=boom.length();
  camera.copy(position).addScaledVector(boom,Math.max(0,contact-.35/Math.max(length,.001)));
  keepCameraOutsideEarth(camera,earthRadius);
 }
 return out;
}
export function keepCameraOutsideEarth(position,earthRadius){
 const center=EARTH_CENTER,radial=scratchFor(position).radial.copy(position).sub(center),minimum=earthRadius*1.15;
 if(minimum&&radial.length()<minimum){if(radial.lengthSq()<1e-10)radial.set(0,0,1);position.copy(center).addScaledVector(radial.normalize(),minimum);}
 return position;
}

/** Hull radius at scene scale .38 plus clearance for the camera near plane. */
export function keepCameraOutsideShip(camera,ship,heading,earthRadius=0){
 const minimum=1.35,offset=scratchFor(camera).offset.copy(camera).sub(ship);
 if(offset.lengthSq()>=minimum*minimum)return camera;
 if(offset.lengthSq()<1e-10)offset.copy(heading).negate();
 if(offset.lengthSq()<1e-10)offset.set(0,0,1);
 camera.copy(ship).addScaledVector(offset.normalize(),minimum);
 const center=EARTH_CENTER,safe=earthRadius*1.15;
 if(safe&&camera.distanceToSquared(center)<safe*safe){
  offset.copy(ship).sub(center);if(offset.lengthSq()<1e-10)offset.set(0,1,0);
  camera.copy(ship).addScaledVector(offset.normalize(),Math.max(minimum,safe-ship.distanceTo(center)+.01));
 }
 return camera;
}

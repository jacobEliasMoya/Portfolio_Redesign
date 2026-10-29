import {Vector3} from "three";
import {segmentSphereTime} from "../ufo/projectile-collision.mjs";
/** Third-person boom follows flight heading while keeping a level horizon. */
export function followCameraPose(position,zoom=0,earthRadius=0,heading=new Vector3(0,0,-1)){
 const forward=heading.clone().normalize(),distance=10*Math.exp(zoom),center=new Vector3(0,.35,-9);
 const target=position.clone().addScaledVector(forward,2.5);
 const camera=position.clone().addScaledVector(forward,-distance).add(new Vector3(0,distance*.3,0));
 const safe=earthRadius*1.15;
 const contact=safe?segmentSphereTime(position,camera,center,safe):null;
 if(contact!==null){
  const boom=camera.clone().sub(position),length=boom.length();
  camera.copy(position).addScaledVector(boom,Math.max(0,contact-.35/Math.max(length,.001)));
  keepCameraOutsideEarth(camera,earthRadius);
 }
 return {position:camera,target};
}
export function keepCameraOutsideEarth(position,earthRadius){
 const center=new Vector3(0,.35,-9),radial=position.clone().sub(center),minimum=earthRadius*1.15;
 if(minimum&&radial.length()<minimum){if(radial.lengthSq()<1e-10)radial.set(0,0,1);position.copy(center).addScaledVector(radial.normalize(),minimum);}
 return position;
}

/** Hull radius at scene scale .38 plus clearance for the camera near plane. */
export function keepCameraOutsideShip(camera,ship,heading,earthRadius=0){
 const minimum=1.35,offset=camera.clone().sub(ship);
 if(offset.lengthSq()>=minimum*minimum)return camera;
 if(offset.lengthSq()<1e-10)offset.copy(heading).negate();
 if(offset.lengthSq()<1e-10)offset.set(0,0,1);
 camera.copy(ship).addScaledVector(offset.normalize(),minimum);
 const center=new Vector3(0,.35,-9),safe=earthRadius*1.15;
 if(safe&&camera.distanceToSquared(center)<safe*safe){
  offset.copy(ship).sub(center);if(offset.lengthSq()<1e-10)offset.set(0,1,0);
  camera.copy(ship).addScaledVector(offset.normalize(),Math.max(minimum,safe-ship.distanceTo(center)+.01));
 }
 return camera;
}

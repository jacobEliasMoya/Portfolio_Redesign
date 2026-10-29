import test from "node:test";
import assert from "node:assert/strict";
import {Vector3} from "three";
import {followCameraPose,keepCameraOutsideEarth,keepCameraOutsideShip} from "../components/three/animation/follow-camera.mjs";
import {segmentSphereTime} from "../components/three/ufo/projectile-collision.mjs";
test("follow camera translates with the ship without time-based bounce",()=>{
 const a=followCameraPose(new Vector3(1,2,3)),b=followCameraPose(new Vector3(6,2,3));
 assert.equal(b.position.x-a.position.x,5);assert.equal(b.target.x-a.target.x,5);assert.equal(a.position.z-a.target.z,12.5);
 assert.ok(followCameraPose(new Vector3(),.5).position.length()>followCameraPose(new Vector3()).position.length());
});
test("follow offset avoids looking through Earth and actual camera stays outside",()=>{
 const center=new Vector3(0,.35,-9),ship=new Vector3(0,.35,-18),pose=followCameraPose(ship,0,6.5);
 assert.equal(segmentSphereTime(pose.target,pose.position,center,6.5*1.15),null);
 const camera=keepCameraOutsideEarth(center.clone(),6.5);assert.ok(camera.distanceTo(center)>=6.5*1.15-1e-8);
});

test("third-person camera stays behind each heading and aims ahead",()=>{
 const ship=new Vector3(2,4,8);
 for(const heading of [new Vector3(0,0,1),new Vector3(-1,0,0),new Vector3(1,.4,1).normalize()]){
  const pose=followCameraPose(ship,0,0,heading);
  const horizontalHeading=new Vector3(heading.x,0,heading.z),offset=pose.position.clone().sub(ship);
  assert.ok(offset.dot(horizontalHeading)<0);assert.ok(pose.target.clone().sub(ship).dot(heading)>0);
 }
 const a=followCameraPose(ship,0,0,new Vector3(0,0,1)),b=followCameraPose(ship,0,0,new Vector3(-1,0,0));assert.ok(b.position.x>a.position.x);
});

test("camera clearance handles overlap, close zoom and conflicting Earth boundary",()=>{
 const ship=new Vector3(0,.35,-16.5),heading=new Vector3(0,0,1);
 for(const camera of [ship.clone(),ship.clone().add(new Vector3(0,0,.1)),ship.clone().add(new Vector3(.1,0,0))]){
  keepCameraOutsideShip(camera,ship,heading,6.5);
  assert.ok(camera.distanceTo(ship)>=1.35-1e-8);
  assert.ok(camera.distanceTo(new Vector3(0,.35,-9))>=6.5*1.15-1e-8);
 }
 const far=new Vector3(20,20,20),original=far.clone();keepCameraOutsideShip(far,ship,heading);assert.ok(far.equals(original));
});

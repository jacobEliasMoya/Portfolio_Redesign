import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
import {createShipCapture,updateShipCapture,driftCapturedShip,createSingularityCamera,singularityCameraPose,SINGULARITY_CORE_RADIUS} from '../components/three/black-hole/ship-capture.mjs';
import {createFlight} from '../components/three/ufo/saucer-flight.mjs';
import {OFFLINE_RIM_DRIVE,shouldUpdateRimPlasma} from '../components/three/ufo/rim-plasma.mjs';
test('capture uses the actual growing core, respects grace and latches through a swept crossing',()=>{
 const capture=createShipCapture(),center=new Vector3(4,2,-8),radius=SINGULARITY_CORE_RADIUS*1.22;
 assert.equal(updateShipCapture(capture,center,center,radius,3.9),false);
 assert.equal(updateShipCapture(capture,center.clone().add(new Vector3(0,0,radius+5)),center,radius,3.99),false);
 assert.equal(updateShipCapture(capture,center.clone().add(new Vector3(0,0,radius+4)),center,radius,4),false,'outer gravitational influence is not the core');
 assert.equal(updateShipCapture(capture,center.clone().add(new Vector3(0,0,-radius-4)),center,radius,4.1),true);
 assert.equal(updateShipCapture(capture,new Vector3(100,100,100),center,radius,6),true,'capture is irreversible');
});
test('captured drift is inward, frame-rate independent, and leaves no propulsion burst',()=>{
 const run=dt=>{const flight=createFlight([0,0,2]);flight.velocity.set(0,0,100);for(let i=0;i<Math.round(1/dt);i++)driftCapturedShip(flight,new Vector3(),dt);return flight;};
 const a=run(1/30),b=run(1/120);assert.ok(a.position.length()<.25);assert.ok(a.velocity.z<0);assert.ok(a.position.distanceTo(b.position)<1e-9);
 assert.equal(shouldUpdateRimPlasma(OFFLINE_RIM_DRIVE,new Float32Array(6).fill(1)),false);
});
test('capture camera focuses the hole, retains a fixed observation side and frames the wide disc',()=>{
 const center=new Vector3(12,-4,-8),out=createSingularityCamera(),pose=singularityCameraPose(center.clone().add(new Vector3(2,3,8)),center,2.5,out),direction=out.direction.clone();
 assert.equal(pose,out);assert.ok(pose.target.equals(center));assert.ok(pose.position.distanceTo(center)>=25);
 singularityCameraPose(new Vector3(-200,-200,-200),center,2.5,out);assert.ok(out.direction.equals(direction));
 const wideDistance=out.position.distanceTo(center);singularityCameraPose(new Vector3(),center,2.5,out,.5);assert.ok(out.position.distanceTo(center)>=wideDistance*2-1e-9);
 const fallback=singularityCameraPose(center,center,2.5,createSingularityCamera());assert.ok(fallback.position.toArray().every(Number.isFinite));assert.ok(fallback.position.distanceTo(center)>2.5);
});

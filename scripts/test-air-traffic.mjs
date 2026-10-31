import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Object3D,Vector3} from "three";
import {AIRPORTS,FLIGHT_ROUTES,airportDirection,createFlightRoute,createRouteScratch,sampleFlightRoute} from "../components/three/air-traffic/flight-routes.mjs";
import {createAirplaneModel} from "../components/three/air-traffic/airplane-model.mjs";
test("airport mapping matches Earth's longitude convention, hemispheres and real endpoints",()=>{
 assert.ok(airportDirection({lat:0,lon:0}).distanceTo(new Vector3(0,0,1))<1e-9);
 assert.ok(airportDirection({lat:90,lon:0}).distanceTo(new Vector3(0,1,0))<1e-9);
 assert.ok(airportDirection(AIRPORTS.SFO).x<0);assert.ok(airportDirection(AIRPORTS.HND).x>0);
 for(const definition of FLIGHT_ROUTES){
  const route=createFlightRoute({...definition,offset:0}),pose=new Object3D(),scratch=createRouteScratch();
  sampleFlightRoute(route,0,pose,scratch);assert.ok(pose.position.clone().normalize().distanceTo(route.start)<1e-9);assert.equal(pose.scale.x,0);
  sampleFlightRoute(route,route.duration,pose,scratch);assert.ok(pose.position.clone().normalize().distanceTo(route.end)<1e-9);assert.equal(pose.scale.x,0);
  sampleFlightRoute(route,2*route.duration+3,pose,scratch);assert.ok(pose.position.clone().normalize().distanceTo(route.start)<1e-9);
 }
 assert.ok(createFlightRoute(FLIGHT_ROUTES[2]).angle<2,"Pacific flight follows the short arc across the date line");
 assert.equal(new Set(FLIGHT_ROUTES.map(route=>route.color)).size,3);
 assert.equal(new Set(FLIGHT_ROUTES.map(route=>route.size)).size,3);
});
test("all three flights stay upright, travel smoothly, and clear the actual terrain envelope",()=>{
 const data=JSON.parse(readFileSync(new URL("../public/models/earth/block-earth.json",import.meta.url))),model=createAirplaneModel();let envelope=0;
 for(let i=0;i<data.sizes.length;i++)envelope=Math.max(envelope,Math.hypot(...data.positions.slice(i*3,i*3+3))+data.sizes[i]*1.5);
 try {
  for(const definition of FLIGHT_ROUTES){const route=createFlightRoute(definition),pose=new Object3D(),scratch=createRouteScratch();let previous=null;
   for(let i=0;i<=2000;i++){
    sampleFlightRoute(route,i*.1,pose,scratch);assert.ok(pose.position.length()-model.geometry.boundingSphere.radius*pose.scale.x>envelope);
    assert.ok(new Vector3(0,1,0).applyQuaternion(pose.quaternion).dot(pose.position.clone().normalize())>.98);
    assert.ok(Math.abs(pose.quaternion.length()-1)<1e-9);assert.ok(pose.matrix.elements.every(Number.isFinite));
    if(previous)assert.ok(pose.position.distanceTo(previous)<.04);previous=pose.position.clone();
   }
  }
  assert.ok(model.geometry.attributes.position.count<4000);assert.ok(model.material.vertexColors);assert.ok(model.material.depthTest&&model.material.depthWrite);
 }finally {model.dispose();}
});

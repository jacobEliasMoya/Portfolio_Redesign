import {Quaternion,Vector3} from "three";
import {airportDirection} from "../air-traffic/flight-routes.mjs";
import {ROCKET_FLIGHT_SECONDS} from "./rocket-event.mjs";
// NASA Apollo by the Numbers, LC-39A geodetic coordinates. See README for source.
export const CAPE_CANAVERAL=Object.freeze({lat:28.608422,lon:-80.604133});
// Conservative local tile/wave envelope near LC-39A = 3.2775, checked against the bundled terrain.
export const LAUNCH_GROUND_RADIUS=3.28,ROCKET_SCALE=.25;
const launch=airportDirection(CAPE_CANAVERAL),east=new Vector3(Math.cos(CAPE_CANAVERAL.lon*Math.PI/180),0,-Math.sin(CAPE_CANAVERAL.lon*Math.PI/180)),up=new Vector3(0,1,0);
export function createRocketPathScratch(){return {radial:new Vector3(),tangent:new Vector3(),velocity:new Vector3(),orientation:new Quaternion()};}
/** +Y is the rocket's nose. A slow radial lift blends into an eastward orbital turn. */
export function sampleRocketPath(seconds,object,s){
 const p=Math.max(0,Math.min(1,seconds/ROCKET_FLIGHT_SECONDS)),angle=.78*p*p*p,radius=LAUNCH_GROUND_RADIUS+.26+.08*p+5.6*p*p;
 s.radial.copy(launch).multiplyScalar(Math.cos(angle)).addScaledVector(east,Math.sin(angle));
 s.tangent.copy(east).multiplyScalar(Math.cos(angle)).addScaledVector(launch,-Math.sin(angle));
 s.velocity.copy(s.radial).multiplyScalar(.08+11.2*p).addScaledVector(s.tangent,radius*2.34*p*p).normalize();
 object.position.copy(s.radial).multiplyScalar(radius);object.quaternion.setFromUnitVectors(up,s.velocity);
 const fade=Math.min(1,Math.max(0,(1-p)/.06));object.scale.setScalar(ROCKET_SCALE*fade);object.updateMatrix();return object;
}

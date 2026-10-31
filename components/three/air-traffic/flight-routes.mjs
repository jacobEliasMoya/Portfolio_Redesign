import {Matrix4,Vector3} from "three";
// OurAirports facility coordinates, checked 2026-10-31. Public-domain data; see README.
export const AIRPORTS=Object.freeze({
 SFO:Object.freeze({lat:37.619806,lon:-122.374821}),
 JFK:Object.freeze({lat:40.639447,lon:-73.779317}),
 LHR:Object.freeze({lat:51.470748,lon:-.459909}),
 HND:Object.freeze({lat:35.549678,lon:139.786958}),
});
export const FLIGHT_ROUTES=Object.freeze([
 {from:"SFO",to:"JFK",duration:48,offset:9,color:"#f6ab97",size:.82},
 {from:"JFK",to:"LHR",duration:54,offset:27,color:"#98cdee",size:1},
 {from:"HND",to:"SFO",duration:64,offset:43,color:"#f5e3a8",size:1.12},
].map(Object.freeze));
/** Match generate-earth.py exactly: +Y north, +Z zero longitude, +X east. */
export function airportDirection({lat,lon},out=new Vector3()){
 const latitude=lat*Math.PI/180,longitude=lon*Math.PI/180;
 return out.set(Math.cos(latitude)*Math.sin(longitude),Math.sin(latitude),Math.cos(latitude)*Math.cos(longitude));
}
export function createFlightRoute(route){
 const start=airportDirection(AIRPORTS[route.from]),end=airportDirection(AIRPORTS[route.to]),axis=new Vector3().crossVectors(start,end).normalize();
 return {...route,start,end,axis,angle:Math.acos(Math.max(-1,Math.min(1,start.dot(end))))};
}
export function createRouteScratch(){return {radial:new Vector3(),forward:new Vector3(),right:new Vector3(),up:new Vector3(),basis:new Matrix4()};}
const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
/** Shortest spherical arc, outward-up attitude, alternating legs with a hidden airport pause. */
export function sampleFlightRoute(route,seconds,object,scratch){
 const time=Math.max(0,seconds+route.offset),period=route.duration+3,leg=Math.floor(time/period),phase=time%period;
 const progress=Math.min(1,phase/route.duration),reverse=leg%2===1,t=reverse?1-progress:progress;
 const radius=3.76+.14*Math.sin(Math.PI*t),s=scratch;
 s.radial.copy(route.start).applyAxisAngle(route.axis,route.angle*t);
 object.position.copy(s.radial).multiplyScalar(radius);
 s.forward.crossVectors(route.axis,s.radial).multiplyScalar(route.angle*radius).addScaledVector(s.radial,.14*Math.PI*Math.cos(Math.PI*t));
 if(reverse)s.forward.negate();s.forward.normalize();
 s.right.crossVectors(s.radial,s.forward).normalize();s.up.crossVectors(s.forward,s.right).normalize();
 s.basis.makeBasis(s.right,s.up,s.forward);object.quaternion.setFromRotationMatrix(s.basis);
 object.scale.setScalar(.22*(route.size??1)*smooth(progress/.04)*smooth((1-progress)/.04));object.updateMatrix();
 return object;
}

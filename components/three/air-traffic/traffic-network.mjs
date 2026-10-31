import {ROUTE_CLEARANCES} from "./route-clearances.mjs";
import {Vector3} from "three";
import {airportDirection,createRouteScratch,FLIGHT_ROUTES} from "./flight-routes.mjs";
export const FLEET_SIZE=12,GROUND_PAUSE=1.8,TRAIL_PUFFS=8,TRAIL_STEP=.16;
export const PLANE_STYLES=FLIGHT_ROUTES.map(({color,size})=>({color,size}));
const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
const gcd=(a,b)=>{while(b){const next=a%b;a=b;b=next;}return a;};
export function createTrafficNetwork(data){
 const airports=Object.fromEntries(data.airports.map((airport,index)=>[index,airport])),count=data.airports.length;
 // Skip across the geographic ordering to avoid tiny neighboring-airport hops.
 // A coprime stride still visits every airport once in a single connected itinerary.
 let stride=Math.max(1,Math.floor(count*.381966));while(gcd(stride,count)!==1)stride++;
 const routes=data.airports.map((_,i)=>{
  const from=i*stride%count,to=(i+1)*stride%count;
  const base={start:airportDirection(data.airports[from]),end:airportDirection(data.airports[to]),axis:new Vector3(),angle:0};
  base.axis.crossVectors(base.start,base.end).normalize();base.angle=Math.acos(Math.max(-1,Math.min(1,base.start.dot(base.end))));
  if(base.axis.lengthSq()<1e-12)base.axis.crossVectors(base.start,new Vector3(0,1,0)).normalize();
  return {...base,from,to,clearance:ROUTE_CLEARANCES[`${from}:${to}`]??3.76,duration:10+base.angle*3};
 });
 const starts=[];let total=0;for(const route of routes){starts.push(total);total+=GROUND_PAUSE+route.duration;}
 return {airports,routes,starts,total};
}
export function createTrafficScratch(){return {...createRouteScratch(),phase:{index:0,progress:0,flying:false,altitude:0}};}
/** Restore the original gentle, terrain-clearing spherical flight arc. */
export function routeRadius(route,t){return (route.clearance??3.76)+.035*Math.min(1,route.angle/.5)*Math.sin(Math.PI*t);}
function poseOnLeg(route,t,object,s){
 const radius=routeRadius(route,t),slope=.035*Math.min(1,route.angle/.5)*Math.PI*Math.cos(Math.PI*t);
 s.radial.copy(route.start).applyAxisAngle(route.axis,route.angle*t);object.position.copy(s.radial).multiplyScalar(radius);
 s.forward.crossVectors(route.axis,s.radial).multiplyScalar(Math.max(route.angle,.000001)*radius).addScaledVector(s.radial,slope).normalize();
 s.right.crossVectors(s.radial,s.forward).normalize();s.up.crossVectors(s.forward,s.right).normalize();s.basis.makeBasis(s.right,s.up,s.forward);object.quaternion.setFromRotationMatrix(s.basis);
}
/** Continuous visible travel; airport heading changes happen only while faded out. */
export function sampleNetworkFlight(network,seconds,object,s,size=1){
 const time=((seconds%network.total)+network.total)%network.total;
 let low=0,high=network.starts.length-1;
 while(low<high){const mid=Math.ceil((low+high)/2);if(network.starts[mid]<=time)low=mid;else high=mid-1;}
 const index=low,route=network.routes[index],phase=time-network.starts[index],progress=Math.min(1,phase/route.duration);
 poseOnLeg(route,progress,object,s);
 object.scale.setScalar(.13*size*smooth(progress/.04)*smooth((1-progress)/.04));object.updateMatrix();
 s.phase.index=index;s.phase.progress=progress;s.phase.flying=phase<route.duration;s.phase.altitude=routeRadius(route,progress)-3;
 return s.phase;
}

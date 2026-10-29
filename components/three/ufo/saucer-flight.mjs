import { Vector3 } from "three";
export function createFlight(position=[0,0,0]) { return { position:new Vector3(...position), velocity:new Vector3(), yaw:0, pitch:0, bank:0, lean:0 }; }
/** +Z is the cockpit's forward axis; pitch is positive nose-up. */
export function stepFlight(state,input,delta,{center=[0,0,0],inner=0,outer=18}={}) {
 const dt=Math.min(Math.max(delta,0),.05), response=1-Math.exp(-7*dt);
 state.yaw-=input.turn*1.25*dt;
 state.pitch=Math.max(-.85,Math.min(.85,state.pitch+input.pitch*.9*dt));
 const forward=new Vector3(Math.sin(state.yaw)*Math.cos(state.pitch),Math.sin(state.pitch),Math.cos(state.yaw)*Math.cos(state.pitch));
 const right=new Vector3(-Math.cos(state.yaw),0,Math.sin(state.yaw));
 state.velocity.addScaledVector(forward,input.thrust*9*dt).addScaledVector(right,input.strafe*4*dt);
 state.velocity.y+=input.lift*4*dt;
 state.velocity.multiplyScalar(Math.exp(-(input.brake?7:1.15)*dt));
 state.velocity.clampLength(0,8);
 state.position.addScaledVector(state.velocity,dt);
 const radial=state.position.clone().sub(new Vector3(...center)),distance=radial.length();
 if(distance<inner || distance>outer){
  radial.normalize(); if(!distance)radial.set(0,0,1);
  state.position.set(...center).addScaledVector(radial,distance<inner?inner:outer);
  const speed=state.velocity.dot(radial);
  if((distance<inner&&speed<0)||(distance>outer&&speed>0))state.velocity.addScaledVector(radial,-speed);
 }
 // Cosmetic attitude follows local movement; flight pitch remains the chosen heading.
 const lateral=state.velocity.dot(right)/5, longitudinal=state.velocity.dot(forward)/8;
 const targetBank=Math.max(-.4,Math.min(.4,input.turn*.2+input.strafe*.18+lateral*.16));
 const targetLean=Math.max(-.2,Math.min(.2,input.thrust*.10+longitudinal*.12));
 state.bank+=(targetBank-state.bank)*response;
 state.lean+=(targetLean-state.lean)*response;
 return state;
}

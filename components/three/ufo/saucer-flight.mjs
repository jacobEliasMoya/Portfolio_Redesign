import { Euler,Quaternion,Vector3 } from "three";
const scratchByFlight=new WeakMap();
function scratchForFlight(state){let scratch=scratchByFlight.get(state);if(!scratch){scratch={forward:new Vector3(),right:new Vector3(),up:new Vector3(),radial:new Vector3(),delta:new Quaternion(),angles:new Euler()};scratchByFlight.set(state,scratch);}return scratch;}
function syncAngles(state,angles){angles.setFromQuaternion(state.orientation,"YXZ");state.yaw=angles.y;state.pitch=-angles.x;state.roll=angles.z;}
export function createFlight(position=[0,0,0]) { return { position:new Vector3(...position), velocity:new Vector3(),orientation:new Quaternion(),attitudeReady:false,yaw:0, pitch:0, bank:0, lean:0,roll:0,rollSpeed:0 }; }
export function setFlightAttitude(state,orientation){state.orientation.copy(orientation).normalize();state.attitudeReady=true;state.rollSpeed=0;syncAngles(state,scratchForFlight(state).angles);}
/** +Z is the cockpit's forward axis; pitch is positive nose-up. */
export function stepFlight(state,input,delta,{center=[0,0,0],inner=0,outer=18}={}) {
 const dt=Math.min(Math.max(delta,0),.05), response=1-Math.exp(-7*dt);
 const {forward,right,up,radial,delta:rotation,angles}=scratchForFlight(state);
 if(!state.attitudeReady){state.orientation.setFromEuler(angles.set(-state.pitch,state.yaw,state.roll,"YXZ"));state.attitudeReady=true;}
 state.rollSpeed=(state.rollSpeed??0)+((input.roll??0)*1.8-(state.rollSpeed??0))*response;
 // Post-multiplication applies yaw/pitch/roll around the current ship's local axes.
 rotation.setFromEuler(angles.set(-input.pitch*.9*dt,-input.turn*1.25*dt,state.rollSpeed*dt,"YXZ"));
 state.orientation.multiply(rotation).normalize();syncAngles(state,angles);
 forward.set(0,0,1).applyQuaternion(state.orientation);
 right.set(-1,0,0).applyQuaternion(state.orientation);
 up.set(0,1,0).applyQuaternion(state.orientation);
 state.velocity.addScaledVector(forward,input.thrust*9*dt).addScaledVector(right,input.strafe*4*dt);
 state.velocity.addScaledVector(up,input.lift*4*dt);
 state.velocity.multiplyScalar(Math.exp(-(input.brake?7:1.15)*dt));
 state.velocity.clampLength(0,8);
 state.position.addScaledVector(state.velocity,dt);
 radial.copy(state.position);radial.x-=center[0];radial.y-=center[1];radial.z-=center[2];const distance=radial.length();
 if(distance<inner || distance>outer){
  radial.normalize(); if(!distance)radial.set(0,0,1);
  state.position.set(...center).addScaledVector(radial,distance<inner?inner:outer);
  const speed=state.velocity.dot(radial);
  if((distance<inner&&speed<0)||(distance>outer&&speed>0))state.velocity.addScaledVector(radial,-speed);
 }
 // Cosmetic banking/lean never changes the authoritative flight orientation.
 const lateral=state.velocity.dot(right)/5, longitudinal=state.velocity.dot(forward)/8;
 const targetBank=Math.max(-.4,Math.min(.4,input.turn*.2+input.strafe*.18+lateral*.16));
 const targetLean=Math.max(-.2,Math.min(.2,input.thrust*.10+longitudinal*.12));
 state.bank+=(targetBank-state.bank)*response;
 state.lean+=(targetLean-state.lean)*response;
 return state;
}

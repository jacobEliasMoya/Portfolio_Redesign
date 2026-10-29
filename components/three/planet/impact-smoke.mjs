import {Vector3} from "three";
export const SMOKE_RING_SLOTS=8,SMOKE_PUFFS=40;
const seed=(n)=>{const value=Math.sin(n*127.1+311.7)*43758.5453;return value-Math.floor(value);};
export function createSmokeRing(mark,surfaceRadius=3,kind="earth"){
 const normal=new Vector3(mark.x,mark.y,mark.z).normalize();
 const tangent=new Vector3().crossVectors(normal,Math.abs(normal.y)<.9?new Vector3(0,1,0):new Vector3(1,0,0)).normalize();
 const power=Math.max(0,Math.min(1,mark.power??0)),moon=kind==="moon";
 const life=moon?.85+power*.3:1.6+power*.5;
 const impactSeed=mark.x*13.7+mark.y*29.3+mark.z*43.1;
 const particles=Array.from({length:SMOKE_PUFFS},(_,i)=>{
  const n=impactSeed+i*7.31;
  return {angle:i*2.399963+seed(n)*.7,speed:.65+seed(n+1)*.7,size:.75+seed(n+2)*.5,
   delay:seed(n+3)*(.06+power*.18),duration:.72+seed(n+4)*.28,column:!moon&&i>=26};
 });
 return {normal,tangent,bitangent:new Vector3().crossVectors(normal,tangent).normalize(),radius:Math.max(surfaceRadius+.04,Math.hypot(mark.x,mark.y,mark.z)+.04),blast:mark.radius,power,kind,particles,age:0,life};
}
/** Surface-hugging dust and rising billows on Earth; short ballistic dust arcs on Moon. */
export function smokePuff(ring,index,out,sample={scale:0,alpha:0}){
 const particle=ring.particles[index],moon=ring.kind==="moon";
 const age=ring.age-particle.delay,duration=(ring.life-particle.delay)*particle.duration;
 const t=Math.max(0,Math.min(1,age/duration));
 const travel=1-Math.pow(1-t,moon?2.4:1.6);
 let spread,lift;
 if(particle.column){
  spread=(.012+ring.blast*.12*travel)*particle.speed;
  lift=.04+(.30+ring.power*.30)*t+Math.sin(Math.PI*t)*.10*particle.speed;
 }else{
  spread=(.035+ring.blast*.12)+(ring.blast*(moon?1.4:1)+.22)*travel*particle.speed;
  lift=.025+Math.sin(Math.PI*t)*(moon?.10+ring.power*.10:.09+ring.power*.11)*particle.speed;
  if(!moon)lift+=t*.10;
 }
 const theta=spread/ring.radius;
 out.copy(ring.normal).multiplyScalar(Math.cos(theta));
 out.addScaledVector(ring.tangent,Math.cos(particle.angle)*Math.sin(theta));
 out.addScaledVector(ring.bitangent,Math.sin(particle.angle)*Math.sin(theta));
 out.multiplyScalar(ring.radius+lift);
 const size=moon?.018+ring.power*.013+t*.025:.032+ring.power*.025+t*(particle.column?.12:.085);
 sample.scale=age<=0||t>=1?0:size*particle.size;
 sample.alpha=age<=0?0:Math.min(1,t/(moon?.055:.10))*Math.pow(1-t,moon?2.2:1.35)*(moon?.65:.58+ring.power*.18);
 return sample;
}

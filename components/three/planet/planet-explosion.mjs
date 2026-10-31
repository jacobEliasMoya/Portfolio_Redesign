import {Quaternion,Vector3} from "three";
export const PLANET_EXPLOSION_TIMING=Object.freeze({charge:1.2,burst:2.5});
export const PLANET_HITS=Object.freeze({earth:60,moon:12});
/** Smooth two-beat red glow, with a rising envelope and no hard on/off flashes. */
export function planetChargeGlow(seconds){
 const t=Math.max(0,Math.min(PLANET_EXPLOSION_TIMING.charge,seconds));
 return t/PLANET_EXPLOSION_TIMING.charge*(.7+.3*Math.cos(2*Math.PI*t/.6));
}
/** Reuse the planet's original instance buffer for one bounded outward burst. */
export function createPlanetExplosion(mesh,threshold=0,{seed=Math.floor(Math.random()*4294967296),excluded=null,neutralBurst=false,enabled=true}={}){
 let hits=0,phase="intact",age=0,rest=null,colors=null,velocities=null,spins=null,delays=null;
 const quaternion=new Quaternion(),axis=new Vector3();
 let randomState=seed>>>0;
 const random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};
 const chargeTime=PLANET_EXPLOSION_TIMING.charge,total=chargeTime+PLANET_EXPLOSION_TIMING.burst;
 return {setEnabled(value){enabled=!!value;},phase:()=>phase,glow:()=>phase==="charging"?planetChargeGlow(age):0,hits:()=>hits,recordHit(){
  if(!enabled||!threshold||phase!=="intact")return;
  hits++;if(hits<threshold)return;
  phase="charging";age=0;rest=mesh.instanceMatrix.array.slice();colors=mesh.instanceColor?.array.slice()??null;
  velocities=new Float32Array(mesh.count*3);spins=new Float32Array(mesh.count*4);delays=new Float32Array(mesh.count);
  let radius=0;for(let i=0;i<mesh.count;i++)radius=Math.max(radius,Math.hypot(rest[i*16+12],rest[i*16+13],rest[i*16+14]));
  // Several off-center pockets break up the expanding-shell silhouette.
  const pockets=Array.from({length:5},()=>[(random()-.5)*radius*.85,(random()-.5)*radius*.85,(random()-.5)*radius*.85]);
  for(let i=0;i<mesh.count;i++){
   const n=i*16,k=i*3,s=i*4,x=rest[n+12],y=rest[n+13],z=rest[n+14],r=Math.hypot(x,y,z)||1;
   const pocket=pockets[Math.floor(random()*pockets.length)],speed=.9+Math.pow(random(),.65)*5.8;
   let vx=(x-pocket[0])/r+(random()-.5)*1.8,vy=(y-pocket[1])/r+(random()-.5)*1.8,vz=(z-pocket[2])/r+(random()-.5)*1.8;
   const radial=(vx*x+vy*y+vz*z)/r;
   if(radial<.55){const push=.55-radial;vx+=x/r*push;vy+=y/r*push;vz+=z/r*push;}
   const length=Math.hypot(vx,vy,vz)||1;
   velocities[k]=vx/length*speed;velocities[k+1]=vy/length*speed;velocities[k+2]=vz/length*speed;
   axis.set(random()-.5,random()-.5,random()-.5).normalize();spins[s]=axis.x;spins[s+1]=axis.y;spins[s+2]=axis.z;spins[s+3]=(1.2+random()*4.8)*(random()<.5?-1:1);
   delays[i]=random()*.24;
  }
 },step(delta,reducedMotion=false){
  if(phase==="intact"||phase==="gone")return phase;
  age+=Math.max(0,Math.min(delta,.1));
  if(reducedMotion||age>=total){phase="gone";mesh.visible=false;rest=null;colors=null;velocities=null;spins=null;delays=null;return phase;}
  phase=age<chargeTime?"charging":"exploding";
  const burst=Math.max(0,age-chargeTime);
  const matrices=mesh.instanceMatrix.array,heat=mesh.geometry.getAttribute("impactHeat");
  for(let i=0;i<mesh.count;i++){
   const n=i*16,k=i*3,s=i*4;
   // Local impact debris owns these tiles; never restore them from the planet snapshot.
   if(excluded?.has(i)){for(let j=0;j<12;j++)matrices[n+j]=0;continue;}
   const fragmentTime=Math.max(0,burst-delays[i]),life=PLANET_EXPLOSION_TIMING.burst-delays[i];
   const fade=Math.max(0,1-fragmentTime/life),size=1-Math.pow(1-fade,2);
   const travel=fragmentTime*(1.4-.18*fragmentTime)*(1-Math.exp(-fragmentTime*12));
   const pressure=phase==="charging"?age/chargeTime:1;
   for(let j=0;j<12;j++)matrices[n+j]=rest[n+j]*size*((j<4||j>=8)?1-.42*pressure:1);
   if(fragmentTime>0){
    axis.set(spins[s],spins[s+1],spins[s+2]);quaternion.setFromAxisAngle(axis,spins[s+3]*fragmentTime*(1-Math.exp(-fragmentTime*8)));
    for(let column=0;column<3;column++){
     const offset=n+column*4;axis.set(matrices[offset],matrices[offset+1],matrices[offset+2]).applyQuaternion(quaternion);
     matrices[offset]=axis.x;matrices[offset+1]=axis.y;matrices[offset+2]=axis.z;
    }
   }
   const swell=1+.06*pressure;
   matrices[n+12]=rest[n+12]*swell+velocities[k]*travel;matrices[n+13]=rest[n+13]*swell+velocities[k+1]*travel;matrices[n+14]=rest[n+14]*swell+velocities[k+2]*travel;
   if(colors&&mesh.instanceColor){const color=mesh.instanceColor.array,charge=phase==="charging"?age/chargeTime*.18:neutralBurst?0:fade*.25;color[k]=(colors[k]*(1-charge)+charge)*fade;color[k+1]=(colors[k+1]*(1-charge)+charge*.035)*fade;color[k+2]=colors[k+2]*(1-charge)*fade;}
   if(heat)heat.setX(i,phase==="charging"?-planetChargeGlow(age)*.75:neutralBurst?0:fade*.3);
  }
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;if(heat)heat.needsUpdate=true;
  return phase;
 }};
}

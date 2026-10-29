import {AdditiveBlending,DynamicDrawUsage,InstancedBufferAttribute,LatheGeometry,ShaderMaterial,Vector2} from "three";
export const RIM_PORT_COUNT=6,RIM_BURST_LAYERS=3;
export const IDLE_RIM_DRIVE=Object.freeze({thrust:0,strafe:0,roll:0,lift:0,turn:0,pitch:0,brake:false});
export function shouldUpdateRimPlasma(input,levels){
 return !!(input.thrust||input.strafe||input.roll||input.lift||input.turn||input.pitch||input.brake)||levels.some(level=>level>.008);
}
/** Shortest-arc, frame-rate-independent easing when another control changes jet direction. */
export function easeRimDirection(current,target,delta,reducedMotion=false){
 if(reducedMotion)return current.copy(target);
 return current.slerp(target,1-Math.exp(-7*Math.max(0,Math.min(.1,delta)))).normalize();
}
/** Exact angular-hull lamp centers/normals; +Z is forward, +strafe accelerates toward -X. */
export function sampleRimDrive(index,input,velocity,out={}){
 const angle=Math.PI/6+index*Math.PI/3,nx=Math.cos(angle),nz=Math.sin(angle);
 let ex=input.strafe,ez=-input.thrust,ey=0;
 if(input.brake){const speed=Math.hypot(velocity.x,velocity.y,velocity.z),gain=Math.min(1,speed/5);if(speed>.01){ex+=velocity.x/speed*gain;ey=velocity.y/speed*gain;ez+=velocity.z/speed*gain;}}
 const drive=Math.max(0,nx*ex+nz*ez),turn=Math.abs(input.turn)*Math.abs(nx)*.65;
 const pitch=Math.abs(input.pitch)*Math.abs(nz)*.45,lift=(Math.abs(input.lift)+Math.abs(ey))*.55,roll=(input.roll??0);
 out.strength=Math.min(1,drive+turn+pitch+lift+Math.abs(roll*nx)*.65);
 // Tangential cant gives opposing-side jets the correct turning torque.
 let x=nx+input.turn*nz*.75,z=nz-input.turn*nx*.75,y=ey-input.lift*.75-input.pitch*nz*.65-roll*nx*.85;
 const length=Math.hypot(x,y,z);x/=length;y/=length;z/=length;
 out.x=nx*(2.235*Math.sqrt(3)/2+.045);out.y=-.006;out.z=nz*(2.235*Math.sqrt(3)/2+.045);
 out.dx=x;out.dy=y;out.dz=z;
 return out;
}
/** A broad expanding plasma lobe, not a line or ribbon. +Z exhaust axis. */
export function createRimBurstGeometry(){
 const geometry=new LatheGeometry([[0,0],[.12,.02],[.22,.25],[.34,.65],[.29,1.1],[.13,1.7],[0,2.2]].map(p=>new Vector2(...p)),12);
 geometry.rotateX(Math.PI/2);return geometry;
}
export function createRimBurstMaterial(core=false){return new ShaderMaterial({
 transparent:true,depthTest:true,depthWrite:false,blending:AdditiveBlending,toneMapped:false,
 uniforms:{uTime:{value:0},uCore:{value:core?1:0}},
 vertexShader:`attribute float burstAlpha;uniform float uTime;varying vec3 vLocal;varying float vAlpha;
 void main(){vLocal=position;vAlpha=burstAlpha;vec3 p=position;
 p.xy*=1.+.055*sin(p.z*11.-uTime*13.)*smoothstep(0.,.25,p.z);
 gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(p,1.);}`,
 fragmentShader:`uniform float uTime;uniform float uCore;varying vec3 vLocal;varying float vAlpha;
 void main(){float tail=1.-smoothstep(.65,2.2,vLocal.z);
 float flow=.85+.15*sin(vLocal.z*12.-uTime*12.);
 vec3 color=mix(vec3(.015,.28,1.),vec3(.08,.9,1.),tail);
 color=mix(color,vec3(.82,.98,1.),uCore*.85+pow(tail,5.)*.15);
 gl_FragColor=vec4(color*(1.3+uCore*.4),vAlpha*tail*flow*mix(.44,.70,uCore));}`
});}

/** Explicit owner because the effect opts out of automatic React Three Fiber disposal. */
export function createRimBurstResources(){
 const geometry=createRimBurstGeometry();geometry.setAttribute("burstAlpha",new InstancedBufferAttribute(new Float32Array(RIM_PORT_COUNT*RIM_BURST_LAYERS),1).setUsage(DynamicDrawUsage));
 const shell=createRimBurstMaterial(),core=createRimBurstMaterial(true);
 return {geometry,shell,core,dispose(instances=[]){
  // Mesh disposal releases instanceMatrix/instanceColor GPU buffers, independently of geometry.
  for(const mesh of new Set(instances))mesh?.dispose();
  geometry.dispose();shell.dispose();core.dispose();
 }};
}

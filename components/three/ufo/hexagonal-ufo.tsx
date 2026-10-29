"use client";
import {useEffect,useMemo,useRef,type ComponentProps,type RefObject} from "react";
import {useFrame} from "@react-three/fiber";
import {AdditiveBlending,Group,InstancedMesh,MeshStandardMaterial,Object3D,LatheGeometry,ShaderMaterial,Vector2} from "three";
import type {ClassicUFO} from "./classic-ufo";
import {SaucerPropulsion} from "./saucer-propulsion";
import {HexagonalHull} from "./hexagonal-hull";
import {createHexCanopy} from "./hexagonal-canopy-geometry.mjs";
export function HexagonalUFO({scale=1,position=[0,0,0],rotation=[0,0,0],hover=true,reducedMotion=false,gearRef,engineRef}:ComponentProps<typeof ClassicUFO>&{gearRef?:RefObject<number>;engineRef?:RefObject<number>}){
 const halos=useRef<InstancedMesh>(null),power=useRef(0);
 const gear=useRef<Group>(null);
 const root=useRef<Group>(null),rotor=useRef<Group>(null),lamps=useRef<InstancedMesh>(null),clock=useRef(0);
 const canopy=useMemo(()=>createHexCanopy(),[]);
 const core=useMemo(()=>new LatheGeometry([[0,-.42],[.6,-.42],[1.25,-.30],[1.95,-.15],[2.22,-.075],[2.22,.075],[1.95,.13],[1.25,.34],[.78,.43],[0,.43]].map(p=>new Vector2(...p)),48),[]);
 useEffect(()=>()=>{core.dispose();canopy.glass.dispose();canopy.frame.dispose();},[core,canopy]);
 useEffect(()=>{const t=new Object3D();for(let i=0;i<16;i++){const a=i*Math.PI/8;t.position.set(Math.sin(a)*2.235,0,Math.cos(a)*2.235);t.rotation.y=a;t.updateMatrix();lamps.current?.setMatrixAt(i,t.matrix);t.position.set(Math.sin(a)*2.265,0,Math.cos(a)*2.265);halos.current?.setMatrixAt(i,t.matrix);}if(lamps.current)lamps.current.instanceMatrix.needsUpdate=true;if(halos.current)halos.current.instanceMatrix.needsUpdate=true;},[]);
 useFrame((state,delta)=>{if(gear.current){const amount=gearRef?.current??1;gear.current.visible=amount>.01;gear.current.position.y=(1-amount)*.65;gear.current.scale.y=Math.max(.01,amount);}
 const dt=Math.min(delta,.1);
 const target=engineRef?.current??0;power.current=reducedMotion?target:power.current+(target-power.current)*(1-Math.exp(-5*dt));
 if(lamps.current)(lamps.current.material as MeshStandardMaterial).emissiveIntensity=1.25+power.current*3;
 if(halos.current){halos.current.visible=power.current>.01;(halos.current.material as ShaderMaterial).uniforms.uOpacity.value=power.current*.55;}
 if(Math.abs(target-power.current)>.001)state.invalidate();
 if(!reducedMotion){clock.current+=dt;if(rotor.current)rotor.current.rotation.y+=dt*1.8*(engineRef?power.current:1);state.invalidate();}if(root.current){root.current.position.y=hover&&!reducedMotion?Math.sin(clock.current*.7)*.035:0;root.current.rotation.z=hover&&!reducedMotion?Math.sin(clock.current*.43)*.012:0;}});
 return <group position={position} rotation={rotation} scale={scale}><group ref={root}>
  <SaucerPropulsion power={power} reducedMotion={reducedMotion}/>
  <group ref={rotor}>
   <mesh><primitive object={core} attach="geometry"/><meshStandardMaterial color="#303235" roughness={.48} metalness={.65}/></mesh>
   <HexagonalHull/>
   <mesh><cylinderGeometry args={[2.235,2.235,.145,48,1,true]}/><meshStandardMaterial color="#172025" roughness={.38} metalness={.75}/></mesh>
   {[-.073,.073].map(y=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.226,.014,4,48]}/><meshStandardMaterial color="#535655" roughness={.32} metalness={.8}/></mesh>)}
   <instancedMesh ref={lamps} args={[undefined,undefined,16]}><boxGeometry args={[.24,.055,.032]}/><meshStandardMaterial color="#7af5ff" emissive="#23c8e6" emissiveIntensity={1.25} toneMapped={false}/></instancedMesh>

   <instancedMesh ref={halos} visible={false} userData={{noCrashDebris:true}} args={[undefined,undefined,16]}>
    <planeGeometry args={[.58,.26]}/><shaderMaterial transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} uniforms={{uOpacity:{value:0}}}
     vertexShader={"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}"}
     fragmentShader={"uniform float uOpacity;varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;float glow=exp(-dot(p,p)*4.)*(1.-smoothstep(.6,1.,max(abs(p.x),abs(p.y))));gl_FragColor=vec4(.08,.8,1.,glow*uOpacity);}"}/>
   </instancedMesh>

   <mesh position={[0,-.46,0]}><cylinderGeometry args={[.57,.49,.10,12]}/><meshStandardMaterial color="#303a40" roughness={.6} metalness={.5}/></mesh>
   <mesh position={[0,-.52,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.43,.033,5,24]}/><meshStandardMaterial color="#75e9ef" emissive="#1fc9df" emissiveIntensity={1.1}/></mesh>
   <mesh position={[0,-.53,0]}><cylinderGeometry args={[.265,.265,.025,6]}/><meshStandardMaterial color="#7bf5ff" emissive="#29d5e6" emissiveIntensity={1.4}/></mesh>
  </group>
  {/* Fixed three-point landing gear; the surrounding disc remains the rotor. */}
   {[0,1,2].map(i=>{const a=i*Math.PI*2/3;return <group key={i} position={[Math.sin(a)*1.25,-.325,Math.cos(a)*1.25]}>
    <mesh><cylinderGeometry args={[.29,.265,.13,10]}/><meshStandardMaterial color="#525651" roughness={.62} metalness={.35}/></mesh>
    <mesh position={[0,-.074,0]}><cylinderGeometry args={[.225,.225,.018,10]}/><meshStandardMaterial color="#080e11" roughness={.95}/></mesh>
    {[-2,-1,0,1,2].map(j=><mesh key={j} position={[0,-.088,j*.067]}><boxGeometry args={[Math.sqrt(Math.max(0,.21**2-(j*.067)**2))*2,.017,.024]}/><meshStandardMaterial color="#343a3c" roughness={.7} metalness={.3}/></mesh>)}
   </group>;})}
  <group ref={gear}>
  {[0,1,2].map(i=>{const angle=i*Math.PI*2/3;return <group key={`gear-${i}`} rotation={[0,angle,0]}>
   <mesh position={[0,-.74,1.32]} rotation={[-.22,0,0]}><cylinderGeometry args={[.085,.025,.68,6]}/><meshStandardMaterial color="#909991" roughness={.68} metalness={.4} flatShading/></mesh>
   <mesh position={[0,-1.10,1.395]}><cylinderGeometry args={[.115,.15,.055,6]}/><meshStandardMaterial color="#333d40" roughness={.85} metalness={.2} flatShading/></mesh>
  </group>;})}
  </group>
  <mesh position={[0,.46,0]}><cylinderGeometry args={[.80,.84,.09,12]}/><meshStandardMaterial color="#54574f" roughness={.7} metalness={.35}/></mesh>
  <mesh><primitive object={canopy.glass} attach="geometry"/><meshPhysicalMaterial vertexColors roughness={.18} metalness={.25} clearcoat={.8} flatShading transparent opacity={.9} depthWrite={false}/></mesh>
  <mesh><primitive object={canopy.frame} attach="geometry"/><meshStandardMaterial color="#a5aaa5" roughness={.5} metalness={.55}/></mesh>
  <mesh position={[0,.49,0]}><cylinderGeometry args={[.70,.70,.025,12]}/><meshStandardMaterial color="#08171d"/></mesh>
  <mesh position={[0,.63,-.15]}><boxGeometry args={[.23,.26,.14]}/><meshStandardMaterial color="#162c35" roughness={.9}/></mesh>
  <group position={[0,.24,2.20]} rotation={[Math.PI/2,0,0]}>
   <mesh><cylinderGeometry args={[.225,.26,.32,8]}/><meshStandardMaterial color="#4e5455" roughness={.7} metalness={.45}/></mesh>
   <mesh position={[0,.2,0]}><cylinderGeometry args={[.175,.20,.12,8]}/><meshStandardMaterial color="#28383f" roughness={.5} metalness={.5}/></mesh>
   <mesh position={[0,.276,0]}><cylinderGeometry args={[.11,.11,.022,10]}/><meshStandardMaterial color="#90fff3" emissive="#24dbc7" emissiveIntensity={1.2}/></mesh>
  </group>
 </group></group>;
}

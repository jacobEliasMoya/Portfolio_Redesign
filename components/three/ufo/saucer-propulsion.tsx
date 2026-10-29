"use client";
import {useMemo,useRef,type RefObject} from "react";
import {useFrame} from "@react-three/fiber";
import {AdditiveBlending,DoubleSide,Group,Mesh,MeshBasicMaterial} from "three";
/** Small pooled anti-gravity ripples: no particles, lights or postprocessing. */
export function SaucerPropulsion({power,reducedMotion}:{power:RefObject<number>;reducedMotion:boolean}){
 const root=useRef<Group>(null),rings=useRef<Array<Mesh|null>>([]),time=useRef(0);
 const slots=useMemo(()=>[0,1,2],[]);
 useFrame((state,delta)=>{
  const strength=power.current;if(root.current)root.current.visible=strength>.01;
  if(strength<=.01)return;
  if(!reducedMotion)time.current+=Math.min(delta,.1);
  slots.forEach(i=>{const mesh=rings.current[i];if(!mesh)return;
   const phase=reducedMotion?(i+.3)/3:(time.current*.7+i/3)%1;
   mesh.position.y=-.55-phase*.85*strength;
   mesh.scale.setScalar(.32+phase*.34);
   (mesh.material as MeshBasicMaterial).opacity=strength*(1-phase)*.25;
  });
  if(!reducedMotion)state.invalidate();
 });
 return <group ref={root} visible={false} userData={{noCrashDebris:true}} name="saucer-propulsion">
  {slots.map(i=><mesh key={i} ref={node=>{rings.current[i]=node;}} rotation={[-Math.PI/2,0,0]}>
   <ringGeometry args={[.84,1,24]}/><meshBasicMaterial color="#77f5ed" transparent opacity={0} side={DoubleSide} blending={AdditiveBlending} depthWrite={false} toneMapped={false}/>
  </mesh>)}
 </group>;
}

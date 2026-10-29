"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, InstancedMesh, Object3D } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createSaucerGeometry } from "./saucer-geometry.mjs";
import {AlienCannon} from "./alien-cannon";

/** Original faceted 1950s saucer: a continuous faceted hull and a glazed cockpit. */
export function ClassicUFO({ scale=1,position=[0,0,0],rotation=[0,0,0],hover=true,reducedMotion=false }: {
  scale?:number;position?:[number,number,number];rotation?:[number,number,number];hover?:boolean;reducedMotion?:boolean;
}){
  const root=useRef<Group>(null),disc=useRef<Group>(null),clock=useRef(0);
  const lights=useRef<InstancedMesh>(null),housings=useRef<InstancedMesh>(null);
  const geometry=useMemo(()=>createSaucerGeometry(),[]);
  const lamp=useMemo(()=>new RoundedBoxGeometry(.27,.048,.032,1,.01),[]);
  const housing=useMemo(()=>new RoundedBoxGeometry(.35,.085,.055,1,.014),[]);
  const seat=useMemo(()=>new RoundedBoxGeometry(.31,.29,.13,1,.035),[]);
  const cushion=useMemo(()=>new RoundedBoxGeometry(.34,.075,.29,1,.022),[]);
  const console=useMemo(()=>new RoundedBoxGeometry(.46,.095,.2,1,.025),[]);
  useEffect(()=>()=>{seat.dispose();cushion.dispose();console.dispose();Object.values(geometry).forEach((g)=>g?.dispose());lamp.dispose();housing.dispose();},[geometry,lamp,housing,seat,cushion,console]);
  useEffect(()=>{
    const t=new Object3D();
    t.scale.set(1,1,1);
    for(let i=0;i<12;i++){
      const angle=i*Math.PI/6;t.rotation.set(0,angle,0);
      t.position.set(Math.sin(angle)*2.227,0,Math.cos(angle)*2.195);t.updateMatrix();housings.current?.setMatrixAt(i,t.matrix);
      t.position.set(Math.sin(angle)*2.252,0,Math.cos(angle)*2.249);t.updateMatrix();lights.current?.setMatrixAt(i,t.matrix);
    }
    if(lights.current)lights.current.instanceMatrix.needsUpdate=true;
    if(housings.current)housings.current.instanceMatrix.needsUpdate=true;
  },[]);
  useFrame((state,delta)=>{
    if(!root.current)return;
    // Cockpit is a sibling of this rotor, so flight heading never inherits disc spin.
    if(disc.current&&!reducedMotion){disc.current.rotation.y=(disc.current.rotation.y+Math.min(delta,.1)*1.8)%(Math.PI*2);state.invalidate();}
    if(hover&&!reducedMotion){clock.current+=Math.min(delta,.1);root.current.position.y=Math.sin(clock.current*.7)*.035;root.current.rotation.z=Math.sin(clock.current*.43)*.012;state.invalidate();}
    else {root.current.position.y=0;root.current.rotation.z=0;}
  });
  return <group position={position} rotation={rotation} scale={scale}><group ref={root}>
    <group ref={disc}>
    <mesh><primitive object={geometry.hull} attach="geometry"/><meshStandardMaterial color="#9da6af" metalness={.68} roughness={.29} flatShading/></mesh>
    <mesh><primitive object={geometry.belt} attach="geometry"/><meshStandardMaterial color="#23303a" metalness={.65} roughness={.35} flatShading/></mesh>
    {[-.063,.073].map((height)=><mesh key={height} position={[0,height,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[2.205,.016,4,24]}/><meshStandardMaterial color="#c1cad3" metalness={.75} roughness={.23}/></mesh>)}
    <instancedMesh ref={housings} args={[undefined,undefined,12]}><primitive object={housing} attach="geometry"/><meshStandardMaterial color="#182831" metalness={.45} roughness={.5}/></instancedMesh>
    <instancedMesh ref={lights} args={[undefined,undefined,12]}><primitive object={lamp} attach="geometry"/><meshStandardMaterial color="#7ae4ee" emissive="#35c1df" emissiveIntensity={.85} roughness={.3}/></instancedMesh>
    <mesh><primitive object={geometry.engine} attach="geometry"/><meshStandardMaterial color="#344752" metalness={.65} roughness={.32} flatShading/></mesh>
    <mesh position={[0,-.522,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.43,.022,5,24]}/><meshStandardMaterial color="#70d8e6" emissive="#2996ad" emissiveIntensity={.7}/></mesh>
    <mesh position={[0,-.49,0]}><cylinderGeometry args={[.245,.245,.02,6]}/><meshStandardMaterial color="#8bd7e2" emissive="#45adbf" emissiveIntensity={.55}/></mesh>
    {[0,1,2].map((i)=>{const angle=i*Math.PI*2/3;return <group key={i} position={[Math.sin(angle)*1.24,-.255,Math.cos(angle)*1.24]}>
      <mesh><cylinderGeometry args={[.16,.135,.10,8]}/><meshStandardMaterial color="#1e2c34" roughness={.65} metalness={.4}/></mesh>
      <mesh position={[0,-.055,0]}><cylinderGeometry args={[.105,.105,.012,8]}/><meshStandardMaterial color="#080f14" roughness={.8}/></mesh>
    </group>;})}
    </group>
    <group>
    <AlienCannon reducedMotion={reducedMotion}/>
    <mesh position={[0,.44,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.839,.036,5,24]}/><meshStandardMaterial color="#46545f" metalness={.65} roughness={.3}/></mesh>
    <mesh><primitive object={geometry.frame} attach="geometry"/><meshStandardMaterial color="#b5c0c9" metalness={.72} roughness={.23}/></mesh>
    <mesh><primitive object={geometry.canopy} attach="geometry"/><meshPhysicalMaterial color="#3f7e94" metalness={.12} roughness={.12} transparent opacity={.48} depthWrite={false} clearcoat={1} flatShading/></mesh>
    <mesh position={[0,.48,0]}><cylinderGeometry args={[.72,.72,.07,12]}/><meshStandardMaterial color="#121f29" roughness={.7}/></mesh>
    <mesh position={[0,.65,-.18]} rotation={[-.12,0,0]}><primitive object={seat} attach="geometry"/><meshStandardMaterial color="#34434d" roughness={.74}/></mesh>
    <mesh position={[0,.525,-.04]}><primitive object={cushion} attach="geometry"/><meshStandardMaterial color="#34434d" roughness={.74}/></mesh>
    <mesh position={[0,.56,.34]} rotation={[.23,0,0]}><primitive object={console} attach="geometry"/><meshStandardMaterial color="#263a45" roughness={.5}/></mesh>
    <mesh position={[0,.608,.35]} rotation={[.23,0,0]}><boxGeometry args={[.27,.012,.075]}/><meshStandardMaterial color="#69c6d4" emissive="#318b9a" emissiveIntensity={.35}/></mesh>
    <mesh position={[0,1.055,0]}><cylinderGeometry args={[.10,.135,.035,6]}/><meshStandardMaterial color="#aab7c1" metalness={.7} roughness={.23}/></mesh>
    </group>
  </group></group>;
}

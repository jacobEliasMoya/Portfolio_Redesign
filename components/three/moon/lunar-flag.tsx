"use client";
import {useEffect,useMemo,useRef,type RefObject} from "react";
import {useFrame} from "@react-three/fiber";
import {DoubleSide,Group,InstancedMesh,Matrix4,Quaternion,Vector3} from "three";
import {getProjectileTarget} from "../ufo/projectile-collision.mjs";
import {createLunarFlagGeometry,flagLaunchWash} from "./lunar-flag-geometry.mjs";
export function LunarFlag({moon,reducedMotion=false}:{moon:RefObject<InstancedMesh|null>;reducedMotion?:boolean}){
 const root=useRef<Group>(null),geometry=useMemo(()=>createLunarFlagGeometry(),[]);
 const wasMoving=useRef(false),wash=useRef(.3),originals=useMemo(()=>Object.values(geometry).map(g=>g.getAttribute("position").array.slice()),[geometry]);
 const pose=useMemo(()=>{
  const normal=new Vector3(-.56,.75,.35).normalize(),position=normal.clone().multiplyScalar(.84);
  // Moon-local chase view: behind the parked craft's +Z heading and above the pad.
  const face=new Vector3(0,2.5,-4.8).sub(position);face.addScaledVector(normal,-face.dot(normal)).normalize();
  const right=new Vector3().crossVectors(normal,face).normalize();
  return {position,rotation:new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right,normal,face))};
 },[]);
 useEffect(()=>()=>{Object.values(geometry).forEach(g=>g.dispose());},[geometry]);
 useFrame((state,delta)=>{
  if(root.current&&moon.current){const phase=getProjectileTarget(moon.current)?.planetPhase();root.current.visible=phase!=="exploding"&&phase!=="gone";}
  const ship=state.scene.getObjectByName("piloted-saucer"),launching=ship?.userData.launching===true;
  const target=reducedMotion?0:.3+(launching?Math.sin(Math.PI*Math.min(1,(ship?.userData.launchAge??0)/2.6))*.7:0);
  wash.current+=(target-wash.current)*(1-Math.exp(-5*Math.min(delta,.1)));
  if(reducedMotion)wash.current=0;
  const moving=wash.current>.001;
  if(!moving&&!wasMoving.current)return;
  wasMoving.current=moving;
  Object.values(geometry).forEach((g,index)=>{
   const p=g.getAttribute("position"),base=originals[index];
   for(let i=0;i<p.count;i++)p.setZ(i,base[i*3+2]+(moving?flagLaunchWash(base[i*3],base[i*3+1],state.clock.elapsedTime,wash.current):0));
   p.needsUpdate=true;g.computeVertexNormals();
  });
  if(moving)state.invalidate();
 });
 return <group ref={root} position={pose.position} quaternion={pose.rotation} name="jm-lunar-flag">
  <mesh position={[0,.015,0]}><cylinderGeometry args={[.045,.067,.07,6]}/><meshStandardMaterial color="#77797c" roughness={.95}/></mesh>
  <mesh position={[0,.335,0]}><cylinderGeometry args={[.009,.011,.64,6]}/><meshStandardMaterial color="#a7b2b5" metalness={.6} roughness={.5}/></mesh>
  <mesh position={[0,.672,0]}><icosahedronGeometry args={[.019,0]}/><meshStandardMaterial color="#bec7c6" metalness={.55} roughness={.4}/></mesh>
  <mesh position={[.21,.625,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.005,.005,.43,6]}/><meshStandardMaterial color="#7e9096" roughness={.6} metalness={.4}/></mesh>
  {[.36,.62].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[.016,.016,.016,6]}/><meshStandardMaterial color="#bec7c6" metalness={.5} roughness={.5}/></mesh>)}
  <mesh geometry={geometry.cloth}><meshStandardMaterial vertexColors side={DoubleSide} roughness={.94} flatShading/></mesh>
  <mesh geometry={geometry.stripe}><meshStandardMaterial color="#22c6d8" side={DoubleSide} roughness={.8}/></mesh>
  <mesh geometry={geometry.letters}><meshStandardMaterial color="#f5e7c6" side={DoubleSide} roughness={.9}/></mesh>
 </group>;
}

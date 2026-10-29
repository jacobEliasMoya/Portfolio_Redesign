"use client";
import {useLayoutEffect,useMemo} from "react";
import {Environment,Lightformer} from "@react-three/drei";
import {Mesh,MeshStandardMaterial,Scene,type Group} from "three";

/** Shared studio cards keep the saucer's metallic finish consistent across scenes. */
export function SaucerReflectionCards(){
 return <>
  <Lightformer position={[-4,5,2]} rotation={[Math.PI/2,0,0]} scale={[8,3,1]} intensity={3}/>
  <Lightformer position={[4,2,-2]} rotation={[0,-Math.PI/2,0]} scale={[3,6,1]} color="#b3d8ef" intensity={2}/>
  <Lightformer position={[0,1,5]} rotation={[0,Math.PI,0]} scale={[7,1,1]} intensity={1.5}/>
 </>;
}

/** Capture once and apply only to this model, leaving the containing scene unchanged. */
export function SaucerReflections({model}:{model:Group}){
 const reflectionScene=useMemo(()=>new Scene(),[]);
 useLayoutEffect(()=>{
  const previous=new Map<MeshStandardMaterial,MeshStandardMaterial["envMap"]>();
  model.traverse(object=>{
   if(!(object instanceof Mesh))return;
   for(const material of Array.isArray(object.material)?object.material:[object.material]){
    if(!(material instanceof MeshStandardMaterial)||previous.has(material))continue;
    previous.set(material,material.envMap);
    material.envMap=reflectionScene.environment;
    material.needsUpdate=true;
   }
  });
  return()=>{for(const [material,map] of previous){material.envMap=map;material.needsUpdate=true;}};
 },[model,reflectionScene]);
 return <Environment scene={reflectionScene} resolution={128} frames={1}><SaucerReflectionCards/></Environment>;
}

"use client";
import {useEffect,useRef,type RefObject} from "react";
import {InstancedMesh,type BufferGeometry} from "three";
import {createDestructible,registerProjectileTarget,getProjectileTarget} from "@/components/three/ufo/projectile-collision.mjs";
export function useDestructibleInstances(mesh:RefObject<InstancedMesh|null>,options:{blast?:number;padding?:number;dynamic?:boolean;foundation?:number;mode?:"destroy"|"dent"|"explode"|"crater";threshold?:number;explosionsEnabled?:boolean;craterSurfaces?:RefObject<Array<BufferGeometry|null>>}={}){
 const dead=useRef(new Set<number>());
 const {blast=.22,padding=.04,dynamic=false,foundation=0,mode="destroy",threshold=0,explosionsEnabled=true,craterSurfaces}=options;
 useEffect(()=>{
  const object=mesh.current;if(!object)return;
  const target=createDestructible(object,dead.current,{blast,padding,dynamic,foundation,mode,threshold,craterSurfaces});
  const unregister=registerProjectileTarget(object,target);
  let stopped=false,timer:ReturnType<typeof setTimeout>;
  // Let sibling initialization effects populate instance matrices first, then build in small tasks.
  const prepare=()=>{if(stopped)return;if(!target.prepareIndex(384))timer=setTimeout(prepare,0);};
  if(!dynamic&&foundation>0)timer=setTimeout(prepare,0);
  return()=>{stopped=true;clearTimeout(timer);unregister();};
 },[mesh,blast,padding,dynamic,foundation,mode,threshold,craterSurfaces]);
 useEffect(()=>{if(mesh.current)getProjectileTarget(mesh.current)?.setExplosionsEnabled(explosionsEnabled);},[mesh,explosionsEnabled,blast,padding,dynamic,foundation,mode,threshold,craterSurfaces]);
 return dead;
}

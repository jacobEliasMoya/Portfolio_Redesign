"use client";
import {useEffect,useMemo,useRef} from "react";
import {useFrame,useThree} from "@react-three/fiber";
import type {Group} from "three";
import {animateBlackHole,createBlackHole,disposeBlackHole} from "./create-black-hole.mjs";
export function BlackHole({reducedMotion=false,paused=false,wideDisc=false,gravity=true,gravityPower=1}:{reducedMotion?:boolean;paused?:boolean;wideDisc?:boolean;gravity?:boolean;gravityPower?:number}){
 const invalidate=useThree(s=>s.invalidate);
 const model=useMemo(()=>createBlackHole({wideDisc}),[wideDisc]),root=useRef<Group>(null);
 useEffect(()=>()=>disposeBlackHole(model),[model]);
 useEffect(()=>{invalidate();},[paused,reducedMotion,invalidate]);
 useFrame((state,delta)=>{if(root.current&&!reducedMotion&&!paused){animateBlackHole(root.current,delta);state.invalidate();}});
 return <primitive ref={root} object={model} userData-projectileGravity={{enabled:gravity,power:gravityPower,radius:2,kind:"blackHole"}} dispose={null}/>;
}

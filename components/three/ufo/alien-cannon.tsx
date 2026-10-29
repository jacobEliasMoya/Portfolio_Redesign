"use client";
import {useEffect,useMemo} from "react";
import {useFrame} from "@react-three/fiber";
import {createAlienCannonModel,disposeAlienCannonModel,stepCannonRotation} from "./alien-cannon.mjs";
export function AlienCannon({reducedMotion=false}:{reducedMotion?:boolean}){
 const model=useMemo(()=>createAlienCannonModel(),[]);
 const rotor=useMemo(()=>model.getObjectByName("alien-cannon-rotor"),[model]);
 useFrame((state,delta)=>{if(stepCannonRotation(rotor,delta,reducedMotion))state.invalidate();});
 useEffect(()=>()=>disposeAlienCannonModel(model),[model]);
 return <primitive object={model} dispose={null}/>;
}

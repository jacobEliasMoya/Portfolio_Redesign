"use client";
import {useEffect,useMemo,useRef,type RefObject} from "react";
import {useFrame,useThree} from "@react-three/fiber";
import type {Vector3} from "three";
import type {HudStore} from "../ufo/arcade-hud";
import {LensingField} from "./lensing-field";
import {createSingularityEffect,launchSingularity,requestSingularityDetonation,stepSingularity,disposeSingularityEffect} from "./singularity-effect.mjs";
export function Singularity({store,position,reducedMotion}:{store:HudStore;position:RefObject<Vector3>;reducedMotion:boolean}){
 const {scene,invalidate}=useThree();
 const effect=useMemo(()=>createSingularityEffect(),[]),live=useRef(effect);
 useEffect(()=>{
  const current=live.current;
  const unsubscribe=store.subscribeSingularity((shot:Parameters<typeof launchSingularity>[1])=>{
   if(shot?launchSingularity(current,shot):requestSingularityDetonation(current))invalidate();
  });
  return()=>{unsubscribe();disposeSingularityEffect(current);};
 },[store,invalidate]);
 useFrame((state,delta)=>{
  const current=live.current;if(current.phase==="idle")return;
  const running=stepSingularity(current,scene,delta,performance.now()/1000,position.current,reducedMotion);
  store.publish({singularityPhase:current.phase,singularityShipConsumed:current.shipConsumed,singularityShipCaptured:current.shipCapture.captured});
  if(running)state.invalidate();
 });
 return <group userData={{singularityExcluded:true}}><primitive object={effect.bomb.root} dispose={null}/><primitive object={effect.model} dispose={null}/><LensingField source={effect.model}/></group>;
}

"use client";
import {useEffect,useMemo,useRef,type ComponentProps,type RefObject} from "react";
import {useFrame} from "@react-three/fiber";
import type {Group,MeshStandardMaterial} from "three";
import type {ClassicUFO} from "./classic-ufo";
import {createUFOV3,disposeUFOV3} from "./create-ufo-v3.mjs";
import {applyLandingGear} from "./landing-suspension.mjs";
import {SaucerPropulsion} from "./saucer-propulsion";
import {SaucerReflections} from "./saucer-reflections";
import {stepCannonRotation} from "./alien-cannon.mjs";
export function UFOV3({scale=1,position=[0,0,0],rotation=[0,0,0],hover=true,reducedMotion=false,gearRef,engineRef,suspensionRef}:ComponentProps<typeof ClassicUFO>&{gearRef?:RefObject<number>;engineRef?:RefObject<number>;suspensionRef?:RefObject<number>}){
 const model=useMemo(()=>createUFOV3(),[]),power=useRef(0),clock=useRef(0),rig=useRef<Group>(null);
 useEffect(()=>()=>disposeUFOV3(model),[model]);
 useFrame((state,delta)=>{const current=rig.current;if(!current)return;const dt=Math.min(delta,.1),target=engineRef?.current??0;power.current=reducedMotion?target:power.current+(target-power.current)*(1-Math.exp(-5*dt));
  const dome=current.getObjectByName("v3-dome"),gear=current.getObjectByName("v3-gear"),amount=gearRef?.current??0;
  applyLandingGear(gear,amount,suspensionRef?.current??0);
  stepCannonRotation(current.getObjectByName("alien-cannon-rotor"),dt,reducedMotion);
  if(!reducedMotion){clock.current+=dt;if(dome)dome.rotation.y+=dt*2.34*(engineRef?power.current:1);}
  current.position.y=hover&&!reducedMotion?Math.sin(clock.current*.7)*.035:0;current.rotation.z=hover&&!reducedMotion?Math.sin(clock.current*.43)*.012:0;
  current.traverse(object=>{if("material" in object){const m=object.material as MeshStandardMaterial;if(m.name==="v3-navigation")m.emissiveIntensity=1.25+power.current*2;}});
  if(!reducedMotion||Math.abs(target-power.current)>.001)state.invalidate();
 });
 return <group position={position} rotation={rotation} scale={scale}><SaucerReflections model={model}/><primitive ref={rig} object={model} dispose={null}/><SaucerPropulsion power={power} reducedMotion={reducedMotion}/></group>;
}

"use client";
import {useEffect,useMemo,useRef,type ComponentProps,type RefObject} from "react";
import {useFrame} from "@react-three/fiber";
import type {Group,MeshStandardMaterial} from "three";
import type {ClassicUFO} from "./classic-ufo";
import {createReferenceUFO,disposeReferenceUFO} from "./create-reference-ufo.mjs";
import {SaucerPropulsion} from "./saucer-propulsion";
export function ReferenceUFO({scale=1,position=[0,0,0],rotation=[0,0,0],hover=true,reducedMotion=false,gearRef,engineRef}:ComponentProps<typeof ClassicUFO>&{gearRef?:RefObject<number>;engineRef?:RefObject<number>}){
 const model=useMemo(()=>createReferenceUFO(),[]),power=useRef(0),clock=useRef(0),rig=useRef<Group>(null);
 useEffect(()=>()=>disposeReferenceUFO(model),[model]);
 useFrame((state,delta)=>{const current=rig.current;if(!current)return;const dt=Math.min(delta,.1),target=engineRef?.current??0;power.current=reducedMotion?target:power.current+(target-power.current)*(1-Math.exp(-5*dt));
  const disc=current.getObjectByName("reference-disc"),gear=current.getObjectByName("reference-gear"),amount=gearRef?.current??0;
  if(gear){gear.visible=amount>.01;gear.scale.y=Math.max(.01,amount);gear.position.y=(1-amount)*.65;}
  if(!reducedMotion){clock.current+=dt;if(disc)disc.rotation.y+=dt*1.8*(engineRef?power.current:1);}
  current.position.y=hover&&!reducedMotion?Math.sin(clock.current*.7)*.035:0;current.rotation.z=hover&&!reducedMotion?Math.sin(clock.current*.43)*.012:0;
  current.traverse(object=>{if("material" in object){const m=object.material as MeshStandardMaterial;if(m.name==="cyan-navigation")m.emissiveIntensity=1.25+power.current*2;}});
  if(!reducedMotion||Math.abs(target-power.current)>.001)state.invalidate();
 });
 return <group position={position} rotation={rotation} scale={scale}><primitive ref={rig} object={model} dispose={null}/><SaucerPropulsion power={power} reducedMotion={reducedMotion}/></group>;
}

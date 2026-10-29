"use client";
import {useEffect,useRef} from "react";
import {useFrame} from "@react-three/fiber";
import type {Group} from "three";
import {UFOModel,type UFOType} from "./ufo-model";
import {launchProgress} from "./lunar-launch.mjs";
import {landingEase} from "./lunar-landing.mjs";
import {touchdownCompression,PARKED_COMPRESSION} from "./landing-suspension.mjs";

/** Inspection-only cycle; uses the same suspension functions as actual pad landings. */
export function GearTestModel({type,serial,hover,reducedMotion}:{type:UFOType;serial:number;hover:boolean;reducedMotion:boolean}){
 const root=useRef<Group>(null),clock=useRef(0),gear=useRef(0),power=useRef(0),compression=useRef(0);
 useEffect(()=>{clock.current=0;},[serial,type]);
 useFrame((state,delta)=>{
  if(!serial||!root.current)return;
  clock.current=reducedMotion?8:Math.min(8,clock.current+Math.min(delta,.1));const t=clock.current;
  let lift=0,load=0,deployment=1,engine=0;
  if(t<.7)deployment=landingEase(t/.7);
  else if(t<1.55)load=touchdownCompression(t-.7);
  else if(t<4.15){const p=launchProgress(t-1.55);lift=p.lift*.3;load=p.compression;deployment=p.gear;engine=Math.min(1,(t-1.55)/.7);}
  else if(t<4.55){lift=.75;deployment=0;engine=1;}
  else if(t<5.45){lift=.75;deployment=landingEase((t-4.55)/.9);engine=1;}
  else if(t<6.65){const descent=landingEase((t-5.45)/1.2);lift=.75*(1-descent);engine=1-descent;}
  else load=t<7.5?touchdownCompression(t-6.65):PARKED_COMPRESSION;
  gear.current=deployment;power.current=engine;compression.current=load;root.current.position.y=lift-load;
  if(t<8)state.invalidate();
 },-1);
 return <group ref={root}><UFOModel type={type} hover={serial?false:hover} reducedMotion={reducedMotion} gearRef={serial?gear:undefined} engineRef={serial?power:undefined} suspensionRef={serial?compression:undefined}/></group>;
}

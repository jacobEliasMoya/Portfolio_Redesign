"use client";
import {useEffect,useMemo,useRef} from "react";
import {FileLoader,type Group} from "three";
import {useFrame,useLoader,useThree} from "@react-three/fiber";
import {createConsumedUFO,disposeConsumedUFO} from "./consume-ufo.mjs";
import {createConsumedPlanet,disposeConsumedPlanet,updateConsumedPlanet} from "./consume-planet.mjs";

export type ConsumptionTarget="UFO"|"Earth"|"Moon";
type Playback={run:number;paused:boolean;reducedMotion:boolean;onComplete:()=>void};
function ConsumptionModel({model,planet=false,run,paused,reducedMotion,onComplete}:Playback&{model:Group;planet?:boolean}){
 const root=useRef<Group>(null),elapsed=useRef(0),finished=useRef(false),invalidate=useThree(s=>s.invalidate);
 useEffect(()=>()=>{if(planet)disposeConsumedPlanet(model);else disposeConsumedUFO(model);},[model,planet]);
 useEffect(()=>{elapsed.current=0;finished.current=false;const live=root.current;if(live){if(planet)updateConsumedPlanet(live,0);else live.userData.consumption.clock.value=0;live.visible=true;}invalidate();},[run,model,planet,invalidate]);
 useEffect(()=>{invalidate();},[paused,reducedMotion,invalidate]);
 useFrame((state,delta)=>{const live=root.current;if(!live||!run||finished.current||paused)return;
  elapsed.current+=Math.min(delta,.05);
  const data=live.userData.consumption,time=reducedMotion?data.endTime:elapsed.current;
  if(planet)updateConsumedPlanet(live,time);else data.clock.value=time;
  if(time>=data.endTime){live.visible=false;finished.current=true;onComplete();}
  else state.invalidate();
 });
 return <primitive ref={root} object={model} dispose={null}/>;
}
function UFOConsumption(props:Playback){const model=useMemo(()=>createConsumedUFO(),[]);return <ConsumptionModel {...props} model={model}/>;}
function PlanetConsumption({target,...props}:Playback&{target:"Earth"|"Moon"}){
 const kind=target==="Earth"?"earth":"moon",raw=useLoader(FileLoader,`/models/${kind}/block-${kind}.json`);
 const model=useMemo(()=>createConsumedPlanet(JSON.parse(String(raw)),kind),[raw,kind]);
 return <ConsumptionModel {...props} model={model} planet/>;
}
export function ConsumptionTest({target,...props}:Playback&{target:ConsumptionTarget}){
 return target==="UFO"?<UFOConsumption {...props}/>:<PlanetConsumption target={target} {...props}/>;
}

"use client";
import {useEffect,useMemo} from "react";
import {useFrame} from "@react-three/fiber";
import type {HudStore} from "../ufo/arcade-hud";
import {registerProjectileTarget} from "../ufo/projectile-collision.mjs";
import {createRocketEvent,stepRocketEvent,ROCKET_RARITIES} from "./rocket-event.mjs";
import {createRocketVisuals,showRocketVisuals,stopRocketEffects,rocketDestroyed,disposeRocketVisuals} from "./rocket-visuals.mjs";
import {createRocketTarget} from "./rocket-target.mjs";
const universeEnding=(store:HudStore)=>["escape","consuming","consumed"].includes(store.getSnapshot().singularityPhase);
export function CapeLaunches({store,enabled,reducedMotion}:{store:HudStore;enabled:boolean;reducedMotion:boolean}){
 const event=useMemo(()=>createRocketEvent(),[]),visuals=useMemo(()=>createRocketVisuals(),[]);
 useEffect(()=>{visuals.root.add(visuals.blast.root);return()=>disposeRocketVisuals(visuals);},[visuals]);
 useEffect(()=>{
  const detach=visuals.bodies.map((mesh,index)=>registerProjectileTarget(mesh,createRocketTarget(mesh,ROCKET_RARITIES[index],event,visuals.dead[index],()=>rocketDestroyed(visuals,event,store,reducedMotion),()=>universeEnding(store))));
  return()=>detach.forEach(remove=>remove());
 },[visuals,event,store,reducedMotion]);
 useFrame((state,delta)=>{
  if(!enabled)return;
  if(universeEnding(store)){stopRocketEffects(visuals);return;}
  const result=stepRocketEvent(event,reducedMotion?0:Math.min(.1,delta));
  if(result==="launch"){resetLaunch(visuals);store.announceRocket(`${event.tier.label} ROCKET LAUNCH`,event.tier.color);}
  showRocketVisuals(visuals,event,reducedMotion);
  if(!reducedMotion)state.invalidate();
 });
 return <primitive object={visuals.root} dispose={null}/>;
}
function resetLaunch(visuals:ReturnType<typeof createRocketVisuals>){visuals.dead.forEach(set=>set.clear());}

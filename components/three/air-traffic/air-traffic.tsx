"use client";
import {useEffect,useMemo,useRef} from "react";
import {useFrame,useThree} from "@react-three/fiber";
import {Color,DynamicDrawUsage,InstancedMesh} from "three";
import {useDestructibleInstances} from "@/hooks/use-destructible-instances";
import {createAirplaneModel} from "./airplane-model.mjs";
import {createContrails} from "./contrails.mjs";
import {createTrafficNetwork,FLEET_SIZE,PLANE_STYLES,TRAIL_PUFFS} from "./traffic-network.mjs";
import {createTrafficVisualState,setTrafficVisibility,stepTrafficVisuals} from "./traffic-visuals.mjs";
import airportData from "./major-airports.json";
/** One aircraft draw and one short, pooled cloud-trail draw, attached to Earth's geography. */
export function AirTraffic({enabled=true,reducedMotion=false}:{enabled?:boolean;reducedMotion?:boolean}){
 const model=useMemo(()=>createAirplaneModel(),[]),network=useMemo(()=>createTrafficNetwork(airportData),[]),trails=useMemo(()=>createContrails(FLEET_SIZE*TRAIL_PUFFS*2),[]),visuals=useMemo(()=>createTrafficVisualState(),[]);
 const mesh=useRef<InstancedMesh>(null),clock=useRef(0),dirty=useRef(true);
 const dead=useDestructibleInstances(mesh,{dynamic:true,blast:.02,padding:.025,mode:"destroy",scorePerInstance:10});
 const invalidate=useThree(s=>s.invalidate);
 useEffect(()=>()=>{model.dispose();trails.dispose();},[model,trails]);
 useEffect(()=>{const object=mesh.current;if(!object)return;object.instanceMatrix.setUsage(DynamicDrawUsage);const color=new Color();for(let i=0;i<FLEET_SIZE;i++)object.setColorAt(i,color.set(PLANE_STYLES[i%3].color));if(object.instanceColor)object.instanceColor.needsUpdate=true;return()=>object.dispose();},[]);
 useEffect(()=>{dirty.current=true;invalidate();},[enabled,reducedMotion,invalidate]);
 useFrame((state,delta)=>{
  const object=mesh.current;if(!object)return;setTrafficVisibility(object,trails,enabled,reducedMotion);if(!enabled)return;
  const dt=Math.min(delta,.1);if(!reducedMotion)clock.current+=dt;
  if(reducedMotion&&!dirty.current)return;
  stepTrafficVisuals(object,trails,network,clock.current,dt,dead.current,reducedMotion,visuals);dirty.current=false;
  if(!reducedMotion)state.invalidate();
 });
 return <><instancedMesh ref={mesh} name="Major airport traffic targets" args={[model.geometry,model.material,FLEET_SIZE]} frustumCulled={false} dispose={null}/><primitive object={trails.mesh} dispose={null}/></>;
}

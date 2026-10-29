"use client";
import {useEffect,useRef,type RefObject} from "react";
import {useFrame} from "@react-three/fiber";
import {Group,Vector3} from "three";
import {createCrashPool} from "./crash-pool.mjs";
export type CrashEvent={serial:number;kind:"bounce"|"crash";age:number;point:Vector3;normal:Vector3;velocity:Vector3};
export function CrashEffects({ship,eventRef,reducedMotion}:{ship:RefObject<Group|null>;eventRef:RefObject<CrashEvent>;reducedMotion:boolean}){
 const root=useRef<Group>(null),pool=useRef<ReturnType<typeof createCrashPool>|null>(null),model=useRef<Group|null>(null),seen=useRef(0);
 useEffect(()=>()=>{pool.current?.dispose();pool.current=null;model.current=null;},[]);
 useFrame((scene,delta)=>{
  if(!ship.current||!root.current)return;
  const current=ship.current.children[0] as Group|undefined;if(!current)return;
  if(model.current!==current){if(pool.current){root.current.remove(pool.current.root);pool.current.dispose();}pool.current=createCrashPool(ship.current);root.current.add(pool.current.root);model.current=current;}
  const effect=pool.current!;
  const event=eventRef.current;
  // No preparation or allocation work on the actual impact frame.
  if(event.serial!==seen.current){seen.current=event.serial;if(event.serial)effect.trigger(event,reducedMotion);}
  else if(!effect.ready&&!reducedMotion&&(event.serial===0||event.age>=(event.kind==="crash"?2:.5))){effect.prepare(3);scene.invalidate();}
  if(effect.step(delta,event.age))scene.invalidate();
 });
 return <group ref={root}/>;
}

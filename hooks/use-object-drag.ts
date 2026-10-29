"use client";
import {useEffect,type RefObject} from "react";
import {useThree} from "@react-three/fiber";
import type {Camera,Object3D,Vector3} from "three";
import {createDragHitTest,createObjectDragController} from "@/components/three/animation/object-drag.mjs";

const controllers=new WeakMap<HTMLCanvasElement,{controller:ReturnType<typeof createObjectDragController>;users:number}>();
type DragOptions={object:RefObject<Object3D|null>;radius:number;enabled:boolean;instances?:boolean;available?:()=>boolean;onStart?:(point:Vector3)=>void;onMove:(event:{dx:number;dy:number;camera:Camera})=>void;onEnd?:()=>void};
export function useObjectDrag({object,radius,enabled,instances=false,available,onStart,onMove,onEnd}:DragOptions){
 const canvas=useThree(s=>s.gl.domElement),camera=useThree(s=>s.camera),invalidate=useThree(s=>s.invalidate);
 useEffect(()=>{
  if(!enabled)return;
  let entry=controllers.get(canvas);if(!entry){entry={controller:createObjectDragController(canvas,camera,invalidate),users:0};controllers.set(canvas,entry);}entry.users++;
  const remove=entry.controller.add({enabled:()=>enabled&&(!available||available()),hit:createDragHitTest(object,radius,instances),start:onStart,move:onMove,end:onEnd});
  return()=>{remove();if(--entry.users===0){entry.controller.dispose();controllers.delete(canvas);}};
 },[canvas,camera,invalidate,object,radius,enabled,instances,available,onStart,onMove,onEnd]);
}

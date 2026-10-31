"use client";
import {useEffect,useRef,type RefObject} from "react";
import {clampTour,stepTourStops,wheelTourProgress} from "@/components/three/animation/scroll-tour.mjs";
export function useScrollTour(canvas:HTMLCanvasElement,enabled:RefObject<boolean>,steps:number,reset:number,invalidate:()=>void,active:boolean,request?:{serial:number;progress:number}){
 const lastRequest=useRef(request?.serial??0);
 const progress=useRef(0),previous=useRef({steps,reset});
 useEffect(()=>{
  if(active)progress.current=previous.current.reset!==reset?0:stepTourStops(progress.current,steps-previous.current.steps);
  previous.current={steps,reset};invalidate();
 },[steps,reset,invalidate,active]);
 useEffect(()=>{
  if(!request||lastRequest.current===request.serial||!active)return;
  progress.current=clampTour(request.progress);lastRequest.current=request.serial;invalidate();
 },[request,active,invalidate]);
 useEffect(()=>{
  const touches=new Map<number,number>();let lastY:number|null=null;
  const wheel=(event:WheelEvent)=>{if(!enabled.current)return;event.preventDefault();progress.current=wheelTourProgress(progress.current,event.deltaY,event.deltaMode,canvas.clientHeight);invalidate();};
  const down=(event:PointerEvent)=>{if(event.pointerType==="touch"){touches.set(event.pointerId,event.clientY);lastY=null;}};
  const move=(event:PointerEvent)=>{
   if(!touches.has(event.pointerId))return;touches.set(event.pointerId,event.clientY);
   if(touches.size!==2||!enabled.current)return;
   const y=[...touches.values()].reduce((a,b)=>a+b,0)/2;
   if(lastY!==null){progress.current=clampTour(progress.current+(lastY-y)/2500);invalidate();}lastY=y;
  };
  const up=(event:PointerEvent)=>{touches.delete(event.pointerId);lastY=null;};
  canvas.addEventListener("wheel",wheel,{passive:false});canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointermove",move);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  return()=>{canvas.removeEventListener("wheel",wheel);canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);};
 },[canvas,enabled,invalidate]);
 return progress;
}

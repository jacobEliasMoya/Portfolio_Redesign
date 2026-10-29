"use client";
import { useCallback, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { renderDpr } from "./render-budget.mjs";
/** Change resolution only after sustained samples; never remount scene geometry. */
export function AdaptiveQuality({reducedMotion=false,monitor=true}:{reducedMotion?:boolean;monitor?:boolean}){
 const size=useThree(s=>s.size),setDpr=useThree(s=>s.setDpr),currentDpr=useThree(s=>s.viewport.dpr);
 const factor=useRef(1),fallback=useRef(false);
 const apply=useCallback((next:number)=>{factor.current=next;setDpr(renderDpr(size.width,size.height,window.devicePixelRatio||1,next));},[size.width,size.height,setDpr]);
 useEffect(()=>{const target=renderDpr(size.width,size.height,window.devicePixelRatio||1,factor.current);if(Math.abs(currentDpr-target)>.001)apply(factor.current);},[apply,currentDpr,size.width,size.height]);
 return reducedMotion||!monitor?null:<PerformanceMonitor factor={1} step={.2} iterations={8} ms={250} bounds={()=>[42,57]} flipflops={6} onChange={api=>{if(!fallback.current)apply(api.factor);}} onFallback={()=>{fallback.current=true;apply(0);}}/>;
}

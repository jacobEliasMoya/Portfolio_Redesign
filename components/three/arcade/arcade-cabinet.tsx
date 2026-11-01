"use client";
import type {HudStore} from '../ufo/arcade-hud';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import fontData from '@/public/fonts/sabo-filled.typeface.json';
import {createArcadeCabinet,stepArcadeCabinet} from './create-arcade-cabinet.mjs';
import {arcadeLayout} from './arcade-layout.mjs';
const font=new FontLoader().parse(fontData);
export type ArcadeLayout=ReturnType<typeof arcadeLayout>;
export function ArcadeCabinet({layout,reducedMotion,store}:{layout:ArcadeLayout;reducedMotion:boolean;store:HudStore}){
 const model=useMemo(()=>createArcadeCabinet(layout,font),[layout]);
 const keys=useRef(new Set<string>()),selected=useRef('Digit1');const invalidate=useThree(s=>s.invalidate);
 useEffect(()=>()=>model.dispose(),[model]);
 useEffect(()=>{
  const key=(event:KeyboardEvent)=>{if(document.querySelector('dialog[open]'))return;if(['Digit1','Digit2','Digit3'].includes(event.code))selected.current=event.code;
   if(event.type==='keydown')keys.current.add(event.code);else keys.current.delete(event.code);
   if(event.code==='KeyF'){selected.current=store.getSnapshot().weapon==='bolts'?'Digit1':store.getSnapshot().weapon==='death-ray'?'Digit2':'Digit3';if(event.type==='keydown')keys.current.add(selected.current);else keys.current.delete(selected.current);}invalidate();};
  const clear=()=>{keys.current.clear();invalidate();};
  window.addEventListener('keydown',key);window.addEventListener('keyup',key);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  return()=>{window.removeEventListener('keydown',key);window.removeEventListener('keyup',key);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);};
 },[invalidate,store]);
 useFrame((_,delta)=>{if(stepArcadeCabinet(model,keys.current,delta,reducedMotion))invalidate();});
 return <primitive object={model.root} dispose={null}/>;
}

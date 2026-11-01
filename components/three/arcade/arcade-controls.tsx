"use client";
import {useEffect,useRef,useSyncExternalStore,type PointerEvent as ReactPointerEvent} from 'react';
import type {HudStore} from '../ufo/arcade-hud';
import type {ArcadeLayout} from './arcade-cabinet';
import {createArcadeInput} from './arcade-input.mjs';
import {joystickKeys} from './arcade-layout.mjs';
import {canRemoteDetonate} from '../ufo/hud-state.mjs';
const send=(code:string,down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code,key:code.startsWith('Digit')?code.slice(5):code.slice(3).toLowerCase(),bubbles:true,cancelable:true}));
/** Native controls over corresponding meshes retain touch, keyboard and focus access. */
export function ArcadeControls({layout,store,ready,piloting,onStart}:{layout:ArcadeLayout;store:HudStore;ready:boolean;piloting:boolean;onStart:()=>void}){
 const state=useSyncExternalStore(store.subscribe,store.getSnapshot,store.getSnapshot);
 const input=useRef(createArcadeInput(send,(callback:FrameRequestCallback)=>requestAnimationFrame(callback),(id:number)=>cancelAnimationFrame(id))),activePointer=useRef<number|null>(null);
 const playable=ready&&piloting&&state.mode==='flying'&&!state.singularityShipCaptured;
 const releaseStick=()=>{input.current.releaseStick();activePointer.current=null;};
 const releaseFire=()=>input.current.releaseFire();
 useEffect(()=>{
  const controller=input.current;
  const clear=()=>{controller.clear();activePointer.current=null;};
  const keyRelease=(event:KeyboardEvent)=>{if(event.code==='Enter'||event.code==='Space')controller.releaseFire();};
  const modal=()=>{if(document.querySelector('dialog[open]'))clear();};
  window.addEventListener('keyup',keyRelease);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);window.addEventListener('arcade-release',clear);document.addEventListener('focusin',modal);
  return()=>{clear();window.removeEventListener('keyup',keyRelease);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);window.removeEventListener('arcade-release',clear);document.removeEventListener('focusin',modal);};
 },[]);
 useEffect(()=>{if(!playable)window.dispatchEvent(new Event('arcade-release'));},[playable]);
 const point=(x:number,y:number,w=52,h=52)=>({left:x-w/2,top:y-h/2,width:w,height:h});
 const move=(event:ReactPointerEvent<HTMLButtonElement>)=>{const rect=event.currentTarget.getBoundingClientRect();input.current.steer(joystickKeys(event.clientX-rect.left-rect.width/2,event.clientY-rect.top-rect.height/2));};
 const fire=(slot:number)=>{
  releaseFire();if(!playable||!store.requestWeapon(`Digit${slot}`))return;
  store.publish({weapon:slot===1?'bolts':slot===2?'death-ray':'singularity'});
  send(`Digit${slot}`,true);send(`Digit${slot}`,false);
  input.current.queueFire();
 };
 return <div className="arcade-controls" aria-label="Arcade cabinet controls">
  <button className="arcade-control arcade-stick" style={point(layout.joystick.x,layout.joystick.y,80,78)} aria-label="Arcade joystick: drag to steer; use W A S D on keyboard" disabled={!playable}
   onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);activePointer.current=e.pointerId;move(e);}}
   onPointerMove={e=>{if(activePointer.current===e.pointerId)move(e);}} onPointerUp={releaseStick} onPointerCancel={releaseStick} onLostPointerCapture={releaseStick}
   onKeyUp={releaseStick} onBlur={releaseStick}/>
  <button className="arcade-control" style={point(layout.start.x,layout.start.y)} aria-label={piloting?'Exit arcade pilot':'Start arcade flight'} disabled={!ready||state.singularityShipCaptured} onClick={onStart}/>
  {layout.buttons.map((p,i)=><button key={i} className="arcade-control arcade-fire" data-slot={i+1} style={point(p.x,p.y,Math.max(44,Math.min(52,layout.width*.12)),52)} disabled={!playable||(i===2&&(state.score<=6767||(state.singularityUsed&&!canRemoteDetonate(state))))} aria-label={['Arcade bolts: hold to charge, release to fire','Arcade death ray: hold to fire','Arcade Singularity: fire or remote detonate'][i]}
   onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);fire(i+1);}} onPointerUp={releaseFire} onPointerCancel={releaseFire} onLostPointerCapture={releaseFire}
   onKeyDown={e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();fire(i+1);}}} onKeyUp={releaseFire} onBlur={releaseFire}/>) }
 </div>;
}

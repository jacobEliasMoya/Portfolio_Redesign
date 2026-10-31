"use client";
import {Component,createContext,useContext,useEffect,useId,useLayoutEffect,useMemo,useRef,useState,useSyncExternalStore,type ReactNode,type RefObject} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {FontLoader} from "three/addons/loaders/FontLoader.js";
import type {Scene} from "three";
import fontData from "@/public/fonts/sabo-filled.typeface.json";
import {hudTextAdvance} from "./hud-letter-geometry.mjs";
import {createHudLetterResources,createHudLetterModel,stepHudLetterModel} from "./hud-letter-model.mjs";
import {createGuideBoardState} from "./guide-board-state.mjs";
import {GuideBoard} from "./guide-board";
import {WEAPON_SLOTS,type WeaponId} from "./weapon-selection.mjs";
import {createHudWeaponModel,layoutHudWeaponModel,stepHudWeaponModel} from "./hud-weapon-model.mjs";
import {createWeaponNoticeModel,resetWeaponNoticeModel,updateWeaponNoticeModel,WEAPON_NOTICE_SECONDS} from "./weapon-notice-model.mjs";

type Label={id:string;text:string;x:number;y:number;width:number;height:number;fontSize:number;color:string;opacity:number};
type WeaponIcon={id:string;weapon:WeaponId;x:number;y:number;width:number;height:number};
type WeaponNotice=WeaponIcon&{fontSize:number;startedAt:number};
export function createHudLetteringStore(){
 let labels:Label[]=[],icons:WeaponIcon[]=[],ready=false;
 let notice:WeaponNotice|null=null;
 const listeners=new Set<()=>void>();
 const notify=()=>listeners.forEach(callback=>callback());
 return {
  guide:createGuideBoardState(),
  getSnapshot:()=>labels,getIcons:()=>icons,getNotice:()=>notice,getReady:()=>ready,
  subscribe(callback:()=>void){listeners.add(callback);return()=>{listeners.delete(callback);};},
  presented(value:boolean){if(ready===value)return;ready=value;notify();},
  update(label:Label){const existing=labels.find(item=>item.id===label.id);if(existing&&Object.keys(label).every(key=>existing[key as keyof Label]===label[key as keyof Label]))return;labels=[...labels.filter(item=>item.id!==label.id),label];notify();},
  remove(id:string){if(!labels.some(item=>item.id===id))return;labels=labels.filter(item=>item.id!==id);notify();},
  updateIcon(icon:WeaponIcon){const existing=icons.find(item=>item.id===icon.id);if(existing&&Object.keys(icon).every(key=>existing[key as keyof WeaponIcon]===icon[key as keyof WeaponIcon]))return;icons=[...icons.filter(item=>item.id!==icon.id),icon];notify();},
  removeIcon(id:string){if(!icons.some(item=>item.id===id))return;icons=icons.filter(item=>item.id!==id);notify();},
  updateNotice(next:WeaponNotice){if(notice&&Object.keys(next).every(key=>notice![key as keyof WeaponNotice]===next[key as keyof WeaponNotice]))return;notice=next;notify();},
  clearNotice(id:string){if(notice?.id!==id)return;notice=null;notify();},
 };
}
type LetteringStore=ReturnType<typeof createHudLetteringStore>;
function attachPresentation(scene:Scene,store:LetteringStore){
 const previous=scene.onAfterRender;
 scene.onAfterRender=()=>store.presented(true);
 return()=>{scene.onAfterRender=previous;store.presented(false);};
}
const LetteringContext=createContext<LetteringStore|null>(null);
const parsedFont=new FontLoader().parse(fontData as unknown as Parameters<FontLoader["parse"]>[0]);
export function HudLetteringProvider({store,children}:{store:LetteringStore;children:ReactNode}){return <LetteringContext.Provider value={store}>{children}</LetteringContext.Provider>;}
const neverReady=()=>false,subscribeNothing=()=>()=>{};
export function useHudGuideBoard(){
 const store=useContext(LetteringContext);
 const rendered=useSyncExternalStore(store?.subscribe??subscribeNothing,store?.getReady??neverReady,neverReady);
 return {board:store?.guide??null,rendered};
}

/** Accessible HTML reserves layout and button hit areas; visible letters are live meshes. */
export function HudLabel({text}:{text:string}){
 const store=useContext(LetteringContext),element=useRef<HTMLSpanElement>(null),id=useId();
 const ready=useSyncExternalStore(store?.subscribe??subscribeNothing,store?.getReady??neverReady,neverReady);
 useLayoutEffect(()=>{
  const span=element.current;if(!span||!store)return;
  let frame=0,stopped=false;
  const measure=()=>{
   if(stopped)return;
   const rect=span.getBoundingClientRect(),style=getComputedStyle(span);
   if(!rect.width||!text.trim()){store.remove(id);return;}
   let opacity=1;
   for(let node:HTMLElement|null=span;node;node=node.parentElement)opacity*=Number(getComputedStyle(node).opacity);
   store.update({id,text,x:rect.left,y:rect.top,width:rect.width,height:rect.height,fontSize:parseFloat(style.fontSize),color:style.color,opacity});
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  const owner=span.closest("button")??span;
  const resize=new ResizeObserver(schedule);resize.observe(span);if(owner.parentElement)resize.observe(owner.parentElement);
  const attributes=new MutationObserver(schedule);attributes.observe(owner,{attributes:true,attributeFilter:["aria-current","aria-pressed","disabled","class","style"]});
  for(const event of ["pointerenter","pointerleave","focus","blur"])owner.addEventListener(event,schedule);
  window.addEventListener("resize",schedule);window.addEventListener("scroll",schedule,true);document.fonts.ready.then(schedule);measure();
  return()=>{stopped=true;cancelAnimationFrame(frame);resize.disconnect();attributes.disconnect();window.removeEventListener("resize",schedule);window.removeEventListener("scroll",schedule,true);for(const event of ["pointerenter","pointerleave","focus","blur"])owner.removeEventListener(event,schedule);store.remove(id);};
 },[id,text,store]);
 return <span ref={element} style={{display:"inline-block",position:"relative",width:`${hudTextAdvance(parsedFont,text)}em`,height:"1em",lineHeight:1,whiteSpace:"pre",pointerEvents:"none"}}><span style={{opacity:ready?0:1}}>{text}</span></span>;
}

/** Native slot reserves space; the shared foreground renderer draws its volume. */
export function HudWeaponIcon({weapon}:{weapon:WeaponId}){
 const store=useContext(LetteringContext),element=useRef<HTMLSpanElement>(null),id=useId();
 const ready=useSyncExternalStore(store?.subscribe??subscribeNothing,store?.getReady??neverReady,neverReady);
 useLayoutEffect(()=>{
  const span=element.current;if(!span||!store)return;
  let frame=0;
  const measure=()=>{const rect=span.getBoundingClientRect();if(!rect.width||!rect.height){store.removeIcon(id);return;}store.updateIcon({id,weapon,x:rect.left,y:rect.top,width:rect.width,height:rect.height});};
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  const resize=new ResizeObserver(schedule);resize.observe(span);if(span.parentElement?.parentElement)resize.observe(span.parentElement.parentElement);
  window.addEventListener("resize",schedule);window.addEventListener("scroll",schedule,true);measure();
  return()=>{cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener("resize",schedule);window.removeEventListener("scroll",schedule,true);store.removeIcon(id);};
 },[id,store,weapon]);
 return <span ref={element} aria-hidden="true" style={{display:"grid",placeItems:"center",width:"100%",height:"100%",pointerEvents:"none"}}><span style={{opacity:ready?0:1,fontSize:12}}>{weapon==="bolts"?"BOLT":"RAY"}</span></span>;
}

function LiveWeaponIcon({icon,reducedMotion}:{icon:WeaponIcon;reducedMotion:boolean}){
 const {gl,size}=useThree();
 const model=useMemo(()=>createHudWeaponModel(icon.weapon),[icon.weapon]);
 const viewport=useMemo(()=>{const rect=gl.domElement.getBoundingClientRect();return {left:rect.left,top:rect.top,width:size.width,height:size.height};},[gl,size.width,size.height]);
 useEffect(()=>()=>model.dispose(),[model]);
 useFrame(state=>{layoutHudWeaponModel(model,icon,viewport);stepHudWeaponModel(model,state.clock.elapsedTime,reducedMotion);});
 return <primitive object={model.root} dispose={null}/>;
}
function LiveWeaponIcons({store,reducedMotion}:{store:LetteringStore;reducedMotion:boolean}){
 const icons=useSyncExternalStore(store.subscribe,store.getIcons,store.getIcons);
 return icons.map(icon=><LiveWeaponIcon key={icon.id} icon={icon} reducedMotion={reducedMotion}/>);
}

/** Keyed by the actual selected weapon: one short announcement per switch. */
export function HudWeaponNotice({weapon}:{weapon:WeaponId}){
 const store=useContext(LetteringContext),element=useRef<HTMLSpanElement>(null),id=useId(),[visible,setVisible]=useState(true);
 const ready=useSyncExternalStore(store?.subscribe??subscribeNothing,store?.getReady??neverReady,neverReady);
 const text=WEAPON_SLOTS.find(slot=>slot.id===weapon)!.label;
 useLayoutEffect(()=>{
  const span=element.current;if(!span)return;
  const startedAt=performance.now();let frame=0,expired=false;
  const measure=()=>{if(expired)return;const rect=span.getBoundingClientRect();store?.updateNotice({id,weapon,x:rect.left,y:rect.top,width:rect.width,height:rect.height,fontSize:parseFloat(getComputedStyle(span).fontSize),startedAt});};
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  const resize=new ResizeObserver(schedule);resize.observe(span);
  window.addEventListener("resize",schedule);window.addEventListener("scroll",schedule,true);measure();
  const timer=window.setTimeout(()=>{expired=true;setVisible(false);store?.clearNotice(id);},WEAPON_NOTICE_SECONDS*1000);
  return()=>{expired=true;window.clearTimeout(timer);cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener("resize",schedule);window.removeEventListener("scroll",schedule,true);store?.clearNotice(id);};
 },[id,store,weapon]);
 return <span ref={element} aria-hidden="true" style={{display:"block",width:`${hudTextAdvance(parsedFont,text)}em`,height:"1em",lineHeight:1}}><span style={{opacity:ready||!visible?0:1}}>{text}</span></span>;
}

function LiveWeaponNotice({store,reducedMotion}:{store:LetteringStore;reducedMotion:boolean}){
 const notice=useSyncExternalStore(store.subscribe,store.getNotice,store.getNotice),{gl,size,invalidate}=useThree();
 const models=useMemo(()=>({bolts:createWeaponNoticeModel(parsedFont,WEAPON_SLOTS[0].label),"death-ray":createWeaponNoticeModel(parsedFont,WEAPON_SLOTS[1].label,{color:"#ff6b54"})}),[]);
 const serial=useRef<number|null>(null);
 const viewport=useMemo(()=>{const rect=gl.domElement.getBoundingClientRect();return {left:rect.left,top:rect.top,width:size.width,height:size.height};},[gl,size.width,size.height]);
 useEffect(()=>()=>{models.bolts.dispose();models["death-ray"].dispose();},[models]);
 useFrame(()=>{
  updateWeaponNoticeModel(models.bolts,-1,reducedMotion);updateWeaponNoticeModel(models["death-ray"],-1,reducedMotion);if(!notice)return;
  const model=models[notice.weapon];
  if(serial.current!==notice.startedAt){resetWeaponNoticeModel(model);serial.current=notice.startedAt;}
  model.root.position.set(notice.x-viewport.left+notice.width/2-viewport.width/2,viewport.height/2-(notice.y-viewport.top+notice.height/2),0);
  model.root.scale.setScalar(notice.fontSize);
  const alive=updateWeaponNoticeModel(model,(performance.now()-notice.startedAt)/1000,reducedMotion);
  if(alive&&!reducedMotion)invalidate();
 });
 return <><primitive object={models.bolts.root} dispose={null}/><primitive object={models["death-ray"].root} dispose={null}/></>;
}

type Resources=ReturnType<typeof createHudLetterResources>;
type Pointer={x:number;y:number;active:boolean};
function LiveLabel({label,resources,pointer,reducedMotion}:{label:Label;resources:Resources;pointer:RefObject<Pointer>;reducedMotion:boolean}){
 const {size,gl}=useThree();
 const model=useMemo(()=>createHudLetterModel(resources,label.text,{fontSize:label.fontSize,color:label.color,opacity:label.opacity}),[resources,label.text,label.fontSize,label.color,label.opacity]);
 const origin=useMemo(()=>({x:label.x,y:label.y+label.height/2}),[label.x,label.y,label.height]);
 const rect=useMemo(()=>{const bounds=gl.domElement.getBoundingClientRect();return {left:bounds.left,top:bounds.top,width:size.width,height:size.height};},[gl,size.width,size.height]);
 useFrame((state,delta)=>{
  model.position.set(label.x-rect.left-size.width/2,size.height/2-(label.y-rect.top+label.height/2),0);
  stepHudLetterModel(model,{elapsed:state.clock.elapsedTime,delta,pointer:pointer.current,origin,reducedMotion});
 });
 return <primitive object={model} dispose={null}/>;
}

function LiveLetterScene({store,reducedMotion}:{store:LetteringStore;reducedMotion:boolean}){
 const labels=useSyncExternalStore(store.subscribe,store.getSnapshot,store.getSnapshot);
 const {gl,scene,invalidate}=useThree(),pointer=useRef<Pointer>({x:0,y:0,active:false});
 const resources=useMemo(()=>createHudLetterResources(parsedFont),[]);
 useEffect(()=>()=>resources.dispose(),[resources]);
 useEffect(()=>{
  const move=(event:PointerEvent)=>{pointer.current.x=event.clientX;pointer.current.y=event.clientY;pointer.current.active=event.pointerType!=="touch"&&!document.querySelector("dialog[open]");invalidate();};
  const leave=()=>{pointer.current.active=false;invalidate();};
  const canvas=gl.domElement,lost=()=>store.presented(false);
  const restore=()=>invalidate();
  const detach=attachPresentation(scene,store);
  window.addEventListener("pointermove",move,{passive:true});window.addEventListener("blur",leave);document.documentElement.addEventListener("pointerleave",leave);
  canvas.addEventListener("webglcontextlost",lost);canvas.addEventListener("webglcontextrestored",restore);
  return()=>{window.removeEventListener("pointermove",move);window.removeEventListener("blur",leave);document.documentElement.removeEventListener("pointerleave",leave);canvas.removeEventListener("webglcontextlost",lost);canvas.removeEventListener("webglcontextrestored",restore);detach();};
 },[gl,scene,store,invalidate]);
 useFrame(()=>{if(document.querySelector("dialog[open]"))pointer.current.active=false;if(!reducedMotion)invalidate();});
 return <><ambientLight intensity={1.1}/><directionalLight position={[-200,300,400]} intensity={2.4}/><directionalLight position={[200,-100,100]} intensity={.6}/>{labels.map(label=><LiveLabel key={label.id} label={label} resources={resources} pointer={pointer} reducedMotion={reducedMotion}/>)}<LiveWeaponIcons store={store} reducedMotion={reducedMotion}/><LiveWeaponNotice store={store} reducedMotion={reducedMotion}/><GuideBoard board={store.guide}/></>;
}

class LetteringBoundary extends Component<{store:LetteringStore;children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.store.presented(false);}
 render(){return this.state.failed?null:this.props.children;}
}

/** Dedicated transparent foreground scene: real lit meshes at crisp resolution,
 * independent of the heavy world's adaptive DPR. No glyph images or readbacks. */
export function HudLetteringLayer({store,reducedMotion=false}:{store:LetteringStore;reducedMotion?:boolean}){
 return <LetteringBoundary store={store}><div aria-hidden="true" style={{position:"absolute",inset:0,zIndex:4,pointerEvents:"none"}}><Canvas orthographic camera={{position:[0,0,500],near:.1,far:1000,zoom:1}} dpr={[1.5,2]} frameloop="demand" gl={{alpha:true,antialias:true}} style={{pointerEvents:"none"}} fallback={null}><LiveLetterScene store={store} reducedMotion={reducedMotion}/></Canvas></div></LetteringBoundary>;
}

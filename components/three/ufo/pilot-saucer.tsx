"use client";
import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Group, Quaternion, Vector3 } from "three";
import {canLand,landingPose,landingEase,LANDING_DURATION} from "./lunar-landing.mjs";
import {PARKED_COMPRESSION} from "./landing-suspension.mjs";
import { blendLaunchAttitude, launchProgress } from "./lunar-launch.mjs";
import { CrashEffects, type CrashEvent } from "./crash-effects";
import { resolveSaucerContact, samplePlanetContacts } from "./saucer-crash.mjs";
import { SaucerProjectiles } from "./saucer-projectiles";
import { UFOModel,type UFOType } from "./ufo-model";
import { getFlightInput } from "./flight-controls.mjs";
import { createWeaponCharge } from "./weapon-charge.mjs";
import {createWeaponSelection,weaponForKey,type WeaponShot} from "./weapon-selection.mjs";
import { createFlight, setFlightAttitude,stepFlight } from "./saucer-flight.mjs";
import {RimPlasma} from "./rim-plasma";
import type {HudStore} from "./arcade-hud";
import {IDLE_RIM_DRIVE} from "./rim-plasma.mjs";

export function PilotSaucer({hudStore,actionRequest=0,type="hexagonal",launchCameraReady,onLandingStatus,trackPositionRef,trackHeadingRef,trackUpRef,active=false,visible=true,reducedMotion=false,center=[0,0,0],earthRadius=0,scale=.3}:{hudStore?:HudStore;actionRequest?:number;onLandingStatus?:(status:string)=>void;launchCameraReady?:RefObject<boolean>;type?:UFOType;trackPositionRef?:RefObject<Vector3>;trackHeadingRef?:RefObject<Vector3>;trackUpRef?:RefObject<Vector3>;active?:boolean;visible?:boolean;reducedMotion?:boolean;center?:[number,number,number];earthRadius?:number;scale?:number}) {
 const group=useRef<Group>(null),state=useRef(createFlight()),keys=useRef(new Set<string>());
 const rimDrive=useRef<ReturnType<typeof getFlightInput>>(IDLE_RIM_DRIVE);
 const reset=useRef(true),gearRef=useRef(1),engineRef=useRef(0),suspensionRef=useRef(PARKED_COMPRESSION),mode=useRef("docked"),launchAge=useRef(0);
 const handoff=useRef({age:2,from:new Quaternion(),target:new Quaternion(),cosmetic:new Quaternion(),euler:new Euler(0,0,0,"YXZ")});
 const landing=useRef({requested:false,age:0,start:new Vector3(),rotation:new Quaternion(),status:""});
 const dock=useRef({point:new Vector3(),last:new Vector3(),velocity:new Vector3(),normal:new Vector3(),heading:new Vector3(),rotation:new Quaternion(),seen:false});
 const shotsRef=useRef<WeaponShot[]>([]),charge=useRef(createWeaponCharge()),weapons=useRef(createWeaponSelection());
 const crash=useRef<CrashEvent>({serial:0,kind:"bounce",age:10,point:new Vector3(),normal:new Vector3(0,1,0),velocity:new Vector3()}),crashed=useRef(false);
 const canvas=useThree(s=>s.gl.domElement),invalidate=useThree(s=>s.invalidate);
 const cx=center[0],cy=center[1],cz=center[2];
 const previousRequest=useRef(actionRequest),hudSnapshot=useRef({mode:"docked",charge:0,canLand:false,weapon:"bolts"});
 useEffect(()=>{if(previousRequest.current!==actionRequest&&active){landing.current.requested=true;invalidate();}previousRequest.current=actionRequest;},[actionRequest,active,invalidate]);
 useFrame(()=>{
  if(!hudStore)return;
  const snapshot=hudSnapshot.current;
  snapshot.mode=mode.current;snapshot.charge=active?Math.floor(charge.current.level(performance.now())*12):0;snapshot.canLand=!!group.current?.userData.landingEligible;
  snapshot.weapon=weapons.current.selected;
  hudStore.publish(snapshot);
 });

 useEffect(()=>{reset.current=true;invalidate();},[cx,cy,cz,earthRadius,invalidate]);
 useEffect(()=>{
  if(!active)return;
  const previousTabIndex=canvas.getAttribute("tabindex");canvas.setAttribute("tabindex","0");canvas.focus({preventScroll:true});
  const detachWeaponRequests=hudStore?.subscribeWeaponRequest((code:string)=>{
   if(!visible||document.hidden||document.querySelector("dialog[open]"))return;
   weapons.current.select(code,charge.current,shotsRef.current);canvas.focus({preventScroll:true});invalidate();
  });
  const supported=new Set(["KeyL","KeyF","KeyQ","KeyE","KeyC","KeyW","KeyS","KeyA","KeyD","Space","ShiftLeft","ShiftRight","KeyR","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"]);
  const clear=()=>{keys.current.clear();landing.current.requested=false;shotsRef.current=[];weapons.current.cancel(charge.current);invalidate();};
  const key=(e:KeyboardEvent)=>{
   const weaponKey=weaponForKey(e.code);
   if(!supported.has(e.code)&&!weaponKey)return;
   if(document.querySelector("dialog[open]")){clear();return;}
   // Always release held keys, even if focus moved to a menu or text field.
   if(e.type==="keyup"){keys.current.delete(e.code);if(e.code==="KeyF"){const shot=weapons.current.release("key",performance.now(),charge.current);if(shot&&shotsRef.current.length<24)shotsRef.current.push(shot);}invalidate();return;}
   const target=e.target instanceof HTMLElement?e.target:null;
   if(target&&(target.closest("input,textarea,select,dialog")||target.isContentEditable))return;
   if(weaponKey){
    if(e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
    e.preventDefault();weapons.current.select(e.code,charge.current,shotsRef.current);invalidate();return;
   }
   // Space still activates a focused menu button; arrows and flight keys remain available.
   if(e.code==="Space"&&target?.closest("button,a"))return;
   e.preventDefault();
   keys.current.add(e.code);
   if(e.code==="KeyL"&&!e.repeat)landing.current.requested=true;
   if(e.code==="KeyF"&&!e.repeat)weapons.current.begin("key",performance.now(),charge.current);
   if(e.code==="KeyR"){crashed.current=false;reset.current=true;shotsRef.current=[];weapons.current.cancel(charge.current);}
   invalidate();
  };
  const down=(e:PointerEvent)=>{if(e.button===0&&e.pointerType!=="touch"){canvas.focus({preventScroll:true});weapons.current.begin("pointer",performance.now(),charge.current);invalidate();}};
  const up=(e:PointerEvent)=>{if(e.button!==0)return;const shot=weapons.current.release("pointer",performance.now(),charge.current);if(shot&&shotsRef.current.length<24)shotsRef.current.push(shot);invalidate();};
  const hidden=()=>{if(document.hidden)clear();};
  const modalFocus=(event:FocusEvent)=>{if(event.target instanceof HTMLElement&&event.target.closest("dialog[open]"))clear();};
  document.addEventListener("focusin",modalFocus);
  window.addEventListener("keydown",key,{capture:true});window.addEventListener("keyup",key);window.addEventListener("blur",clear);document.addEventListener("visibilitychange",hidden);
  canvas.addEventListener("pointerdown",down);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",clear);
  return()=>{detachWeaponRequests?.();clear();if(previousTabIndex===null)canvas.removeAttribute("tabindex");else canvas.setAttribute("tabindex",previousTabIndex);window.removeEventListener("keydown",key,{capture:true});window.removeEventListener("keyup",key);window.removeEventListener("blur",clear);document.removeEventListener("visibilitychange",hidden);document.removeEventListener("focusin",modalFocus);canvas.removeEventListener("pointerdown",down);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",clear);};
 },[active,visible,canvas,invalidate,hudStore]);
 useFrame((scene,delta)=>{
  rimDrive.current=IDLE_RIM_DRIVE;
  const s=state.current;
  crash.current.age+=Math.min(delta,.05);
  if(!active&&crashed.current){crashed.current=false;reset.current=true;}
  if(crashed.current){shotsRef.current=[];weapons.current.cancel(charge.current);keys.current.clear();if(crash.current.age>=2){crashed.current=false;reset.current=true;}else {scene.invalidate();return;}}
  if(reset.current){handoff.current.age=2;mode.current="docked";launchAge.current=0;s.position.set(cx+earthRadius*.8,cy+earthRadius*.65+1,cz+earthRadius+2);s.velocity.set(0,0,0);setFlightAttitude(s,handoff.current.target.setFromEuler(handoff.current.euler.set(0,Math.PI,0,"YXZ")));s.bank=0;s.lean=0;crashed.current=false;reset.current=false;}
  const pad=earthRadius>0?scene.scene.getObjectByName("lunar-launch-pad"):null;
  const available=pad&&pad.userData.launchAvailable!==false;
  const d=dock.current,dt=Math.min(delta,.1);
  const status=mode.current==="landing"?"LANDING":mode.current==="landed"?"PARKED · L TO LAUNCH":mode.current==="flying"&&available?(canLand(s.position,d.point,d.normal)?"PAD IN RANGE · L TO LAND":"APPROACH PAD FROM ABOVE · L TO LAND"):"";
  if(landing.current.status!==status){landing.current.status=status;onLandingStatus?.(status);}
  if(group.current)group.current.userData.landingEligible=false;
  if(available){
   pad.updateWorldMatrix(true,false);pad.getWorldPosition(d.point);pad.getWorldQuaternion(d.rotation);
   d.velocity.copy(d.point).sub(d.last).divideScalar(Math.max(dt,.001));if(!d.seen)d.velocity.set(0,0,0);d.last.copy(d.point);d.seen=true;
   d.normal.set(0,1,0).applyQuaternion(d.rotation);d.heading.set(0,0,1).applyQuaternion(d.rotation);
   if(group.current)group.current.userData.landingEligible=active&&(mode.current==="landing"||(mode.current==="flying"&&canLand(s.position,d.point,d.normal)));
   if(landing.current.requested){
    landing.current.requested=false;
    if(active&&mode.current==="landed"){mode.current="docked";launchAge.current=0;}
    else if(active&&mode.current==="flying"&&canLand(s.position,d.point,d.normal)){
     mode.current="landing";landing.current.age=0;landing.current.start.copy(s.position);if(group.current)landing.current.rotation.copy(group.current.quaternion);
    }
   }
   if(!active){mode.current="docked";launchAge.current=0;}
   if(mode.current==="landing"){
    const sequence=landing.current;sequence.age=reducedMotion?LANDING_DURATION:sequence.age+dt;
    const progress=landingPose(sequence.start,d.point,d.normal,1.1275*scale+.045*pad.matrixWorld.getMaxScaleOnAxis(),sequence.age,s.position,scale);
    gearRef.current=progress.gear;suspensionRef.current=progress.compression;engineRef.current=progress.power;s.velocity.copy(d.velocity);shotsRef.current=[];weapons.current.cancel(charge.current);
    if(group.current){group.current.userData.launching=false;group.current.position.copy(s.position);group.current.quaternion.copy(sequence.rotation).slerp(d.rotation,landingEase(sequence.age/1.9));}
    trackPositionRef?.current.copy(s.position);trackHeadingRef?.current.copy(d.heading);
    if(group.current)trackUpRef?.current.set(0,1,0).applyQuaternion(group.current.quaternion);
    if(progress.done){mode.current="landed";launchAge.current=0;keys.current.clear();}
    scene.invalidate();return;
   }
   if(mode.current!=="flying"){
    const departing=active&&mode.current!=="landed";
    const cameraSettled=!launchCameraReady||launchCameraReady.current;
    if(departing&&cameraSettled){mode.current="launching";launchAge.current+=dt;}
    const progress=departing&&cameraSettled?launchProgress(launchAge.current,reducedMotion):{lift:0,gear:1,compression:PARKED_COMPRESSION,done:false};gearRef.current=progress.gear;suspensionRef.current=progress.compression;engineRef.current=departing&&cameraSettled?Math.min(1,launchAge.current/.7):0;
    s.position.copy(d.point).addScaledVector(d.normal,1.1275*scale+.045*pad.matrixWorld.getMaxScaleOnAxis()+progress.lift-progress.compression*scale);s.velocity.copy(d.velocity);s.bank=0;s.lean=0;setFlightAttitude(s,d.rotation);
    if(group.current){group.current.userData.launching=mode.current==="launching";group.current.userData.launchAge=launchAge.current;group.current.visible=visible;group.current.position.copy(s.position);group.current.quaternion.copy(d.rotation);}
    trackPositionRef?.current.copy(s.position);trackHeadingRef?.current.copy(d.heading);
    if(group.current)trackUpRef?.current.set(0,1,0).applyQuaternion(group.current.quaternion);
    shotsRef.current=[];weapons.current.cancel(charge.current);
    if(progress.done){handoff.current.age=0;handoff.current.from.copy(d.rotation);mode.current="flying";setFlightAttitude(s,d.rotation);}
    scene.invalidate();return;
   }
  }else if(earthRadius>0){mode.current="flying";}
  landing.current.requested=false;
  gearRef.current=active?0:1;suspensionRef.current=0;engineRef.current=active?1:0;
  const input=getFlightInput(keys.current,active);if(active)rimDrive.current=input;
  stepFlight(s,input,delta,{center:[cx,cy,cz],inner:0,outer:earthRadius?earthRadius*5.51:20});
  if(active)for(const surface of samplePlanetContacts(scene.scene,s.position,scale*2.3,scene.clock.elapsedTime)){
   const incoming=s.velocity.clone(),impact=resolveSaucerContact(s,surface.point,surface.normal,scale*2.3,surface.velocity);
   if(impact&&impact.speed>.3&&crash.current.age>.45){
    crash.current.serial++;crash.current.kind=impact.kind==="crash"?"crash":"bounce";crash.current.age=0;crash.current.point.copy(surface.point);crash.current.normal.copy(surface.normal);crash.current.velocity.copy(incoming);
    if(impact.kind==="crash"){crashed.current=true;s.velocity.set(0,0,0);shotsRef.current=[];weapons.current.cancel(charge.current);break;}
   }
  }
  if(group.current){
   group.current.userData.launching=false;group.current.visible=visible&&!crashed.current;group.current.position.copy(s.position);
   const transition=handoff.current;transition.age+=dt;transition.cosmetic.setFromEuler(transition.euler.set(s.lean,0,s.bank,"YXZ"));transition.target.copy(s.orientation).multiply(transition.cosmetic);
   blendLaunchAttitude(transition.from,transition.target,transition.age,group.current.quaternion,reducedMotion);
  }
  trackPositionRef?.current.copy(s.position);
  trackHeadingRef?.current.set(0,0,1).applyQuaternion(s.orientation);
  if(group.current)trackUpRef?.current.set(0,1,0).applyQuaternion(group.current.quaternion);
  if(active||s.velocity.lengthSq()>.00001)scene.invalidate();
 },-1);
 return <><group name="piloted-saucer" ref={group} visible={visible}><UFOModel type={type} gearRef={gearRef} engineRef={engineRef} suspensionRef={suspensionRef} scale={scale} hover={!active&&earthRadius===0} reducedMotion={reducedMotion}/>
 {type==="v3"&&<group scale={scale}><RimPlasma drive={rimDrive} flight={state} ship={group} reducedMotion={reducedMotion}/></group>}
 </group>
 <CrashEffects ship={group} eventRef={crash} reducedMotion={reducedMotion}/>
 <SaucerProjectiles ship={group} shotsRef={shotsRef} charge={charge} weapons={weapons} reducedMotion={reducedMotion} flight={state} active={active} visible={visible} scale={scale}/>
 </>;
}

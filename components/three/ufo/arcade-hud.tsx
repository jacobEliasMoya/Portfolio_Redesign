"use client";
import {useEffect,useState,useSyncExternalStore} from "react";
import {TOUR_STOPS} from "../animation/scroll-tour.mjs";
import {actionForMode,createHudState,stepActionText} from "./hud-state.mjs";
import {HudLabel,HudWeaponIcon,HudWeaponNotice} from "./hud-lettering";
import {WEAPON_SLOTS} from "./weapon-selection.mjs";
import {GuideOverlay} from "./guide-overlay";
import Image from "next/image";
import {saboFilled} from "@/app/fonts";
import styles from "./arcade-hud.module.css";
export type HudStore=ReturnType<typeof createHudState>;
function ShipIcon({parked=false}:{parked?:boolean}){return <Image className={styles.ship} src={`/images/hud/${parked?"saucer-parked":"saucer-flight"}.png`} alt="" aria-hidden="true" width={512} height={320} sizes="60px" priority/>;}
function ActionText({target,reducedMotion}:{target:string;reducedMotion:boolean}){
 const [state,setState]=useState({text:target,target,erasing:false});
 useEffect(()=>{
  if(reducedMotion||(state.target===target&&!state.erasing&&state.text===target))return;
  const timer=window.setTimeout(()=>setState(previous=>stepActionText(previous,target)),state.target!==target?70:state.erasing?65:100);
  return()=>window.clearTimeout(timer);
 },[state,target,reducedMotion]);
 return <span aria-hidden="true" className={styles.actionWord}><HudLabel text={reducedMotion?target:state.text}/><span className={styles.cursor}/></span>;
}
function WeaponBar({store,state,ready}:{store:HudStore;state:ReturnType<HudStore["getSnapshot"]>;ready:boolean}){
 const selected=WEAPON_SLOTS.find(slot=>slot.id===state.weapon)??WEAPON_SLOTS[0];
 return <section className={styles.weaponBar} data-weapon={state.weapon} aria-label="Weapons">
  <div className={styles.weaponName} role="status" aria-label="Selected weapon"><span className="sr-only">{selected.label}</span><HudWeaponNotice key={state.weapon} weapon={selected.id!}/></div>
  <div className={styles.weaponSlots} role="group" aria-label="Weapon slots">
   {WEAPON_SLOTS.map(slot=><button key={slot.number} className={styles.weaponSlot} data-weapon={slot.id??"reserved"} disabled={!ready||!slot.id} aria-pressed={slot.id?slot.id===state.weapon:undefined} aria-keyshortcuts={slot.id?String(slot.number):undefined} aria-label={`Slot ${slot.number}: ${slot.label}${slot.id===state.weapon?", selected":""}`} title={slot.id?`${slot.number} · ${slot.label}`:"Reserved for a future weapon"} onClick={()=>store.requestWeapon(`Digit${slot.number}`)}>
    <kbd className={styles.slotKey} aria-hidden="true"><HudLabel text={String(slot.number)}/></kbd>
    <span className={styles.weaponIcon}>{slot.id?<HudWeaponIcon weapon={slot.id}/>:<span className={styles.slotEmpty} aria-hidden="true">+</span>}</span>
    {slot.id==="bolts"&&<span className={styles.slotCharge} aria-hidden="true">{Array.from({length:12},(_,index)=><i key={index} data-lit={index<state.charge}/>)}</span>}
   </button>)}
  </div>
  {state.weapon==="bolts"&&state.charge>0&&<span className="sr-only" role="meter" aria-label="Weapon charge" aria-valuemin={0} aria-valuemax={12} aria-valuenow={state.charge}/>}
 </section>;
}
export function ArcadeHud({store,ready,piloting,reducedMotion,onPilot,onAction,onReset,onTour}:{store:HudStore;ready:boolean;piloting:boolean;reducedMotion:boolean;onPilot:()=>void;onAction:()=>void;onReset:()=>void;onTour:(progress:number)=>void}){
 const state=useSyncExternalStore(store.subscribe,store.getSnapshot,store.getSnapshot);
 const action=actionForMode(state.mode),busy=piloting&&["launching","landing","docked"].includes(state.mode);
 const actionDisabled=!ready||busy||(piloting&&state.mode==="flying"&&!state.canLand);
 const status=!ready?"PREPARING":!piloting?(state.mode==="flying"?"EXPLORING":"PARKED"):state.mode==="landing"?"LANDING":["launching","docked"].includes(state.mode)?"LAUNCHING":state.mode==="landed"?"PARKED":"IN FLIGHT";
 return <div className={`${styles.hud} ${saboFilled.className}`} data-piloting={piloting} style={{fontFamily:saboFilled.style.fontFamily}} aria-label="Space explorer controls">
  <header className={styles.top}>
   <h1 className={styles.brand}><HudLabel text="JAKE’S SPACE"/></h1>
   <nav className={styles.destinations} aria-label="Tour destinations" title={piloting?"Exit pilot mode to select a destination":undefined}>
    {TOUR_STOPS.map((stop,index)=><button key={stop.key} disabled={!ready||piloting} aria-label={`Visit ${stop.label}`} aria-current={!piloting&&state.tourIndex===index?"step":undefined} onClick={()=>onTour(stop.progress)}><HudLabel text={stop.key==="overview"?"HOME":stop.key==="california"?"EARTH":stop.label.toUpperCase()}/></button>)}
   </nav>
  </header>
  <div className={styles.bottom}>
   <section className={styles.pilot} aria-label="Ship controls">
    <div className={styles.shipStatus}><ShipIcon parked={!piloting||state.mode==="landed"||state.mode==="docked"}/><span role="status"><HudLabel text={status}/></span></div>
    <div className={styles.actions}>
     <button className={styles.launch} disabled={actionDisabled} onClick={onAction} aria-label={`${action==="LAND"?"Land on lunar pad":"Launch saucer"}${action==="LAND"&&!state.canLand?" — approach pad from above":""}`} title={action==="LAND"&&!state.canLand?"Approach the lunar pad from above, within 5 units":undefined}><kbd className={styles.launchKey} aria-hidden="true"><HudLabel text="L"/></kbd><ActionText target={action} reducedMotion={reducedMotion}/></button>
     {piloting&&<button className={styles.exit} onClick={onPilot}><HudLabel text="EXIT PILOT"/></button>}
    </div>
   </section>
   {piloting&&<WeaponBar store={store} state={state} ready={ready}/>}
   <GuideOverlay ready={ready} reducedMotion={reducedMotion} onReset={onReset}/>
  </div>

 </div>;
}

"use client";
import {useId,useState} from "react";
import {PLANET_HITS} from "../planet/planet-explosion.mjs";
import styles from "./pilot-menu.module.css";
const controls=[
 ["W / S","THRUST / REVERSE"],["A / D","TURN LEFT / RIGHT"],["Q / E","ROLL LEFT / RIGHT"],
 ["LEFT / RIGHT","TURN"],["UP / DOWN","PITCH"],["SPACE / C","RISE / DESCEND RELATIVE TO SHIP"],
 ["LEFT CLICK","HOLD TO CHARGE / RELEASE TO FIRE"],["SHIFT","BRAKE"],["F","HOLD TO CHARGE / RELEASE TO FIRE"],["R","RESET SAUCER"],["L","LAND / LAUNCH AT LUNAR PAD"],
];
export function PilotMenu({active,ready=true,onToggle,flightStatus=""}:{flightStatus?:string;active:boolean;ready?:boolean;onToggle:()=>void}){
 const [manual,setManual]=useState(false),id=useId();
 return <section className={styles.menu} aria-label="Saucer flight menu">
  <p className={styles.status}>{!ready?"SYSTEM BOOTING":active?"PILOT ONLINE":"FREE EXPLORATION"}</p>
  <h2 className={styles.title}>FLIGHT DECK</h2>
  <div className={styles.actions}>
   <button disabled={!ready} aria-pressed={active} onClick={onToggle}><span aria-hidden="true">&gt; </span>{!ready?"PREPARING FLIGHT":active?"EXIT PILOT MODE":"LAUNCH SAUCER"}</button>
   <button aria-expanded={manual} aria-controls={id} onClick={()=>setManual(v=>!v)}><span aria-hidden="true">&gt; </span>{manual?"CLOSE FLIGHT MANUAL":"FLIGHT MANUAL"}</button>
  </div>
  {active&&flightStatus&&<p className={styles.hint} role="status">{flightStatus}</p>}
  {active&&!manual&&<p className={styles.hint}>WASD TO FLY. HOLD CLICK OR F TO CHARGE. RELEASE TO FIRE.</p>}
  {manual&&<div id={id} className={styles.manual}>
   <p className={styles.caption}>CONTROLS FOLLOW YOUR SHIP’S ORIENTATION</p>
   <dl>{controls.map(([key,action])=><div key={key}><dt>{key}</dt><dd>{action}</dd></div>)}</dl>
   <p className={styles.note}>LAND WITHIN 5 UNITS, ABOVE THE PAD.<br/>LUNAR PAD: AUTO LIFT, THEN GEAR RETRACTS.<br/>RELEASE THRUST TO COAST.<br/>HARD CRASHES RESPAWN YOUR SAUCER.<br/>FULL CHARGE: 20 DAMAGE.<br/>EARTH DURABILITY: {PLANET_HITS.earth}. MOON: {PLANET_HITS.moon}.<br/>ARROW KEYS ALSO TURN AND PITCH.<br/>RELOAD TO RESTORE IMPACT DAMAGE.</p>
  </div>}
 </section>;
}

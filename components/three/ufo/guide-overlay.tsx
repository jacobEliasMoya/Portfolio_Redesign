"use client";
import {Fragment,useEffect,useLayoutEffect,useRef,useState,useSyncExternalStore} from "react";
import {HudLabel,useHudGuideBoard} from "./hud-lettering";
import {createGuideBoardState} from "./guide-board-state.mjs";
import styles from "./arcade-hud.module.css";

const movementControls=[
 {keys:["W","S"],description:"Thrust / reverse"},
 {keys:["A","D"],description:"Turn"},
 {keys:["Q","E"],description:"Roll"},
 {keys:["↑","↓"],description:"Pitch"},
 {keys:["SPACE","C"],description:"Ship-relative rise / descend"},
 {keys:["SHIFT"],description:"Brake; precision aiming with arrow keys"},
];
const weapons=[
 {key:"1",name:"Charged bolts",action:"charge",description:"Release to fire."},
 {key:"2",name:"Red death ray",action:"fire",description:"No charge; release to stop."},
 {key:"3",name:"Reserved",action:null,description:"For a future weapon."},
];

function GuideKeys({keys,inline=false}:{keys:string[];inline?:boolean}){
 return <span className={`${styles.guideKeys}${inline?` ${styles.guideInlineKeys}`:""}`}>{keys.map((key,index)=><Fragment key={key}>
  {index>0&&<span className={styles.guideKeySeparator} aria-hidden="true">/</span>}
  <kbd className={styles.guideKey}>{key==="↑"||key==="↓"?<>
   <span className="sr-only">{key==="↑"?"Up arrow":"Down arrow"}</span>
   <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path transform={key==="↓"?"rotate(180 6 6)":undefined} d="M4 0H8V2H10V4H12V6H8V12H4V6H0V4H2V2H4Z" fill="currentColor"/></svg>
  </>:key}</kbd>
 </Fragment>)}</span>;
}

export function GuideOverlay({ready,reducedMotion,onReset}:{ready:boolean;reducedMotion:boolean;onReset:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),panel=useRef<HTMLElement>(null),closeButton=useRef<HTMLButtonElement>(null);
 const {board:sharedBoard,rendered}=useHudGuideBoard(),[localBoard]=useState(createGuideBoardState),board=sharedBoard??localBoard;
 const phase=useSyncExternalStore(board.subscribe,board.getSnapshot,board.getSnapshot),[mounted,setMounted]=useState(false);
 const readable=phase==="open";
 const measure=()=>{const rect=panel.current?.getBoundingClientRect();if(rect)board.setLayout({x:rect.left+rect.width/2,y:rect.top+rect.height/2,width:rect.width,height:rect.height});};
 const open=()=>{dialog.current?.showModal();measure();setMounted(true);board.open(reducedMotion||!rendered);};
 const close=()=>board.close(reducedMotion||!rendered);
 useLayoutEffect(()=>{if(phase==="closed")dialog.current?.close();if(readable)closeButton.current?.focus({preventScroll:true});},[phase,readable]);
 useEffect(()=>{
  if(!mounted)return;
  let frame=0,last=performance.now();
  const tick=(now:number)=>{board.tick((now-last)/1000,reducedMotion||!rendered);last=now;if(["opening","closing"].includes(board.getSnapshot()))frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[mounted,board,phase,reducedMotion,rendered]);
 useEffect(()=>{
  if(!mounted||!panel.current)return;
  const update=()=>{const rect=panel.current?.getBoundingClientRect();if(rect)board.setLayout({x:rect.left+rect.width/2,y:rect.top+rect.height/2,width:rect.width,height:rect.height});};
  const resize=new ResizeObserver(update);resize.observe(panel.current);window.addEventListener("resize",update);update();
  return()=>{resize.disconnect();window.removeEventListener("resize",update);};
 },[mounted,board]);
 return <>
  <button className={styles.guideLink} onClick={open} aria-haspopup="dialog"><span className={styles.question} aria-hidden="true">?</span> <HudLabel text="GUIDE"/></button>
  <dialog className={styles.guide} ref={dialog} aria-label="Explorer guide" aria-busy={!readable} data-phase={phase} data-board-rendered={rendered} data-reduced={reducedMotion} onCancel={event=>{event.preventDefault();close();}} onClose={()=>{setMounted(false);board.close(true);}} onPointerDown={event=>{if(event.target===event.currentTarget)close();}}>
   <section ref={panel} className={styles.guidePaper} inert={!readable} aria-hidden={!readable}>
    <div className={styles.guideHeading}><h2>EXPLORER GUIDE</h2><button ref={closeButton} onClick={close} aria-label="Close guide">CLOSE ×</button></div>
    <div className={styles.guideText}>
     <div className={styles.guideIntro}>
      <p><strong>LAUNCH</strong> enters ship control.</p>
      <p><strong>EXIT PILOT</strong> returns to the tour and parks the ship.</p>
     </div>
     <div className={styles.guideColumns}>
      <section className={styles.guideSection} aria-label="Movement">
       <h3>MOVEMENT</h3>
       <dl className={styles.guideControlList}>{movementControls.map(({keys,description})=><div key={keys[0]}><dt><GuideKeys keys={keys}/></dt><dd>{description}</dd></div>)}</dl>
      </section>
      <section className={styles.guideSection} aria-label="Weapons">
       <h3>WEAPONS</h3>
       <dl className={styles.guideWeaponList}>{weapons.map(({key,name,action,description})=><div key={key}><dt><GuideKeys keys={[key]}/></dt><dd><strong>{name}</strong><p>{action&&<>Hold click or <GuideKeys keys={["F"]} inline/> to {action}. </>}{description}</p></dd></div>)}</dl>
      </section>
     </div>
     <section className={styles.guideSection} aria-label="Ship and landing">
       <h3>SHIP &amp; LANDING</h3>
       <dl className={styles.guideControlList}>
        <div><dt><GuideKeys keys={["L"]}/></dt><dd>Launch / land when the lunar pad is in range</dd></div>
        <div><dt><GuideKeys keys={["R"]}/></dt><dd>Reset saucer</dd></div>
       </dl>
       <p className={styles.guideNote}>Land above the lunar pad within 5 units.</p>
     </section>
     <section className={styles.guideSection} aria-label="Exploring">
       <h3>EXPLORING</h3>
       <p>Scroll to travel, or choose a destination.</p>
       <p>One finger drags objects; two fingers move along the tour.</p>
       <p className={styles.guideNote}>Flight currently requires a keyboard.</p>
     </section>
    </div>
    <div className={styles.guideActions}><button disabled={!ready} onClick={()=>{onReset();close();}}>RESET VIEW</button><button onClick={close}>BACK TO SPACE</button></div>
   </section>
  </dialog>
 </>;
}

"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import Link from 'next/link';
import {LoaderExperience} from '../loader/loader';
import {arcadeLayout} from '@/components/three/arcade/arcade-layout.mjs';
import './arcade.css';
export function ArcadeExperience(){
 const stage=useRef<HTMLDivElement>(null),[layout,setLayout]=useState(()=>arcadeLayout(1120,772));
 useEffect(()=>{const element=stage.current;if(!element)return;const resize=new ResizeObserver(([entry])=>{const {width,height}=entry.contentRect;setLayout(arcadeLayout(width,height));});resize.observe(element);return()=>resize.disconnect();},[]);
 const s=layout.screen;
 return <main className="arcade-page">
  <header className="arcade-page-header"><Link href="/" aria-label="Return to standard site">← STANDARD VIEW</Link><span>JAKE’S SPACE / ARCADE</span><span className="arcade-live">● LIVE UNIVERSE</span></header>
  <h1 className="sr-only">Jake’s Space Arcade</h1>
  <div className="arcade-stage" ref={stage} style={{'--screen-x':`${s.x}px`,'--screen-y':`${s.y}px`,'--screen-w':`${s.width}px`,'--screen-h':`${s.height}px`} as CSSProperties}>
   <LoaderExperience arcadeLayout={layout}/>
  </div>
  <p className="arcade-page-hint">L START · W A S D FLY · F FIRE · 1 / 2 / 3 WEAPONS<span>DRAG THE STICK OR HOLD A BUTTON</span></p>
 </main>;
}

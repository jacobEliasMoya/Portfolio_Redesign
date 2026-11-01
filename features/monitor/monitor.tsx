"use client";
import {useState} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {useReducedMotion} from '@/hooks/use-reduced-motion';
import type {ScreenEffect} from '@/components/three/monitor/monitor-scene';
import type {MonitorView} from '@/components/three/monitor/monitor-scene';
import './monitor.css';
const MonitorScene=dynamic(()=>import('@/components/three/monitor/monitor-scene'),{ssr:false});
export function MonitorExperience(){
 const [view,setView]=useState<MonitorView>('showcase'),[live,setLive]=useState(true),[effect,setEffect]=useState<ScreenEffect>('clean'),[strength,setStrength]=useState(60),reducedMotion=useReducedMotion();
 return <main className="monitor-page"><header className="monitor-header"><Link href="/">← STANDARD SITE</Link><h1>SILVER ORBIT</h1><span>MODEL / 01</span></header>
  <div className="monitor-stage" role="region" aria-label="Silver Orbit 3D monitor with a live interactive website on its display"><MonitorScene effect={effect} strength={strength/100} view={view} live={live} reducedMotion={reducedMotion}/></div>
  <footer className="monitor-toolbar"><div className="monitor-primary"><button onClick={()=>{setLive(true);setView(view==='screen'?'showcase':'screen');}}>{view==='screen'?'STEP BACK':'USE SCREEN'}</button><button aria-pressed={live} onClick={()=>setLive(v=>!v)}>{live?'SCREEN ON':'SCREEN OFF'}</button></div>
   <nav aria-label="Monitor model views">{(['showcase','front','rear','left','right','top','bottom'] as MonitorView[]).map(v=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{v==='showcase'?'3/4':v.toUpperCase()}</button>)}</nav><a className="monitor-download" href="/models/monitor/silver-orbit.glb" download>GET MODEL</a>
   <div className="monitor-effects" role="group" aria-label="Screen appearance">{(['clean','scanlines','phosphor','amber'] as ScreenEffect[]).map(mode=><button key={mode} aria-pressed={effect===mode} onClick={()=>setEffect(mode)}>{mode==='phosphor'?'GREEN PHOSPHOR':mode.toUpperCase()}</button>)}<label>SCANLINE STRENGTH <input aria-label="Scanline strength" type="range" min="0" max="100" step="5" value={strength} disabled={effect==='clean'} onChange={e=>setStrength(Number(e.target.value))}/><output>{strength}%</output></label></div>
   <p>{view==='screen'?'Click inside the display to play. Use its Guide for flight controls.':'Drag outside the display to orbit. USE SCREEN moves in to play.'}</p>
  </footer></main>;
}

"use client";
import { AdaptiveQuality } from "@/components/three/canvas/adaptive-quality";
import { Component, Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BlockMoon } from "@/components/three/moon";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
const views: Record<string,[number,number,number]> = {"Near side":[0,0,0],"Far side":[0,Math.PI,0],East:[0,-Math.PI/2,0],West:[0,Math.PI/2,0],"North pole":[Math.PI/2,0,0],"South pole":[-Math.PI/2,0,0]};
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<p role="alert">Moon preview could not load. <a href="/moon">Retry</a></p>:this.props.children;}
}
export function MoonPreview(){
  const [view,setView]=useState("Near side"),reducedMotion=useReducedMotion();
  return <main style={{background:"#000",color:"#eee",minHeight:"100dvh",padding:"1.5rem"}}>
    <Link href="/">← Back to Earth</Link><h1>Moon</h1><p>Drag to inspect. Scroll to zoom.</p>
    <div style={{display:"flex",gap:".6rem",flexWrap:"wrap"}}>{Object.keys(views).map((name)=><button key={name} aria-pressed={view===name} onClick={()=>setView(name)} style={{padding:".6rem",border:"1px solid #555",background:view===name?"#eee":"#181818",color:view===name?"#000":"#eee"}}>{name}</button>)}</div>
    <Boundary><div style={{height:"70dvh",minHeight:320}} role="img" aria-label="Lunar survey terrain built from overlapping beveled hexagons, with recessed craters and raised highlands.">
      <Canvas key={view} frameloop="demand" dpr={1} camera={{position:[0,0,11],fov:42}} fallback={<p>WebGL is unavailable.</p>}>
        <AdaptiveQuality reducedMotion={reducedMotion} monitor={false}/>
        <color attach="background" args={["#000"]}/><ambientLight intensity={.55}/><directionalLight position={[-7,5,6]} intensity={3.6}/><directionalLight position={[4,-1,-3]} intensity={.45}/>
        <Suspense fallback={null}><BlockMoon reducedMotion={reducedMotion} radius={3} rotation={views[view]}/></Suspense>
        <OrbitControls enablePan={false} minDistance={5} maxDistance={18} enableDamping={!reducedMotion}/>
      </Canvas>
    </div></Boundary><p style={{fontSize:".8rem",color:"#aaa"}}>NASA SVS / LRO / LOLA / LROC. Survey elevations exaggerated 24× for stylized relief.</p>
  </main>;
}

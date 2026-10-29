"use client";
import Link from "next/link";
import {Component,useEffect,useState,type ReactNode} from "react";
import {Canvas,useThree} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import {BlackHoleV2} from "@/components/three/black-hole/black-hole-v2";
import {BlackHole} from "@/components/three/black-hole/black-hole";
import {AdaptiveQuality} from "@/components/three/canvas/adaptive-quality";
import {useReducedMotion} from "@/hooks/use-reduced-motion";

const views:Record<string,[number,number,number]>={"Three-quarter":[6,4.5,11],Front:[0,2.2,13],Side:[12,1.6,0],Top:[.01,13,.01]};
function ViewCamera({view,wide}:{view:string;wide:boolean}){const camera=useThree(s=>s.camera),invalidate=useThree(s=>s.invalidate);useEffect(()=>{camera.position.set(...views[view]);if(wide)camera.position.multiplyScalar(1.45);camera.lookAt(0,0,0);camera.updateMatrixWorld();invalidate();},[camera,invalidate,view,wide]);return null;}
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<p role="alert">The black-hole preview could not load. <a href="/black-hole">Try again</a></p>:this.props.children;}}
export function BlackHolePreview(){
 const reducedMotion=useReducedMotion(),[view,setView]=useState("Three-quarter"),[paused,setPaused]=useState(false),[version,setVersion]=useState<1|2>(2),[lensing,setLensing]=useState(true);
 const button={minHeight:44,padding:".55rem .85rem",border:"1px solid #655744",background:"#171a1d",color:"#ddd"};
 return <main style={{minHeight:"100dvh",padding:"1.5rem",background:"#000",color:"#eee"}}>
  <Link href="/">← Back to Earth</Link><h1>Black hole</h1><p>Drag to inspect · Scroll to zoom</p>
  <div style={{display:"flex",gap:".5rem",flexWrap:"wrap"}}>{Object.keys(views).map(name=><button key={name} aria-pressed={view===name} onClick={()=>setView(name)} style={{...button,background:view===name?"#b88442":button.background,color:view===name?"#08090a":"#ddd"}}>{name}</button>)}<button disabled={reducedMotion} aria-pressed={paused||reducedMotion} onClick={()=>setPaused(v=>!v)} style={button}>{reducedMotion?"Orbit paused":paused?"Resume orbit":"Pause orbit"}</button></div>
  <div style={{display:"flex",gap:".5rem",flexWrap:"wrap",marginTop:".65rem"}}>{([1,2] as const).map(v=><button key={v} aria-pressed={version===v} onClick={()=>setVersion(v)} style={{...button,background:version===v?"#5e492e":button.background}}>{v===1?"Version 1 — Original":"Version 2 — Wide disc"}</button>)}{version===2&&<button aria-pressed={lensing} onClick={()=>setLensing(v=>!v)} style={button}>Light bending: {lensing?"on":"off"}</button>}</div>
  <Boundary><div style={{height:"75dvh",minHeight:320}} aria-label="Matte black hexagonal sphere surrounded by spiraling amber and graphite hex fragments.">
   <Canvas frameloop="demand" dpr={1} camera={{position:views["Three-quarter"],fov:40}} fallback={<p>WebGL is unavailable.</p>}>
    <AdaptiveQuality reducedMotion={reducedMotion}/><ViewCamera view={view} wide={version===2}/><color attach="background" args={["#000"]}/>
    <ambientLight intensity={.6}/><directionalLight position={[-4,6,6]} color="#dce4ec" intensity={3.4}/>
    <directionalLight position={[3,1,-4]} color="#ffa947" intensity={3}/><directionalLight position={[-5,-2,-3]} color="#c86f25" intensity={.7}/>
    {version===2?<BlackHoleV2 reducedMotion={reducedMotion} paused={paused} lensing={lensing}/>:<BlackHole reducedMotion={reducedMotion} paused={paused}/>}<OrbitControls target={[0,0,0]} minDistance={6} maxDistance={30} enableDamping={!reducedMotion}/>
   </Canvas>
  </div></Boundary>
 </main>;
}

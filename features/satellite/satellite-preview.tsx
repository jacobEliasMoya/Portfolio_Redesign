"use client";
import Link from "next/link";
import {Component,useEffect,useState,type ReactNode} from "react";
import {Canvas,useThree} from "@react-three/fiber";
import {OrbitControls,Environment,Lightformer} from "@react-three/drei";
import {ArchiveSatellite} from "@/components/three/satellite/archive-satellite";
import {AdaptiveQuality} from "@/components/three/canvas/adaptive-quality";
import {useReducedMotion} from "@/hooks/use-reduced-motion";

const views:Record<string,[number,number,number]>={"Three-quarter":[4,2.5,9],Front:[0,.3,10],Side:[9,.3,0],Rear:[-3,2,-9]};
function ViewCamera({view}:{view:string}){
 const camera=useThree(s=>s.camera),invalidate=useThree(s=>s.invalidate);
 useEffect(()=>{camera.position.set(...views[view]);camera.lookAt(0,.25,0);camera.updateMatrixWorld();invalidate();},[camera,invalidate,view]);
 return null;
}
class PreviewBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<p role="alert">The satellite could not load. <a href="/satellite">Reload preview</a></p>:this.props.children;}
}
export function SatellitePreview(){
 const reducedMotion=useReducedMotion(),[view,setView]=useState("Three-quarter");
 return <main style={{background:"#000",color:"#eee",minHeight:"100dvh",padding:"1.5rem"}}>
  <Link href="/">← Back to Earth</Link><h1>Archive satellite</h1>
  <p>Drag to inspect · Scroll to zoom</p>
  <div style={{display:"flex",gap:".5rem",flexWrap:"wrap"}}>{Object.keys(views).map(name=><button key={name} aria-pressed={view===name} onClick={()=>setView(name)} style={{minHeight:44,padding:".5rem .9rem",border:"1px solid #56636a",background:view===name?"#c4bba4":"#172027",color:view===name?"#111":"#eee"}}>{name}</button>)}</div>
  <PreviewBoundary><div style={{height:"74dvh",minHeight:320}} aria-label="Hexagonal archive satellite with a recessed monitor, solar wings and dish antenna.">
   <Canvas frameloop="demand" dpr={1} camera={{position:[4,2.5,9],fov:40}} fallback={<p>WebGL is unavailable.</p>}>
    <AdaptiveQuality reducedMotion={reducedMotion}/><ViewCamera view={view}/><color attach="background" args={["#000"]}/>
    <ambientLight intensity={.85}/><directionalLight position={[-3,5,6]} intensity={2.7} color="#fff4e0"/>
    <directionalLight position={[5,1,3]} intensity={1.4} color="#c6e0ed"/><directionalLight position={[0,3,-4]} intensity={2}/>
    <Environment resolution={128} frames={1}>
     <Lightformer position={[-3,5,4]} rotation={[Math.PI/4,Math.PI,0]} scale={[6,3,1]} intensity={2.5}/>
     <Lightformer position={[4,1,3]} rotation={[0,-Math.PI*.7,0]} scale={[2,5,1]} intensity={2}/>
    </Environment>
    <ArchiveSatellite/><OrbitControls target={[0,.25,0]} minDistance={4} maxDistance={16} enableDamping={!reducedMotion}/>
   </Canvas>
  </div></PreviewBoundary>
  <p style={{color:"#9ba6aa",fontSize:".85rem"}}>Illustrative archive display. The original website is not connected yet.</p>
 </main>;
}

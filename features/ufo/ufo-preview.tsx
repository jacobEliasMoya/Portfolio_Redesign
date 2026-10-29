"use client";
import { AdaptiveQuality } from "@/components/three/canvas/adaptive-quality";
import { Component, useState, type ReactNode } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { PilotMenu } from "@/components/three/ufo/pilot-menu";
import { PilotSaucer } from "@/components/three/ufo/pilot-saucer";
import {GearTestModel} from "@/components/three/ufo/gear-test-model";
import { type UFOType } from "@/components/three/ufo/ufo-model";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
const views:Record<string,[number,number,number]>={"Three-quarter":[5,3,6],Front:[0,.5,7],Rear:[0,.5,-7],Side:[7,.35,0],Top:[.01,7,.01],Underside:[4,-3.5,5]};
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};static getDerivedStateFromError(){return{failed:true};}
  render(){return this.state.failed?<p role="alert">The saucer preview could not load. <a href="/ufo">Retry</a></p>:this.props.children;}
}
export function UFOPreview(){
  const [type,setType]=useState<UFOType>("v3");
  const [gearTest,setGearTest]=useState(0);
  const [view,setView]=useState("Three-quarter"),[hover,setHover]=useState(true),[pilot,setPilot]=useState(false),reducedMotion=useReducedMotion();
  return <main style={{minHeight:"100dvh",background:"#000",color:"#eee",padding:"1.5rem"}}>
    <Link href="/">← Back to Earth</Link><h1>Hexagonal saucer</h1><p>Open the flight deck to pilot, or drag to inspect the model. Scroll to zoom.</p>
    <div style={{display:"flex",gap:".6rem",flexWrap:"wrap"}}>{Object.keys(views).map((name)=><button key={name} aria-pressed={view===name} onClick={()=>setView(name)} style={{padding:".6rem",minHeight:44,border:"1px solid #555",background:view===name?"#eee":"#181818",color:view===name?"#000":"#eee"}}>{name}</button>)}<button disabled={reducedMotion} aria-pressed={hover&&!reducedMotion} onClick={()=>setHover((value)=>!value)} style={{padding:".6rem",background:"#181818",color:"#eee",border:"1px solid #555"}}>Hover: {hover&&!reducedMotion?"on":"off"}</button></div>
    <div style={{display:"flex",gap:".6rem",marginTop:".75rem"}}>{([["v3","Version 3 — Angular"],["reference","Reference rebuild"],["hexagonal","Current hexagonal"]] as const).map(([value,label])=><button key={value} disabled={pilot} aria-pressed={type===value} onClick={()=>setType(value)} style={{padding:".65rem",minHeight:44,background:type===value?"#a8e6e8":"#181818",color:type===value?"#10191b":"#eee",border:"1px solid #566"}}>{label}</button>)}</div>
    <button disabled={pilot} onClick={()=>setGearTest(value=>value+1)} style={{padding:".65rem",minHeight:44,marginTop:".75rem",background:"#18272b",color:"#b9f2ec",border:"1px solid #566"}}>Test landing gear</button>
    <Boundary><div style={{height:"72dvh",minHeight:320,position:"relative"}} aria-label="Hexagonal silver flying saucer with cyan cockpit, rim lights and underside engine.">
      <Canvas key={`${view}-${pilot}`} frameloop="demand" dpr={1} camera={{position:pilot?[0,4,14]:views[view],fov:42}} fallback={<p>WebGL is unavailable.</p>}>
        <AdaptiveQuality reducedMotion={reducedMotion}/>
        <color attach="background" args={["#000"]}/><ambientLight intensity={1.4}/>
        <directionalLight position={[-4,6,5]} intensity={4}/><directionalLight position={[5,1,-4]} intensity={2} color="#a7d9ef"/><directionalLight position={[1,-5,3]} intensity={1.8}/>
        <Environment resolution={128} frames={1}>
          <Lightformer position={[-4,5,2]} rotation={[Math.PI/2,0,0]} scale={[8,3,1]} intensity={3}/>
          <Lightformer position={[4,2,-2]} rotation={[0,-Math.PI/2,0]} scale={[3,6,1]} color="#b3d8ef" intensity={2}/>
          <Lightformer position={[0,1,5]} rotation={[0,Math.PI,0]} scale={[7,1,1]} intensity={1.5}/>
        </Environment>
        {pilot?<PilotSaucer type={type} active reducedMotion={reducedMotion} scale={.45}/>:<GearTestModel type={type} serial={gearTest} hover={hover} reducedMotion={reducedMotion}/>}
        <OrbitControls enabled={!pilot} target={[0,.2,0]} enablePan={false} minDistance={3.2} maxDistance={14} enableDamping={!reducedMotion}/>
      </Canvas>
      <PilotMenu active={pilot} onToggle={()=>setPilot(v=>!v)}/>
    </div></Boundary>
    <p style={{fontSize:".85rem",color:"#aaa"}}>An original retro saucer inspired by classic science fiction and the playful mood of <a href="https://destroyallhumans2.thqnordic.com/" style={{textDecoration:"underline"}}>Destroy All Humans!</a></p>
  </main>;
}

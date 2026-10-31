"use client";
import { ProceduralStarfield } from "@/components/three/space/procedural-starfield";
import { AdaptiveQuality } from "@/components/three/canvas/adaptive-quality";

import { Component, Suspense, useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import { Vector3 } from "three";
import type { RefObject } from "react";
import { FollowSceneCamera } from "./follow-scene-camera";
import { Canvas, useThree } from "@react-three/fiber";
import {createHudLetteringStore,HudLetteringProvider,HudLetteringLayer} from "@/components/three/ufo/hud-lettering";
import { ArcadeHud } from "@/components/three/ufo/arcade-hud";
import {createHudState} from "@/components/three/ufo/hud-state.mjs";
import { PilotSaucer } from "@/components/three/ufo/pilot-saucer";
import { OrbitingMoon } from "@/components/three/moon";
import { CloudLayer } from "@/components/three/clouds";
import { BlockEarth } from "@/components/three/planet";
import { ParticleWordmark, type IntroPhase } from "@/components/three/objects/particle-wordmark";
import { Button } from "@/components/ui/atoms/button";

function EarthBackdrop({ reducedMotion, onRevealed, earthReady, piloting }: { reducedMotion: boolean; onRevealed: () => void; earthReady: boolean; piloting: boolean }) {
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  return <BlockEarth position={[0, 0.35, -9]} radius={Math.min(6.5, aspect * 9.4)} autoRotate draggable={!piloting} revealed onRevealed={onRevealed} reducedMotion={reducedMotion}><CloudLayer enabled={earthReady} reducedMotion={reducedMotion} /></BlockEarth>;
}

function LunarCompanion({ enabled, reducedMotion, piloting }: { enabled: boolean; reducedMotion: boolean; piloting:boolean }) {
  const aspect = useThree((state)=>state.size.width/Math.max(1,state.size.height));
  return <OrbitingMoon draggable={!piloting} earthRadius={Math.min(6.5,aspect*9.4)} enabled={enabled} reducedMotion={reducedMotion} />;
}

function FlightCompanion({hudStore,actionRequest,launchCameraReady,active,visible,reducedMotion,trackPositionRef,trackHeadingRef,trackUpRef}:{hudStore:ReturnType<typeof createHudState>;actionRequest:number;launchCameraReady:RefObject<boolean>;active:boolean;visible:boolean;reducedMotion:boolean;trackPositionRef:RefObject<Vector3>;trackHeadingRef:RefObject<Vector3>;trackUpRef:RefObject<Vector3>}) {
 const aspect=useThree(s=>s.size.width/Math.max(1,s.size.height));
 return <PilotSaucer hudStore={hudStore} actionRequest={actionRequest} type="v3" launchCameraReady={launchCameraReady} trackUpRef={trackUpRef} trackHeadingRef={trackHeadingRef} trackPositionRef={trackPositionRef} active={active} visible={visible} reducedMotion={reducedMotion} center={[0,.35,-9]} earthRadius={Math.min(6.5,aspect*9.4)} scale={.38}/>;
}

function Failure() {
  return <div className="loader-failure" role="alert"><p>The 3D scene couldn’t load.</p><Button onClick={() => window.location.reload()}>Try again</Button><a href="/studio">Continue to preview</a></div>;
}

class LoaderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Failure /> : this.props.children; }
}

export default function LoaderScene({ reducedMotion, replay, zoomSteps, zoomReset, assetsReady, onPhaseChange, onPrepared, onComplete, earthReady, onEarthReady }: {
  reducedMotion: boolean; replay: number; zoomSteps: number; zoomReset: number; assetsReady: boolean; onPhaseChange: (phase: IntroPhase) => void; onPrepared: () => void; onComplete: () => void; earthReady: boolean; onEarthReady: () => void;
}) {
  const [piloting,setPiloting]=useState(false),[actionRequest,setActionRequest]=useState(0),[tourRequest,setTourRequest]=useState({serial:0,progress:0}),[viewReset,setViewReset]=useState(0);
  const hudStore=useMemo(()=>createHudState(),[]),lettering=useMemo(()=>createHudLetteringStore(),[]);
  const launchCameraReady=useRef(false);
  const flightPosition=useRef(new Vector3()),flightHeading=useRef(new Vector3(0,0,-1)),flightUp=useRef(new Vector3(0,1,0));
  const [flightReady,setFlightReady]=useState(false);
  useEffect(()=>{
    if(!flightReady||piloting)return;
    const launch=(event:KeyboardEvent)=>{
      const target=event.target;
      if(event.code!=="KeyL"||event.repeat||event.ctrlKey||event.metaKey||event.altKey||
        (target instanceof HTMLElement&&(target.isContentEditable||target.closest("input,textarea,select,dialog"))))return;
      event.preventDefault();setPiloting(true);
    };
    window.addEventListener("keydown",launch);
    return()=>window.removeEventListener("keydown",launch);
  },[flightReady,piloting]);
  return <LoaderBoundary><HudLetteringProvider store={lettering}><Canvas dpr={1} frameloop="demand" camera={{ position: [0, 0, 22], fov: 40 }} gl={{ antialias: true, alpha: false }} fallback={<Failure />}>
    <AdaptiveQuality reducedMotion={reducedMotion}/>
    <FollowSceneCamera hudStore={hudStore} tourRequest={tourRequest} launchCameraReady={launchCameraReady} piloting={piloting} targetRef={flightPosition} headingRef={flightHeading} upRef={flightUp} ready={flightReady} reducedMotion={reducedMotion} zoomSteps={zoomSteps} zoomReset={zoomReset+viewReset}/>
    <color attach="background" args={["#000000"]} />
    <ProceduralStarfield/>
    <ambientLight intensity={0.8} />
    <directionalLight position={[3, 5, 6]} intensity={4} color="#ffffff" />
    <directionalLight position={[-4, 0, 3]} intensity={1.7} color="#c6d0df" />
    <directionalLight position={[1, -3, -2]} intensity={2} color="#ffffff" />
    <Suspense fallback={null}><EarthBackdrop piloting={piloting} earthReady={earthReady} onRevealed={onEarthReady} reducedMotion={reducedMotion} /></Suspense>
    <Suspense fallback={null}><LunarCompanion piloting={piloting} enabled={earthReady} reducedMotion={reducedMotion} /></Suspense>
    <Suspense fallback={null}><ParticleWordmark shipPositionRef={flightPosition} piloting={piloting} startRequested={earthReady} reducedMotion={reducedMotion} replay={replay} assetsReady={assetsReady} onPhaseChange={onPhaseChange} onPrepared={onPrepared} onComplete={() => { setFlightReady(true); onComplete(); }} /></Suspense>
    <FlightCompanion hudStore={hudStore} actionRequest={actionRequest} trackUpRef={flightUp} launchCameraReady={launchCameraReady} trackHeadingRef={flightHeading} trackPositionRef={flightPosition} active={piloting} visible={earthReady} reducedMotion={reducedMotion}/>
  </Canvas>
    <HudLetteringLayer store={lettering} reducedMotion={reducedMotion}/>
    <ArcadeHud store={hudStore} ready={flightReady&&assetsReady} piloting={piloting} reducedMotion={reducedMotion}
      onPilot={()=>setPiloting(value=>!value)}
      onAction={()=>{if(!piloting)setPiloting(true);else setActionRequest(value=>value+1);}}
      onReset={()=>{setViewReset(value=>value+1);setTourRequest(value=>({serial:value.serial+1,progress:0}));}}
      onTour={progress=>setTourRequest(value=>({serial:value.serial+1,progress}))}/>
  </HudLetteringProvider></LoaderBoundary>;
}

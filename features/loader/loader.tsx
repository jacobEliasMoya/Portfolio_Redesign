"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useProgress } from "@react-three/drei";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import "./loader.css";
const LoaderScene = dynamic(() => import("@/components/three/scenes/loader-scene"), { ssr: false });
export function LoaderExperience() {
  const { progress, active, errors } = useProgress();
  const [prepared, setPrepared] = useState(false), [earthReady, setEarthReady] = useState(false), [assembled, setAssembled] = useState(false), [timedOut, setTimedOut] = useState(false);
  const [piloting,setPiloting]=useState(false);
  const [zoomSteps, setZoomSteps] = useState(0), [zoomReset, setZoomReset] = useState(0);
  const reducedMotion = useReducedMotion();
  const onPrepared = useCallback(() => setPrepared(true), []);
  const onEarthReady = useCallback(() => setEarthReady(true), []);
  const onComplete = useCallback(() => setAssembled(true), []);
  const onPhaseChange = useCallback(() => {}, []);
  useEffect(() => {
    if (prepared && earthReady) return;
    const timer = window.setTimeout(() => setTimedOut(true), 20000);
    return () => window.clearTimeout(timer);
  }, [prepared, earthReady]);
  const ready = earthReady && assembled && !active;
  const failed = errors.some((item) => item.startsWith("/models/jakes-space-particle-core.json") || item.startsWith("/models/earth/") || item.startsWith("/models/moon/")) || timedOut;
  const percent = prepared && !active ? 100 : Math.min(99, Math.round(progress));
  return <main className="loader-experience">
    <div className="loader-viewport" role="region" aria-label="A procedural starfield surrounds the scene. A block-built Earth appears first, then silver particles converge into Jakes Space around it. Drag in any direction to rotate Earth. A survey-derived Moon orbits with the same face always turned toward Earth.">
      <LoaderScene onPilotChange={setPiloting} zoomSteps={zoomSteps} zoomReset={zoomReset} reducedMotion={reducedMotion} replay={0} assetsReady={prepared && !active} onPhaseChange={onPhaseChange} onPrepared={onPrepared} onComplete={onComplete} earthReady={earthReady} onEarthReady={onEarthReady} />
    </div>
    <div className="loader-zoom" role="group" aria-label={piloting?"Scene zoom":"Scene tour"}>
      <button disabled={!ready} aria-label={piloting?"Zoom in":"Move forward on scene tour"} onClick={() => setZoomSteps((n) => n + 1)}>{piloting?"+":"Next"}</button>
      <button disabled={!ready} aria-label={piloting?"Zoom out":"Move backward on scene tour"} onClick={() => setZoomSteps((n) => n - 1)}>{piloting?"−":"Back"}</button>
      <button disabled={!ready} aria-label={piloting?"Reset zoom":"Return to start of scene tour"} onClick={() => setZoomReset((n) => n + 1)}>Reset</button>
    </div>
    {!piloting&&ready&&<p className="loader-tour-hint">SCROLL TO EXPLORE · BACK / NEXT TO TRAVEL</p>}
    <div className="loader-bottom" aria-label="Scene loading">
      <span className="loader-accessible-status" role="status">{failed ? "Scene loading failed" : ready ? "Scene ready. Scroll to travel through the scene; drag to rotate Earth. A survey-derived Moon orbits with the same face always turned toward Earth." : earthReady ? "Forming Jakes Space" : "Preparing Earth"}</span>
      <div className="loader-progress" role="progressbar" aria-label="Scene asset download" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{width: `${percent}%`}} /></div>
      {failed && <button className="loader-retry" onClick={() => window.location.reload()}>Retry loading scene</button>}
    </div>
  </main>;
}

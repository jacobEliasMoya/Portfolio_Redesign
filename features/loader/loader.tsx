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
  const failed = errors.some((item) => item.startsWith("/models/loading-jakes-world.json") || item.startsWith("/models/earth/")) || timedOut;
  const percent = prepared && !active ? 100 : Math.min(99, Math.round(progress));
  return <main className="loader-experience">
    <div className="loader-viewport" role="img" aria-label="A block-built Earth appears first, then silver particles converge into loading jakes world around it. Drag in any direction to rotate Earth.">
      <LoaderScene reducedMotion={reducedMotion} replay={0} assetsReady={prepared && !active} onPhaseChange={onPhaseChange} onPrepared={onPrepared} onComplete={onComplete} earthReady={earthReady} onEarthReady={onEarthReady} />
    </div>
    <div className="loader-bottom" aria-label="Scene loading">
      <span className="loader-accessible-status" role="status">{failed ? "Scene loading failed" : ready ? "Scene ready. Drag in any direction to rotate Earth." : earthReady ? "Forming loading jakes world" : "Preparing Earth"}</span>
      <div className="loader-progress" role="progressbar" aria-label="Scene asset download" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{width: `${percent}%`}} /></div>
      {failed && <button className="loader-retry" onClick={() => window.location.reload()}>Retry loading scene</button>}
    </div>
  </main>;
}

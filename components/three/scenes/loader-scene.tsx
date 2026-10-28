"use client";

import { Component, Suspense, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { CloudLayer } from "@/components/three/clouds";
import { BlockEarth } from "@/components/three/planet";
import { ParticleWordmark, type IntroPhase } from "@/components/three/objects/particle-wordmark";
import { Button } from "@/components/ui/atoms/button";

function EarthBackdrop({ reducedMotion, onRevealed, earthReady }: { reducedMotion: boolean; onRevealed: () => void; earthReady: boolean }) {
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  return <BlockEarth position={[0, 0.35, -9]} radius={Math.min(6.5, aspect * 9.4)} autoRotate draggable revealed onRevealed={onRevealed} reducedMotion={reducedMotion}><CloudLayer enabled={earthReady} reducedMotion={reducedMotion} /></BlockEarth>;
}

function Failure() {
  return <div className="loader-failure" role="alert"><p>The 3D scene couldn’t load.</p><Button onClick={() => window.location.reload()}>Try again</Button><a href="/studio">Continue to preview</a></div>;
}

class LoaderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Failure /> : this.props.children; }
}

export default function LoaderScene({ reducedMotion, replay, assetsReady, onPhaseChange, onPrepared, onComplete, earthReady, onEarthReady }: {
  reducedMotion: boolean; replay: number; assetsReady: boolean; onPhaseChange: (phase: IntroPhase) => void; onPrepared: () => void; onComplete: () => void; earthReady: boolean; onEarthReady: () => void;
}) {
  return <LoaderBoundary><Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ position: [0, 0.25, 12], fov: 40 }} gl={{ antialias: true, alpha: false }} fallback={<Failure />}>
    <color attach="background" args={["#000000"]} />
    <ambientLight intensity={0.8} />
    <directionalLight position={[3, 5, 6]} intensity={4} color="#ffffff" />
    <directionalLight position={[-4, 0, 3]} intensity={1.7} color="#c6d0df" />
    <directionalLight position={[1, -3, -2]} intensity={2} color="#ffffff" />
    <Suspense fallback={null}><EarthBackdrop earthReady={earthReady} onRevealed={onEarthReady} reducedMotion={reducedMotion} /></Suspense>
    <Suspense fallback={null}><ParticleWordmark startRequested={earthReady} reducedMotion={reducedMotion} replay={replay} assetsReady={assetsReady} onPhaseChange={onPhaseChange} onPrepared={onPrepared} onComplete={onComplete} /></Suspense>
  </Canvas></LoaderBoundary>;
}
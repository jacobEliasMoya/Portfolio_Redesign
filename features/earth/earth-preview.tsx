"use client";
import { AdaptiveQuality } from "@/components/three/canvas/adaptive-quality";
import { Component, Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BlockEarth } from "@/components/three/planet";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const views: Record<string, [number, number, number]> = {
  Americas: [0, Math.PI / 2, 0], Asia: [0, -Math.PI / 2, 0], Pacific: [0, Math.PI, 0],
  "Africa / Europe": [0, 0, 0], "North pole": [Math.PI / 2, 0, 0], "South pole": [-Math.PI / 2, 0, 0],
};
class EarthBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p role="alert">The Earth preview could not load. <a href="/earth">Retry</a></p> : this.props.children; }
}
export function EarthPreview() {
  const [view, setView] = useState("Americas");
  const reducedMotion = useReducedMotion();
  return <main style={{ background: "#000", color: "#eee", minHeight: "100dvh", padding: "1.5rem" }}>
    <Link href="/">← Back to loader</Link>
    <h1 style={{fontFamily: "var(--font-sabo-filled), monospace"}}>Earth</h1>
    <p>Drag to explore. Scroll to zoom.</p>
    <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
      {Object.keys(views).map((name) => <button key={name} aria-pressed={view === name} onClick={() => setView(name)} style={{padding: ".6rem", background: view === name ? "#eee" : "#181818", color: view === name ? "#000" : "#eee", border: "1px solid #555", cursor: "pointer"}}>{name}</button>)}
    </div>
    <EarthBoundary><div style={{height: "70dvh", minHeight: 320}} role="img" aria-label="Interactive hexagonal Earth with raised topography. Six view buttons show all sides.">
      <Canvas key={view} dpr={1} frameloop="demand" camera={{ position: [0, 0, 11], fov: 42 }} fallback={<p>WebGL is unavailable on this device.</p>}>
        <AdaptiveQuality reducedMotion={reducedMotion}/>
        <color attach="background" args={["#000"]} />
        <ambientLight intensity={1.3} />
        <directionalLight position={[-4, 6, 7]} intensity={3.5} />
        <directionalLight position={[5, 0, -3]} intensity={2} color="#73bfff" />

        <Suspense fallback={null}><BlockEarth axialTilt={false} rotation={views[view]} reducedMotion={reducedMotion} /></Suspense>
        <OrbitControls enablePan={false} minDistance={5} maxDistance={18} enableDamping={!reducedMotion} />
      </Canvas>
    </div></EarthBoundary>
    <p style={{fontSize: ".8rem", color: "#aaa"}}>Terrain and color: NASA Blue Marble / GEBCO. Hexagonal terrain with exaggerated elevation.</p>
  </main>;
}

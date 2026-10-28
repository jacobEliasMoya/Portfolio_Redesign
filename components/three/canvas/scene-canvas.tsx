"use client";
import { Component, Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { tokens } from "@/design-system/tokens";
function CanvasFallback() {
  return <div className="canvas-fallback" role="status">The 3D preview is unavailable. The design foundations are still available below.</div>;
}
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <CanvasFallback /> : this.props.children; }
}
export function SceneCanvas({ children, label }: { children: ReactNode; label: string }) {
  return <div className="scene-canvas" role="img" aria-label={label}><SceneBoundary>
    <Canvas dpr={tokens.scene.dpr} frameloop="demand" camera={{ position: tokens.scene.camera, fov: 38 }} fallback={<CanvasFallback />} gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={[tokens.color.background]} />
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  </SceneBoundary></div>;
}

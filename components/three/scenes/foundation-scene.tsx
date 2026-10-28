"use client";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, type ComponentRef } from "react";
import { SceneCanvas } from "@/components/three/canvas/scene-canvas";
import { PixelPlatform } from "@/components/three/objects/pixel-platform";
export default function FoundationScene({ reducedMotion, resetKey }: { reducedMotion: boolean; resetKey: number }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  useEffect(() => { controls.current?.reset(); }, [resetKey]);
  return <SceneCanvas label="Silver pixel platform with a green central cube. Drag to orbit; hover over the tiles to lift them.">
    <ambientLight intensity={1.2} />
    <directionalLight position={[4, 6, 3]} intensity={4} />
    <directionalLight position={[-4, 2, -3]} color="#b4c6ff" intensity={2} />
    <PixelPlatform reducedMotion={reducedMotion} />
    <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping={!reducedMotion} minDistance={5} maxDistance={16} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.1} />
  </SceneCanvas>;
}

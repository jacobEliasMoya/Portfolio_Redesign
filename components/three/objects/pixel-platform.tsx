"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { tokens } from "@/design-system/tokens";

/** Owns its local interaction; knows nothing about fetching or app readiness. */
export function PixelPlatform({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  useFrame((state, delta) => {
    if (!group.current) return;
    const target = hovered ? tokens.motion.hoverLift : 0;
    const next = reducedMotion ? target : MathUtils.damp(group.current.position.y, target, tokens.motion.damping, delta);
    group.current.position.y = Math.abs(next - target) < 0.001 ? target : next;
    if (group.current.position.y !== target) state.invalidate();
  });
  return <group>
    <mesh position={[0, -0.3, 0]}><boxGeometry args={[4.6, 0.18, 3.6]} /><meshStandardMaterial color={tokens.color.edge} roughness={0.6} metalness={0.5} /></mesh>
    <group ref={group} onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)}>
      {Array.from({ length: 9 }, (_, index) => <mesh key={index} position={[(index % 3 - 1) * 0.85, 0.12 + (index === 4 ? 0.45 : 0), (Math.floor(index / 3) - 1) * 0.85]}>
        <boxGeometry args={[0.7, index === 4 ? 1.05 : 0.25, 0.7]} />
        <meshStandardMaterial color={index === 4 ? tokens.color.accent : tokens.color.metal} metalness={0.65} roughness={0.3} />
      </mesh>)}
    </group>
  </group>;
}

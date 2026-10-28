"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Group, InstancedMesh, MathUtils, MeshStandardMaterial, Object3D, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { buildCloudLayer, buildCloudShape } from "./cloud-shapes.mjs";

export type CloudVariant = "billow" | "wisp" | "bank" | "spiral";
type Block = { position: number[]; normal?: number[]; size: number; shade: number };
function CloudBlocks({ blocks, enabled = true, reducedMotion = false, drift = false }: { blocks: Block[]; enabled?: boolean; reducedMotion?: boolean; drift?: boolean }) {
  const mesh = useRef<InstancedMesh>(null), group = useRef<Group>(null), material = useRef<MeshStandardMaterial>(null);
  const opacity = useRef(0);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 1, .055), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    if (!mesh.current) return;
    const transform = new Object3D(), color = new Color(), up = new Vector3(0,1,0), normal = new Vector3();
    blocks.forEach((block, i) => {
      transform.position.fromArray(block.position);
      if (block.normal) transform.quaternion.setFromUnitVectors(up, normal.fromArray(block.normal));
      else transform.quaternion.identity();
      transform.scale.setScalar(block.size); transform.updateMatrix(); mesh.current!.setMatrixAt(i, transform.matrix);
      color.setRGB(block.shade*.94, block.shade*.97, block.shade); mesh.current!.setColorAt(i,color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [blocks]);
  useFrame((state, delta) => {
    const dt = Math.min(delta,.1);
    opacity.current = reducedMotion ? Number(enabled) : MathUtils.damp(opacity.current, Number(enabled), 2.3, dt);
    if (material.current) material.current.opacity = opacity.current;
    if (group.current) {
      group.current.visible = opacity.current > .005;
      if (drift && enabled && !reducedMotion) { group.current.rotation.y += dt*.008; state.invalidate(); }
    }
    if (Math.abs(opacity.current-Number(enabled))>.001) state.invalidate();
  });
  return <group ref={group} visible={enabled}>
    <instancedMesh ref={mesh} args={[undefined,undefined,blocks.length]} frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial ref={material} roughness={.82} metalness={.02} transparent opacity={0} alphaTest={.02} depthWrite />
    </instancedMesh>
  </group>;
}
/** Reusable standalone cloud sculpture in local units. */
export function CloudShape({ variant = "billow", seed = 1, reducedMotion = false }: { variant?: CloudVariant; seed?: number; reducedMotion?: boolean }) {
  const blocks = useMemo(() => buildCloudShape(variant,seed), [variant,seed]);
  return <CloudBlocks blocks={blocks} reducedMotion={reducedMotion} />;
}
/** Place inside BlockEarth: its parent already supplies radius, drag, axial tilt and spin. */
export function CloudLayer({ enabled = true, reducedMotion = false }: { enabled?: boolean; reducedMotion?: boolean }) {
  const blocks = useMemo(() => buildCloudLayer(), []);
  return <CloudBlocks blocks={blocks} enabled={enabled} reducedMotion={reducedMotion} drift />;
}

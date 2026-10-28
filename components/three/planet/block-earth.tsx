"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Color, FileLoader, Group, InstancedMesh, MathUtils, Object3D, Quaternion, SRGBColorSpace, Vector3 } from "three";
import { applyEarthDrag, EARTH_AXIAL_TILT, EARTH_IDLE_SPEED } from "./earth-rotation.mjs";
import { easePulse } from "@/components/three/animation/letter-pulse.mjs";
import { getOceanRipple } from "./ocean-ripple.mjs";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

type EarthVolume = { version: number; radius: number; positions: number[]; normals: number[]; sizes: number[]; colors: number[]; oceanMask: number[] };
function parseEarth(raw: unknown): EarthVolume {
  if (typeof raw !== "string") throw new Error("Invalid Earth asset response");
  const data = JSON.parse(raw) as EarthVolume;
  const count = data.sizes?.length;
  if (!Array.isArray(data.oceanMask) || data.oceanMask.length !== count || !data.oceanMask.every((n) => n === 0 || n === 1)) throw new Error("Invalid Earth ocean mask");
  if (data.version !== 1 || data.radius !== 3 || !count || count > 40000 ||
    ![data.positions, data.normals, data.colors].every((a) => Array.isArray(a) && a.length === count * 3 && a.every(Number.isFinite)) ||
    !data.sizes.every((n) => Number.isFinite(n) && n > 0 && n < 1) ||
    !data.colors.every((n) => n >= 0 && n <= 1)) throw new Error("Invalid Earth cube volume");
  return data;
}

export type BlockEarthProps = {
  children?: ReactNode;
  radius?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  revealed?: boolean;
  reducedMotion?: boolean;
  autoRotate?: boolean;
  axialTilt?: boolean;
  draggable?: boolean;
  onRevealed?: () => void;
};

/** Real, beveled cube instances; map-derived continents and raised relief on all six sides. */
export function BlockEarth({ children, radius = 3, position = [0, 0, 0], rotation = [0, Math.PI / 2, 0], revealed = true, reducedMotion = false, autoRotate = false, axialTilt = true, draggable = false, onRevealed }: BlockEarthProps) {
  const raw = useLoader(FileLoader, "/models/earth/block-earth.json?revision=ocean-ripple-1");
  const data = useMemo(() => parseEarth(raw), [raw]);
  const ocean = useMemo(() => {
    // Epicenter in the Pacific; angle gives a continuous, seam-free surface distance.
    const source = new Vector3(-0.643, 0.174, -0.746).normalize();
    return data.oceanMask.flatMap((water, i) => water ? [{ index: i, angle: Math.acos(MathUtils.clamp(data.normals[i * 3] * source.x + data.normals[i * 3 + 1] * source.y + data.normals[i * 3 + 2] * source.z, -1, 1)) }] : []);
  }, [data]);
  const waveTime = useRef(0);
  const waveStrength = useRef(new Float32Array(data.sizes.length));
  const wavesMoved = useRef(false);
  const mesh = useRef<InstancedMesh>(null);
  const revealGroup = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const control = useRef<Group>(null);
  const orientation = useRef(new Quaternion());
  const dragging = useRef(false);
  const idleSpeed = useRef(0);
  const camera = useThree((state) => state.camera);
  const canvas = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const turn = useRef(0);
  useEffect(() => {
    if (!draggable) return;
    let pointer: number | null = null, lastX = 0, lastY = 0;
    const down = (event: PointerEvent) => { if (event.button !== 0 || pointer !== null) return; pointer = event.pointerId; lastX = event.clientX; lastY = event.clientY; dragging.current = true; canvas.setPointerCapture(pointer); invalidate(); };
    const move = (event: PointerEvent) => { if (pointer !== event.pointerId) return; applyEarthDrag(orientation.current, event.clientX - lastX, event.clientY - lastY, camera.quaternion); lastX = event.clientX; lastY = event.clientY; invalidate(); };
    const up = (event: PointerEvent) => { if (pointer !== event.pointerId) return; pointer = null; dragging.current = false; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); };
    const previous = canvas.style.touchAction; canvas.style.setProperty("touch-action", "none");
    canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up); canvas.addEventListener("lostpointercapture", up);
    return () => { dragging.current = false; if (pointer !== null && canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer); canvas.style.setProperty("touch-action", previous); canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up); canvas.removeEventListener("lostpointercapture", up); };
  }, [canvas, draggable, invalidate, camera]);
  const amount = useRef(reducedMotion && revealed ? 1 : 0);
  const announced = useRef(false);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 1, 0.035), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    if (!mesh.current) return;
    const transform = new Object3D(), color = new Color();
    const normal = new Vector3(), up = new Vector3(0, 1, 0);
    for (let i = 0; i < data.sizes.length; i++) {
      transform.position.fromArray(data.positions, i * 3);
      normal.fromArray(data.normals, i * 3).normalize();
      transform.quaternion.setFromUnitVectors(up, normal);
      transform.scale.setScalar(data.sizes[i]);
      transform.updateMatrix();
      mesh.current.setMatrixAt(i, transform.matrix);
      color.setRGB(data.colors[i * 3], data.colors[i * 3 + 1], data.colors[i * 3 + 2], SRGBColorSpace);
      mesh.current.setColorAt(i, color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [data]);
  useFrame((state, delta) => {
    const animateWater = revealed && !reducedMotion;
    if (animateWater) waveTime.current += Math.min(delta, 0.1);
    if (mesh.current && (animateWater || wavesMoved.current)) {
      const matrices = mesh.current.instanceMatrix.array;
      for (const { index: i, angle } of ocean) {
        const strength = animateWater ? easePulse(waveStrength.current[i], getOceanRipple(waveTime.current, angle), delta) : 0;
        waveStrength.current[i] = strength;
        // Translate outward along the cube's radial normal; never alter land or accumulate offsets.
        const lift = strength * 0.055;
        matrices[i * 16 + 12] = data.positions[i * 3] + data.normals[i * 3] * lift;
        matrices[i * 16 + 13] = data.positions[i * 3 + 1] + data.normals[i * 3 + 1] * lift;
        matrices[i * 16 + 14] = data.positions[i * 3 + 2] + data.normals[i * 3 + 2] * lift;
      }
      mesh.current.instanceMatrix.needsUpdate = true;
      wavesMoved.current = animateWater;
    }
    if (animateWater) state.invalidate();
    amount.current = reducedMotion ? Number(revealed) : MathUtils.damp(amount.current, Number(revealed), 3, Math.min(delta, 0.1));
    if (revealGroup.current) {
      revealGroup.current.visible = amount.current > 0.001;
      revealGroup.current.scale.setScalar(radius / data.radius * amount.current);
    }
    if (revealed && amount.current > 0.98 && !announced.current) { announced.current = true; onRevealed?.(); }
    const dt = Math.min(delta, 0.1);
    const desiredSpeed = autoRotate && !reducedMotion && revealed && !dragging.current ? EARTH_IDLE_SPEED : 0;
    idleSpeed.current = dragging.current || reducedMotion ? 0 : MathUtils.damp(idleSpeed.current, desiredSpeed, 2, dt);
    if (idleSpeed.current > 0.00001) { turn.current += dt * idleSpeed.current; state.invalidate(); }
    if (control.current) {
      if (reducedMotion) control.current.quaternion.copy(orientation.current);
      else control.current.quaternion.slerp(orientation.current, 1 - Math.exp(-7 * dt));
      if (control.current.quaternion.angleTo(orientation.current) > 0.0001) state.invalidate();
    }
    if (spin.current) {
      spin.current.rotation.y = reducedMotion ? turn.current : MathUtils.damp(spin.current.rotation.y, turn.current, 7, Math.min(delta, 0.1));
      if (Math.abs(spin.current.rotation.y - turn.current) > 0.0001) state.invalidate();
    }
    if (Math.abs(amount.current - Number(revealed)) > 0.001) state.invalidate();
  });
  return <group position={position}>
    <group ref={control}>
    <group rotation={[rotation[0], rotation[1], rotation[2] + (axialTilt ? EARTH_AXIAL_TILT : 0)]}>
    <group ref={revealGroup} scale={reducedMotion && revealed ? radius / data.radius : 0}>
      <group ref={spin}>
        <instancedMesh ref={mesh} args={[undefined, undefined, data.sizes.length]} frustumCulled={false}>
          <primitive object={geometry} attach="geometry" />
          <meshStandardMaterial roughness={0.58} metalness={0.08} />
        </instancedMesh>
        {children}
      </group>
    </group>
    </group>
    </group>
  </group>;
}

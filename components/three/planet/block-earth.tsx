"use client";
import {useObjectDrag} from "@/hooks/use-object-drag";
import { ImpactSmoke } from "./impact-smoke";
import { PLANET_HITS } from "./planet-explosion.mjs";
import { getProjectileTarget } from "@/components/three/ufo/projectile-collision.mjs";
import { useDestructibleInstances } from "@/hooks/use-destructible-instances";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Color, InstancedBufferAttribute, DynamicDrawUsage, FileLoader, Group, InstancedMesh, MathUtils, Object3D, Quaternion, SRGBColorSpace, Vector3 } from "three";
import { applyEarthDrag, EARTH_AXIAL_TILT, EARTH_IDLE_SPEED } from "./earth-rotation.mjs";
import { easePulse } from "@/components/three/animation/letter-pulse.mjs";
import { getOceanRipple } from "./ocean-ripple.mjs";
import { applyImpactGlow } from "./impact-material.mjs";
import { createHexagonalEarthGeometry } from "./hexagonal-earth-geometry.mjs";

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
  gravity?:boolean;
  gravityPower?:number;
};

/** Real, beveled hexagonal prism instances; map-derived continents and raised relief on all six sides. */
export function BlockEarth({ children, radius = 3, position = [0, 0, 0], rotation = [0, Math.PI / 2, 0], revealed = true, reducedMotion = false, autoRotate = false, axialTilt = true, draggable = false, onRevealed,gravity=true,gravityPower=1 }: BlockEarthProps) {
  const raw = useLoader(FileLoader, "/models/earth/block-earth.json?revision=ocean-ripple-1");
  const data = useMemo(() => parseEarth(raw), [raw]);
  const ocean = useMemo(() => {
    // Epicenter in the Pacific; angle gives a continuous, seam-free surface distance.
    const source = new Vector3(-0.643, 0.174, -0.746).normalize();
    return data.oceanMask.flatMap((water, i) => water ? [{ index: i, angle: Math.acos(MathUtils.clamp(data.normals[i * 3] * source.x + data.normals[i * 3 + 1] * source.y + data.normals[i * 3 + 2] * source.z, -1, 1)) }] : []);
  }, [data]);
  const waveTime = useRef(0), waveStep = useRef(0);
  const waveStrength = useRef(new Float32Array(data.sizes.length));
  const wavesMoved = useRef(false);
  const mesh = useRef<InstancedMesh>(null);
  const scorched=useDestructibleInstances(mesh,{foundation:2.94,blast:.3,padding:.065,mode:"dent",threshold:PLANET_HITS.earth});
  const revealGroup = useRef<Group>(null),interior=useRef<Group>(null),clouds=useRef<Group>(null);
  const spin = useRef<Group>(null);
  const control = useRef<Group>(null);
  const orientation = useRef(new Quaternion());
  const dragging = useRef(false);
  const idleSpeed = useRef(0);
  const camera = useThree((state) => state.camera);
  const turn = useRef(0);
  useObjectDrag({object:mesh,radius:data.radius*1.035,enabled:draggable&&revealed,
    available:()=>!mesh.current||((getProjectileTarget(mesh.current)?.planetPhase()??"intact")==="intact"),
    onStart:()=>{dragging.current=true;},onEnd:()=>{dragging.current=false;},
    onMove:({dx,dy})=>{applyEarthDrag(orientation.current,dx,dy,camera.quaternion);}
  });
  const amount = useRef(reducedMotion && revealed ? 1 : 0);
  const announced = useRef(false);
  const geometry = useMemo(() => {const tile=createHexagonalEarthGeometry();tile.setAttribute("impactHeat",new InstancedBufferAttribute(new Float32Array(data.sizes.length),1));return tile;}, [data.sizes.length]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    if (!mesh.current) return;
    mesh.current.instanceMatrix.setUsage(DynamicDrawUsage);
    const transform = new Object3D(), color = new Color();
    const normal = new Vector3(), up = new Vector3(0, 1, 0);
    for (let i = 0; i < data.sizes.length; i++) {
      transform.position.fromArray(data.positions, i * 3);
      normal.fromArray(data.normals, i * 3).normalize();
      transform.quaternion.setFromUnitVectors(up, normal);
      // Broader tangent faces overlap adjacent tiles; extra radial depth anchors wave crests.
      transform.scale.set(data.sizes[i] * 1.4, data.sizes[i] * 1.15, data.sizes[i] * 1.4);
      transform.updateMatrix();
      mesh.current.setMatrixAt(i, transform.matrix);
      color.setRGB(data.colors[i * 3], data.colors[i * 3 + 1], data.colors[i * 3 + 2], SRGBColorSpace);
      mesh.current.setColorAt(i, color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [data]);
  useFrame((state, delta) => {
    const phase=mesh.current?getProjectileTarget(mesh.current)?.stepPlanetExplosion(delta,reducedMotion)??"intact":"intact";
    if(interior.current)interior.current.visible=phase==="intact"||phase==="charging";
    if(clouds.current)clouds.current.visible=phase==="intact";
    if(phase==="charging"||phase==="exploding")state.invalidate();
    const animateWater = phase==="intact" && revealed && !reducedMotion;
    if (animateWater) { const dt=Math.min(delta,.1); waveTime.current += dt; waveStep.current += dt; }
    if (phase==="intact" && mesh.current && ((animateWater && waveStep.current >= 1/30) || (!animateWater && wavesMoved.current))) {
      const waterDelta=waveStep.current; waveStep.current=0;
      const matrices = mesh.current.instanceMatrix.array;
      for (const { index: i, angle } of ocean) {
        if(scorched.current.has(i))continue;
        const strength = animateWater ? easePulse(waveStrength.current[i], getOceanRipple(waveTime.current, angle), waterDelta) : 0;
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
    amount.current = reducedMotion ? Number(revealed) : MathUtils.damp(amount.current, Number(revealed), 7, Math.min(delta, 0.1));
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
        {/* Opaque foundation prevents background pinholes at patch seams and moving ocean crests. */}
        <group ref={interior}><mesh>
          <sphereGeometry args={[data.radius * 0.98, 64, 40]} />
          <meshStandardMaterial color="#073775" roughness={0.75} metalness={0.03} />
        </mesh></group>
        <object3D name="tour-california" position={[-2.175,1.946,-1.231]}/>
        <instancedMesh name="tour-earth" userData={{projectileGravity:{enabled:gravity,power:gravityPower,radius:data.radius,kind:"earth"}}} ref={mesh} args={[undefined, undefined, data.sizes.length]} frustumCulled={false}>
          <primitive object={geometry} attach="geometry" />
          <meshStandardMaterial roughness={0.58} metalness={0.08} onBeforeCompile={applyImpactGlow} customProgramCacheKey={()=>"earth-impact-glow-v3"} />
        </instancedMesh>
        <ImpactSmoke earth={mesh} reducedMotion={reducedMotion}/>
        <group ref={clouds}>{children}</group>
      </group>
    </group>
    </group>
    </group>
  </group>;
}
